export type RssItem = {
  title: string;
  url: string;
  publishedAt?: string;
  summary?: string;
  imageUrls?: string[];
  videoUrls?: string[];
  sourceFeed: string;
};

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function getTagText(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  const raw = m[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return decodeHtmlEntities(raw);
}

function getAtomLink(block: string): string | undefined {
  const mHref = block.match(/<link\b[^>]*href="([^"]+)"[^>]*\/?\s*>/i);
  if (mHref?.[1]) return mHref[1].trim();
  const mText = getTagText(block, "link");
  if (mText) return mText.trim();
  return undefined;
}

function normalizeUrl(url: string): string {
  return url.replace(/^http:\/\//i, "https://").trim();
}

function extractImageUrls(block: string): string[] {
  const found: string[] = [];

  const push = (u?: string) => {
    const url = typeof u === "string" ? normalizeUrl(u) : "";
    if (!url) return;
    if (found.includes(url)) return;
    found.push(url);
  };

  const enclosure = block.match(/<enclosure\b[^>]*url="([^"]+)"/i);
  push(enclosure?.[1]);

  const atomEnclosure = block.match(/<link\b[^>]*rel="enclosure"[^>]*href="([^"]+)"/i);
  push(atomEnclosure?.[1]);

  for (const m of block.matchAll(/<media:(?:content|thumbnail)\b[^>]*url="([^"]+)"/gi)) {
    push(m[1]);
  }

  for (const m of block.matchAll(/<img\b[^>]*src="([^"]+)"/gi)) {
    push(m[1]);
  }

  return found
    .filter((u) => /^https?:\/\//i.test(u))
    .filter((u) => !u.toLowerCase().startsWith("data:"))
    .slice(0, 6);
}

function extractVideoUrls(block: string): string[] {
  const found: string[] = [];

  const push = (u?: string) => {
    const url = typeof u === "string" ? normalizeUrl(u) : "";
    if (!url) return;
    if (found.includes(url)) return;
    found.push(url);
  };

  for (const m of block.matchAll(/<enclosure\b[^>]*url="([^"]+)"[^>]*type="video\/[^"]+"/gi)) {
    push(m[1]);
  }

  for (const m of block.matchAll(/<link\b[^>]*rel="enclosure"[^>]*href="([^"]+)"[^>]*type="video\/[^"]+"/gi)) {
    push(m[1]);
  }

  for (const m of block.matchAll(/<media:content\b[^>]*url="([^"]+)"[^>]*(?:medium="video"|type="video\/[^"]+")/gi)) {
    push(m[1]);
  }

  return found.filter((u) => /^https?:\/\//i.test(u)).slice(0, 4);
}

function isYouTubeWatchUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes("youtube.com/watch?") || u.includes("youtu.be/");
}

function parseRssItems(xml: string, feedUrl: string): RssItem[] {
  const items: RssItem[] = [];

  const rssItems = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((m) => m[0]);
  for (const block of rssItems) {
    const title = getTagText(block, "title");
    const url = getTagText(block, "link");
    const pub = getTagText(block, "pubDate") || getTagText(block, "published") || getTagText(block, "updated");
    const summary =
      getTagText(block, "description") ||
      getTagText(block, "content:encoded") ||
      getTagText(block, "content");

    if (title && url) {
      const imageUrls = extractImageUrls(block);
      const videoUrls = extractVideoUrls(block);
      items.push({ title, url, publishedAt: pub, summary, imageUrls, videoUrls, sourceFeed: feedUrl });
    }
  }

  const atomEntries = Array.from(xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)).map((m) => m[0]);
  for (const block of atomEntries) {
    const title = getTagText(block, "title");
    const url = getAtomLink(block);
    const pub = getTagText(block, "published") || getTagText(block, "updated");
    const summary = getTagText(block, "summary") || getTagText(block, "content");

    if (title && url) {
      const imageUrls = extractImageUrls(block);
      const extractedVideoUrls = extractVideoUrls(block);
      const videoUrls = extractedVideoUrls.length > 0 ? extractedVideoUrls : isYouTubeWatchUrl(url) ? [url] : [];
      items.push({ title, url, publishedAt: pub, summary, imageUrls, videoUrls, sourceFeed: feedUrl });
    }
  }

  return items;
}

export async function fetchRssItems(feedUrl: string, limit = 20): Promise<RssItem[]> {
  const res = await fetch(feedUrl, {
    headers: {
      "user-agent": "balao-info-blog-bot/1.0 (+https://www.balao.info/blog)",
      accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`RSS fetch failed: ${res.status} ${res.statusText}`);
  }

  const xml = await res.text();
  const items = parseRssItems(xml, feedUrl);

  const normalized = items
    .map((i) => ({
      ...i,
      url: normalizeUrl(i.url),
      imageUrls: (i.imageUrls || []).map(normalizeUrl),
      videoUrls: (i.videoUrls || []).map(normalizeUrl),
    }))
    .filter((i) => i.title && i.url);

  const sorted = normalized.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  return sorted.slice(0, Math.max(1, Math.min(100, limit)));
}

function getMetaContent(html: string, key: string): string | undefined {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const mProp = html.match(new RegExp(`<meta\\b[^>]*property=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i"));
  if (mProp?.[1]) return decodeHtmlEntities(mProp[1]).trim();
  const mName = html.match(new RegExp(`<meta\\b[^>]*name=["']${escaped}["'][^>]*content=["']([^"']+)["'][^>]*>`, "i"));
  if (mName?.[1]) return decodeHtmlEntities(mName[1]).trim();
  return undefined;
}

function extractG1VideoLinks(listingHtml: string): string[] {
  const found: string[] = [];
  const push = (u?: string) => {
    const url = typeof u === "string" ? normalizeUrl(u) : "";
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) return;
    if (!/g1\.globo\.com\/sp\/campinas-regiao\//i.test(url)) return;
    if (!/\/video\/.+\.ghtml/i.test(url)) return;
    if (found.includes(url)) return;
    found.push(url);
  };

  for (const m of listingHtml.matchAll(/href="(https?:\/\/g1\.globo\.com\/sp\/campinas-regiao\/[^"]+?\.ghtml)"/gi)) {
    push(m[1]);
  }
  for (const m of listingHtml.matchAll(/href="(\/sp\/campinas-regiao\/[^"]+?\.ghtml)"/gi)) {
    push(`https://g1.globo.com${m[1]}`);
  }

  return found;
}

export async function fetchCampinasVideoItems(limit = 20): Promise<RssItem[]> {
  const pages = [
    "https://g1.globo.com/sp/campinas-regiao/videos-bom-dia-cidade-campinas-e-piracicaba/",
    "https://g1.globo.com/sp/campinas-regiao/videos-jornal-da-eptv-1-edicao-campinas-e-piracicaba/",
    "https://g1.globo.com/sp/campinas-regiao/videos-jornal-da-eptv-2-edicao-campinas-e-piracicaba/",
  ];

  const listingHtmls = await Promise.all(
    pages.map(async (pageUrl) => {
      try {
        const res = await fetch(pageUrl, {
          headers: {
            "user-agent": "balao-info-blog-bot/1.0 (+https://www.balao.info/blog)",
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
          cache: "no-store",
        });
        if (!res.ok) return { pageUrl, html: "" };
        const html = await res.text();
        return { pageUrl, html };
      } catch {
        return { pageUrl, html: "" };
      }
    }),
  );

  const links: { url: string; sourceFeed: string }[] = [];
  for (const { pageUrl, html } of listingHtmls) {
    for (const u of extractG1VideoLinks(html)) {
      links.push({ url: u, sourceFeed: pageUrl });
    }
  }

  const seen = new Set<string>();
  const uniq = links.filter((x) => {
    if (seen.has(x.url)) return false;
    seen.add(x.url);
    return true;
  });

  const out: RssItem[] = [];
  const take = Math.max(1, Math.min(60, limit));

  for (let i = 0; i < uniq.length && out.length < take; i += 1) {
    const { url, sourceFeed } = uniq[i]!;
    try {
      const res = await fetch(url, {
        headers: {
          "user-agent": "balao-info-blog-bot/1.0 (+https://www.balao.info/blog)",
          accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        cache: "no-store",
      });
      if (!res.ok) continue;
      const html = await res.text();
      const title = getMetaContent(html, "og:title") || getMetaContent(html, "twitter:title") || "";
      if (!title) continue;
      const summary = getMetaContent(html, "og:description") || getMetaContent(html, "description") || undefined;
      const image = getMetaContent(html, "og:image") || getMetaContent(html, "twitter:image") || undefined;
      const ogVideo =
        getMetaContent(html, "og:video:secure_url") ||
        getMetaContent(html, "og:video:url") ||
        getMetaContent(html, "og:video") ||
        getMetaContent(html, "twitter:player") ||
        undefined;

      out.push({
        title,
        url,
        publishedAt: undefined,
        summary,
        imageUrls: image ? [normalizeUrl(image)] : [],
        videoUrls: ogVideo ? [normalizeUrl(ogVideo)] : [url],
        sourceFeed,
      });
    } catch {
      continue;
    }
  }

  return out.slice(0, take);
}
