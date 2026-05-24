export type RssItem = {
  title: string;
  url: string;
  publishedAt?: string;
  summary?: string;
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
    .replace(/<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>/gi, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\\s+/g, " ")
    .trim();
  return decodeHtmlEntities(raw);
}

function getAtomLink(block: string): string | undefined {
  const mHref = block.match(/<link\\b[^>]*href="([^"]+)"[^>]*\\/?\\s*>/i);
  if (mHref?.[1]) return mHref[1].trim();
  const mText = getTagText(block, "link");
  if (mText) return mText.trim();
  return undefined;
}

function parseRssItems(xml: string, feedUrl: string): RssItem[] {
  const items: RssItem[] = [];

  const rssItems = Array.from(xml.matchAll(/<item\\b[\\s\\S]*?<\\/item>/gi)).map((m) => m[0]);
  for (const block of rssItems) {
    const title = getTagText(block, "title");
    const url = getTagText(block, "link");
    const pub = getTagText(block, "pubDate") || getTagText(block, "published") || getTagText(block, "updated");
    const summary =
      getTagText(block, "description") ||
      getTagText(block, "content:encoded") ||
      getTagText(block, "content");

    if (title && url) {
      items.push({ title, url, publishedAt: pub, summary, sourceFeed: feedUrl });
    }
  }

  const atomEntries = Array.from(xml.matchAll(/<entry\\b[\\s\\S]*?<\\/entry>/gi)).map((m) => m[0]);
  for (const block of atomEntries) {
    const title = getTagText(block, "title");
    const url = getAtomLink(block);
    const pub = getTagText(block, "published") || getTagText(block, "updated");
    const summary = getTagText(block, "summary") || getTagText(block, "content");

    if (title && url) {
      items.push({ title, url, publishedAt: pub, summary, sourceFeed: feedUrl });
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
      url: i.url.replace(/^http:\/\//i, "https://"),
    }))
    .filter((i) => i.title && i.url);

  const sorted = normalized.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  return sorted.slice(0, Math.max(1, Math.min(100, limit)));
}

