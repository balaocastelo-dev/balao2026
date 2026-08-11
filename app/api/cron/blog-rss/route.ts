import { NextResponse } from "next/server";
import crypto from "crypto";
import { fetchRssItems, shouldSkipRssItemForBlog, type RssItem } from "@/lib/rss";
import { slugify } from "@/lib/blog-utils";
import { generateBlogPostFromRss } from "@/lib/blog-ai";
import { hasBlogSourceItem, insertBlogPost, insertBlogSourceItem } from "@/lib/db";
import { hasAdmin } from "@/lib/supabase-admin";

function isAuthorized(req: Request): boolean {
  const vercelCron = req.headers.get("x-vercel-cron");
  if (vercelCron) return true;

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  if (querySecret && querySecret === secret) return true;

  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ") && auth.slice("Bearer ".length) === secret) return true;

  return false;
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function extractFirstImageUrlFromHtml(html: string | null | undefined): string | null {
  const input = String(html || "");
  if (!input) return null;
  const m = input.match(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/i);
  const src = (m?.[1] || m?.[2] || m?.[3] || "").trim();
  return src ? src : null;
}

function normalizeTextForMatch(input: string): string {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseCsvEnv(name: string): string[] {
  return String(process.env[name] || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isCampinasRegionItem(item: RssItem): boolean {
  const feed = String(item.sourceFeed || "").toLowerCase();
  const url = String(item.url || "").toLowerCase();
  if (feed.includes("pox.globo.com/rss/g1/sp/campinas-regiao") || url.includes("/sp/campinas-regiao/") || url.includes("campinas-regiao")) return true;

  const keywords =
    parseCsvEnv("BLOG_RSS_CAMPINAS_KEYWORDS").length > 0
      ? parseCsvEnv("BLOG_RSS_CAMPINAS_KEYWORDS")
      : [
          "campinas",
          "sumare",
          "hortolandia",
          "indaiatuba",
          "americana",
          "santa barbara d'oeste",
          "santa barbara do oeste",
          "valinhos",
          "vinhedo",
          "paulinia",
          "jaguariuna",
          "cosmopolis",
          "nova odessa",
          "monte mor",
          "itapira",
          "mogi guacu",
          "mogi mirim",
          "amparo",
          "holambra",
          "pedreira",
          "limeira",
          "piracicaba",
        ];

  const hay = normalizeTextForMatch(`${item.title || ""} ${item.summary || ""}`);
  const hasKeyword = keywords.some((k) => hay.includes(normalizeTextForMatch(k)));
  if (hasKeyword) return true;

  if (url.includes("campinas") || url.includes("sumare") || url.includes("hortolandia") || url.includes("indaiatuba")) return true;
  return false;
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
  const withBreaks = raw.replace(/<br\b[^>]*\/?>/gi, "\n");

  let s = withBreaks
    .replace(/<(p|h2|h3|ul|ol|li|strong|em|blockquote|figure|figcaption)\b[^>]*>/gi, "<$1>")
    .replace(/<a\b[^>]*\bhref\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/gi, (_m, h1, h2, h3) => {
      const href = String(h1 || h2 || h3 || "").trim();
      return href ? `<a href="${href}">` : "<a>";
    })
    .replace(/<img\b([^>]*?)>/gi, (m) => {
      const srcMatch = m.match(/\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
      const altMatch = m.match(/\balt\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
      const src = String(srcMatch?.[1] || srcMatch?.[2] || srcMatch?.[3] || "").trim();
      const alt = String(altMatch?.[1] || altMatch?.[2] || "").trim();
      if (!src) return "";
      const altAttr = alt ? ` alt="${alt.replace(/"/g, "")}"` : "";
      return `<img src="${src}"${altAttr}>`;
    });

  s = s.replace(/<(?!\/?(?:p|h2|h3|ul|ol|li|strong|em|a|img|blockquote|figure|figcaption)\b)[^>]+>/gi, "");
  s = s.replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  return s;
}

async function fetchOriginalArticleHtml(url: string): Promise<string | null> {
  const u = String(url || "").trim();
  if (!u) return null;

  const res = await fetch(u, {
    headers: {
      "user-agent": "balao-info-blog-bot/1.0 (+https://www.balao.info/blog)",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const html = await res.text();
  const cleaned = removeDangerousBlocks(html);

  const body =
    findTagBlock(cleaned, "div", /\bitemprop=["']articleBody["']/i) ||
    findTagBlock(cleaned, "div", /\bmc-article-body\b/i) ||
    findTagBlock(cleaned, "div", /\bcontent-text__container\b/i) ||
    findTagBlock(cleaned, "article", /<article\b/i) ||
    "";

  const inner = stripWrapperTag(body);
  const normalized = normalizeArticleHtml(inner);
  if (normalized.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().length < 300) return null;
  return normalized;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasAdmin) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        skipped: true,
        reason: "Supabase admin não configurado. Blog funciona em modo dinâmico sem persistência.",
      });
    }

    if (process.env.BLOG_AGENT_RSS_ENABLED === "false") {
      return NextResponse.json({ ok: true, skipped: true, reason: "BLOG_AGENT_RSS_ENABLED=false" });
    }

    const mode = String(process.env.BLOG_RSS_AGENT_MODE || "campinas")
      .trim()
      .toLowerCase();

    const feedsFromEnv = parseCsvEnv("BLOG_RSS_FEEDS");
    const feeds =
      feedsFromEnv.length > 0
        ? feedsFromEnv
        : mode === "campinas"
          ? ["https://pox.globo.com/rss/g1/sp/campinas-regiao"]
          : ["https://www.adrenaline.com.br/feed/", "https://www.tecmundo.com.br/rss", "https://canaltech.com.br/rss/"];

    const startIndex = Math.abs(new Date().getUTCMinutes()) % feeds.length;

    let items: RssItem[] = [];
    let feedUrl = feeds[startIndex]!;
    let lastError: string | null = null;
    for (let attempt = 0; attempt < feeds.length; attempt += 1) {
      const idx = (startIndex + attempt) % feeds.length;
      const tryUrl = feeds[idx]!;
      try {
        const fetched = await fetchRssItems(tryUrl, 30);
        feedUrl = tryUrl;
        items = fetched;
        if (items.length > 0) break;
      } catch (e: any) {
        lastError = e?.message ? String(e.message) : "RSS fetch failed";
        continue;
      }
    }

    if (items.length === 0) {
      if (lastError) {
        return NextResponse.json({ ok: false, error: lastError, feedUrl }, { status: 502 });
      }
      return NextResponse.json({ ok: true, inserted: 0, feedUrl, message: "Sem itens no feed" });
    }

    const filteredItems = mode === "campinas" ? items.filter(isCampinasRegionItem) : items;
    if (filteredItems.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, feedUrl, message: "Nenhum item da região encontrado no feed" });
    }

    for (const item of filteredItems) {
      if (shouldSkipRssItemForBlog(item)) continue;
      const sourceHash = sha256(item.url);
      const exists = await hasBlogSourceItem({ source_type: "rss", source_hash: sourceHash });
      if (exists) continue;

      if (process.env.BLOG_RSS_KEEP_ORIGINAL_FORMAT !== "false") {
        try {
          const original = await fetchOriginalArticleHtml(item.url);
          if (original) {
            (item as any).summary = original;
            if (!Array.isArray(item.imageUrls) || item.imageUrls.length === 0) {
              const firstImg = extractFirstImageUrlFromHtml(original);
              if (firstImg) (item as any).imageUrls = [firstImg];
            }
          }
        } catch {}
      }

      const publishedAt = item.publishedAt ? new Date(item.publishedAt) : new Date();
      const publishedAtIso = Number.isFinite(publishedAt.getTime()) ? publishedAt.toISOString() : new Date().toISOString();

      const baseSlug = slugify(item.title).slice(0, 80);
      const slug = `${baseSlug}-${sourceHash.slice(0, 8)}`;
      const postUrl = `https://www.balao.info/blog/${slug}`;

      const generated = await generateBlogPostFromRss(item, { slug, publishedAtIso, url: postUrl });
      const cover = (item.imageUrls?.[0] ? String(item.imageUrls[0]) : null) || extractFirstImageUrlFromHtml(generated.content_html);

      const inserted = await insertBlogPost({
        slug,
        title: generated.title,
        excerpt: generated.excerpt,
        content_html: generated.content_html,
        cover_image: cover,
        category: generated.category,
        tags: generated.tags,
        status: "published",
        published_at: publishedAtIso,
        source_type: "rss",
        source_url: item.url,
        source_title: item.title,
        product_id: null,
        seo_title: generated.seo_title,
        seo_description: generated.seo_description,
        canonical_url: postUrl,
        json_ld: generated.json_ld,
        reading_time_minutes: generated.reading_time_minutes,
        internal_links: null,
      });

      try {
        await insertBlogSourceItem({
          source_type: "rss",
          source_url: item.url,
          source_hash: sourceHash,
          source_title: item.title,
          source_published_at: publishedAtIso,
        });
      } catch {}

      return NextResponse.json({
        ok: true,
        inserted: 1,
        feedUrl,
        slug: inserted.slug,
        id: inserted.id,
      });
    }

    return NextResponse.json({ ok: true, inserted: 0, feedUrl, message: "Nenhum item novo" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Erro" }, { status: 500 });
  }
}
