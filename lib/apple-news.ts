import crypto from "crypto";
import { unstable_cache } from "next/cache";
import { buildExcerptFromHtml, estimateReadingTimeMinutesFromHtml, slugify, stripHtmlToText } from "@/lib/blog-utils";
import { sanitizeHtmlBasic } from "@/lib/blog-sanitize";
import { fetchRssItems, type RssItem } from "@/lib/rss";

export type AppleNewsPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image: string | null;
  category: string;
  source_url: string;
  source_domain: string | null;
  source_feed: string;
  published_at: string;
  created_at: string;
  seo_title: string;
  seo_description: string;
  canonical_url: string;
  reading_time_minutes: number;
};

const APPLE_RADAR_FEEDS = [
  "https://macmagazine.com.br/feed/",
  "https://tecnoblog.net/feed/",
  "https://feeds.feedburner.com/canaltechbr",
  "https://www.tudocelular.com/feed/",
];

const APPLE_KEYWORDS = [
  "apple",
  "iphone",
  "ipad",
  "mac",
  "macbook",
  "imac",
  "mac mini",
  "watch",
  "apple watch",
  "ios",
  "ipados",
  "macos",
  "vision pro",
  "airpods",
  "wwdc",
  "siri",
  "icloud",
];

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function clip(input: string, max: number): string {
  const s = String(input || "").trim();
  if (s.length <= max) return s;
  return `${s.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function decodeHtmlEntities(input: string): string {
  return String(input || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function normalizeText(input: string): string {
  return decodeHtmlEntities(String(input || ""))
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function removeDangerousBlocks(input: string): string {
  return String(input || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, "")
    .replace(/<object\b[\s\S]*?<\/object>/gi, "")
    .replace(/<embed\b[\s\S]*?<\/embed>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/\son\w+=\S+/gi, "");
}

function findTagBlock(html: string, tag: string, openTagMatch: RegExp): string | null {
  const input = String(html || "");
  if (!input) return null;

  const openRe = new RegExp(`<${tag}\\b[^>]*>`, "ig");
  let m: RegExpExecArray | null;
  let startIdx = -1;
  let startTag = "";

  while ((m = openRe.exec(input)) !== null) {
    const openTag = m[0] || "";
    if (!openTagMatch.test(openTag)) continue;
    startIdx = m.index;
    startTag = openTag;
    break;
  }
  if (startIdx < 0) return null;

  const openOrCloseRe = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, "ig");
  openOrCloseRe.lastIndex = startIdx + startTag.length;

  let depth = 1;
  let endIdx = -1;
  while ((m = openOrCloseRe.exec(input)) !== null) {
    const token = m[0] || "";
    if (token.toLowerCase().startsWith(`</${tag}`)) depth -= 1;
    else depth += 1;
    if (depth === 0) {
      endIdx = openOrCloseRe.lastIndex;
      break;
    }
  }
  if (endIdx < 0) return null;
  return input.slice(startIdx, endIdx);
}

function stripWrapperTag(block: string): string {
  const s = String(block || "").trim();
  if (!s) return s;
  const openEnd = s.indexOf(">");
  const closeStart = s.lastIndexOf("</");
  if (openEnd < 0 || closeStart < 0 || closeStart <= openEnd) return s;
  return s.slice(openEnd + 1, closeStart).trim();
}

function normalizeArticleHtml(inputHtml: string): string {
  const raw = removeDangerousBlocks(inputHtml);

  let s = raw
    .replace(/<br\b[^>]*\/?>/gi, "\n")
    .replace(/<(p|h2|h3|ul|ol|li|strong|em|blockquote|figure|figcaption)\b[^>]*>/gi, "<$1>")
    .replace(/<a\b[^>]*>/gi, "<span>")
    .replace(/<\/a>/gi, "</span>")
    .replace(/<img\b([^>]*?)>/gi, (m) => {
      const srcMatch = m.match(/\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
      const altMatch = m.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const src = String(srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || "").trim();
      const alt = String(altMatch?.[1] || altMatch?.[2] || "").trim();
      if (!src) return "";
      const altAttr = alt ? ` alt="${alt.replace(/"/g, "")}"` : "";
      return `<img src="${src}"${altAttr}>`;
    });

  s = s.replace(/<(?!\/?(?:p|h2|h3|ul|ol|li|strong|em|span|img|blockquote|figure|figcaption)\b)[^>]+>/gi, "");
  s = s.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return sanitizeHtmlBasic(s);
}

async function fetchOriginalArticleHtml(url: string): Promise<string | null> {
  const u = String(url || "").trim();
  if (!u) return null;

  const res = await fetch(u, {
    headers: {
      "user-agent": "balao-info-apple-radar/1.0 (+https://www.balao.info/wendell/apple/blog)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const html = await res.text();
  const cleaned = removeDangerousBlocks(html);

  const body =
    findTagBlock(cleaned, "div", /\bentry-content\b/i) ||
    findTagBlock(cleaned, "div", /\btd-post-content\b/i) ||
    findTagBlock(cleaned, "div", /\bpost-content\b/i) ||
    findTagBlock(cleaned, "div", /\bcontent-text\b/i) ||
    findTagBlock(cleaned, "section", /\barticle-content\b/i) ||
    findTagBlock(cleaned, "article", /<article\b/i) ||
    "";

  const inner = stripWrapperTag(body);
  const normalized = normalizeArticleHtml(inner);
  if (stripHtmlToText(normalized).length < 500) return null;
  return normalized;
}

function hasPortugueseLanguageSignals(item: RssItem): boolean {
  const hay = normalizeText(`${item.title || ""} ${stripHtmlToText(String(item.summary || ""))}`);
  const signals = [" não ", " para ", " com ", " como ", " mais ", " será ", " lança ", " apple "];
  const padded = ` ${hay} `;
  return signals.some((signal) => padded.includes(signal));
}

function isCommercialAppleItem(item: RssItem): boolean {
  const hay = normalizeText(`${item.title || ""} ${stripHtmlToText(String(item.summary || ""))} ${item.url || ""}`);
  return /\b(oferta|ofertas|desconto|descontos|cupom|cupons|menor preco|menor preço|magalu|mercado livre|amazon|shopee|parcelado|cashback|achados)\b/i.test(
    hay,
  );
}

function getSourceDomain(sourceUrl: string | null | undefined): string | null {
  if (!sourceUrl) return null;
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}

function isAppleNewsItem(item: RssItem): boolean {
  const domain = getSourceDomain(item.url) || getSourceDomain(item.sourceFeed) || "";
  if (!domain) return false;
  if (isCommercialAppleItem(item)) return false;

  const hay = normalizeText(`${item.title || ""} ${item.summary || ""}`);
  const isPtSource =
    domain.includes("macmagazine.com.br") ||
    domain.includes("tecnoblog.net") ||
    domain.includes("canaltech.com.br") ||
    domain.includes("feedburner.com") ||
    domain.includes("tudocelular.com");

  return isPtSource && hasPortugueseLanguageSignals(item) && APPLE_KEYWORDS.some((keyword) => hay.includes(normalizeText(keyword)));
}

function categorizeAppleNews(item: RssItem): string {
  const hay = normalizeText(`${item.title || ""} ${item.summary || ""}`);

  if (hay.includes("iphone") || hay.includes("ios")) return "iPhone";
  if (hay.includes("ipad") || hay.includes("ipados")) return "iPad";
  if (hay.includes("watch") || hay.includes("watchos")) return "Apple Watch";
  if (hay.includes("macbook") || hay.includes("imac") || hay.includes("mac mini") || hay.includes("mac pro") || hay.includes("mac studio") || hay.includes("macos")) {
    return "Mac";
  }
  if (hay.includes("airpods") || hay.includes("homepod") || hay.includes("apple tv")) return "Ecossistema Apple";
  if (hay.includes("siri") || hay.includes("vision pro") || hay.includes("icloud") || hay.includes("wwdc")) {
    return "Atualizações Apple";
  }

  return "Universo Apple";
}

function getCategoryCoverImage(category: string): string {
  switch (category) {
    case "iPhone":
      return "/images/apple/subcategories/iphone-card.png";
    case "iPad":
      return "/images/apple/subcategories/ipad-card.png";
    case "Apple Watch":
      return "/images/apple/subcategories/watch-card.png";
    case "Mac":
      return "/images/apple/subcategories/macbook-card.png";
    default:
      return "/images/apple/hub-hero-real.png";
  }
}

async function buildAppleRadarHtml(item: RssItem): Promise<string> {
  const fromSource = await fetchOriginalArticleHtml(item.url).catch(() => null);
  if (fromSource && stripHtmlToText(fromSource).length >= 500) return fromSource;

  const fromFeed = normalizeArticleHtml(String(item.summary || ""));
  if (stripHtmlToText(fromFeed).length >= 250) return fromFeed;

  const fallback = sanitizeHtmlBasic(`<p>${clip(stripHtmlToText(String(item.summary || item.title || "")), 1200)}</p>`);
  return fallback;
}

async function toApplePost(item: RssItem): Promise<AppleNewsPost> {
  const sourceHash = sha256(item.url).slice(0, 8);
  const title = decodeHtmlEntities(String(item.title || "Notícia Apple")).replace(/\s+/g, " ").trim();
  const slug = `${slugify(title).slice(0, 72)}-${sourceHash}`;
  const category = categorizeAppleNews(item);
  const contentHtml = await buildAppleRadarHtml(item);
  const excerpt =
    buildExcerptFromHtml(contentHtml, 180) ||
    `Leia a notícia completa sobre Apple e acompanhe as principais atualizações do setor.`;
  const published = item.publishedAt ? new Date(item.publishedAt) : new Date();
  const publishedIso = Number.isFinite(published.getTime()) ? published.toISOString() : new Date().toISOString();
  const sourceDomain = getSourceDomain(item.url);
  const canonicalUrl = `https://www.balao.info/wendell/apple/blog/${slug}`;

  return {
    id: sha256(`apple-radar:${item.url}`),
    slug,
    title,
    excerpt,
    content_html: contentHtml,
    cover_image: getCategoryCoverImage(category),
    category,
    source_url: item.url,
    source_domain: sourceDomain,
    source_feed: item.sourceFeed,
    published_at: publishedIso,
    created_at: publishedIso,
    seo_title: clip(`${title} | Blog Apple`, 60),
    seo_description: clip(excerpt, 155),
    canonical_url: canonicalUrl,
    reading_time_minutes: estimateReadingTimeMinutesFromHtml(contentHtml),
  };
}

const getCachedAppleRadarPosts = unstable_cache(
  async () => {
  const allItems = await Promise.all(
    APPLE_RADAR_FEEDS.map(async (feedUrl) => {
      try {
        return await fetchRssItems(feedUrl, 10);
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  const merged = allItems
    .flat()
    .filter(isAppleNewsItem)
    .filter((item) => {
      const key = String(item.url || "").trim();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (Date.parse(b.publishedAt || "") || 0) - (Date.parse(a.publishedAt || "") || 0))
    .slice(0, 24);

  return await Promise.all(merged.map(toApplePost));
  },
  ["apple-radar-posts-pt"],
  { revalidate: 1800 },
);

export async function listAppleRadarPosts(take = 30): Promise<AppleNewsPost[]> {
  const posts = await getCachedAppleRadarPosts();
  return posts.slice(0, Math.max(1, Math.min(posts.length, take)));
}

export async function getAppleRadarPostBySlug(slug: string): Promise<AppleNewsPost | null> {
  const posts = await listAppleRadarPosts(60);
  return posts.find((post) => post.slug === slug) || null;
}
