export type RssItem = {
  title: string;
  url: string;
  publishedAt?: string;
  summary?: string;
  imageUrls?: string[];
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

function getTagHtml(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i");
  const m = block.match(re);
  if (!m) return undefined;
  const raw = m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
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

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

function normalizeTextForMatch(input: string): string {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function shouldSkipRssItemForBlog(item: RssItem): boolean {
  const url = String(item.url || "").trim();
  const domain = getDomain(url);
  if (!url) return true;
  if (domain === "balao.info") return false;

  const title = normalizeTextForMatch(item.title || "");
  const summary = normalizeTextForMatch(item.summary || "");
  const hay = `${title} ${summary}`.trim();

  const isTooShort = summary.length < 80 && !/<(p|div|article|h\d|ul|ol|img)\b/i.test(String(item.summary || ""));
  if (isTooShort) return true;

  const thirdPartyCommerceDomains =
    /amazon\.|mercadolivre\.|meli\.|aliexpress\.|shopee\.|magazineluiza\.|magalu\.|kabum\.|americanas\.|submarino\.|casasbahia\.|pontofrio\.|extra\.|fastshop\.|carrefour\.|pichau\.|terabyte|alibaba\./i;
  if (thirdPartyCommerceDomains.test(url)) return true;

  const commerceSignals =
    /\b(oferta|ofertas|promocao|promocoes|promo|cupom|cupons|desconto|descontos|cashback|frete gratis|melhor preco|preco|parcelad|compre|comprar|vale a pena|review de compra|onde comprar|link de compra)\b/i;
  const hasPrice = /\br\$\s*\d/i.test(hay) || /\b\d{1,3}%\b/.test(hay);
  const hasAffiliate =
    /\b(utm_source|utm_medium|utm_campaign|ref=|aff|affiliate|afiliad|clickid|gclid|fbclid|_branch_match_id)\b/i.test(url);

  if (commerceSignals.test(hay) && (hasPrice || hasAffiliate)) return true;
  if (commerceSignals.test(title) && (hasPrice || thirdPartyCommerceDomains.test(hay))) return true;

  return false;
}

function parseRssItems(xml: string, feedUrl: string): RssItem[] {
  const items: RssItem[] = [];

  const rssItems = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)).map((m) => m[0]);
  for (const block of rssItems) {
    const title = getTagText(block, "title");
    const url = getTagText(block, "link");
    const pub = getTagText(block, "pubDate") || getTagText(block, "published") || getTagText(block, "updated");
    const summary =
      getTagHtml(block, "content:encoded") ||
      getTagHtml(block, "description") ||
      getTagHtml(block, "content");

    if (title && url) {
      const imageUrls = extractImageUrls(block);
      items.push({ title, url, publishedAt: pub, summary, imageUrls, sourceFeed: feedUrl });
    }
  }

  const atomEntries = Array.from(xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi)).map((m) => m[0]);
  for (const block of atomEntries) {
    const title = getTagText(block, "title");
    const url = getAtomLink(block);
    const pub = getTagText(block, "published") || getTagText(block, "updated");
    const summary = getTagHtml(block, "content") || getTagHtml(block, "summary") || getTagText(block, "summary") || getTagText(block, "content");

    if (title && url) {
      const imageUrls = extractImageUrls(block);
      items.push({ title, url, publishedAt: pub, summary, imageUrls, sourceFeed: feedUrl });
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
    }))
    .filter((i) => i.title && i.url);

  const sorted = normalized.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  return sorted.slice(0, Math.max(1, Math.min(100, limit)));
}
