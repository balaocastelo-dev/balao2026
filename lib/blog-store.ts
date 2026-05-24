import crypto from "crypto";
import { fetchRssItems, type RssItem } from "@/lib/rss";
import { slugify } from "@/lib/blog-utils";
import { generateBlogPostFromRss, generateBlogPostFromTrend } from "@/lib/blog-ai";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/db";
import { scrapeSiteProducts } from "@/lib/site-products";
import { generateBlogPostFromProduct } from "@/lib/blog-ai";

export type BlogPostView = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_html: string;
  cover_image: string | null;
  category: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  source_url: string | null;
  canonical_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  json_ld: any;
  reading_time_minutes: number | null;
};

type PostKind = "rss" | "product";
type AllowedCategory = "Início" | "Topic Trens" | "Hardware" | "Games" | "Mobile" | "Segurança" | "IA" | "Loja";

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = Number.parseInt(String(hex), 16);
      if (!Number.isFinite(code)) return _;
      try {
        return String.fromCodePoint(code);
      } catch {
        return _;
      }
    })
    .replace(/&#(\d+);/g, (_, dec) => {
      const code = Number.parseInt(String(dec), 10);
      if (!Number.isFinite(code)) return _;
      try {
        return String.fromCodePoint(code);
      } catch {
        return _;
      }
    });
}

function cleanText(input: string | null | undefined): string {
  return decodeHtmlEntities(String(input || ""))
    .replace(/\s+/g, " ")
    .replace(/\s+([,;:.!?)\]])/g, "$1")
    .replace(/([(\[])\s+/g, "$1")
    .trim();
}

function kindOfPost(p: BlogPostView): PostKind {
  const category = (p.category || "").toLowerCase();
  if (category.includes("ofertas balão") || category.includes("ofertas balao") || category === "loja") return "product";

  const src = (p.source_url || "").toLowerCase();
  if (src.includes("balao.info") && src.includes("/product/")) return "product";

  return "rss";
}

function sortByPublishedDesc(posts: BlogPostView[]): BlogPostView[] {
  return posts
    .slice()
    .sort((a, b) => (Date.parse(b.published_at) || 0) - (Date.parse(a.published_at) || 0));
}

function mixRssAndProductPosts(input: { rss: BlogPostView[]; products: BlogPostView[]; take: number; maxConsecutiveProducts?: number }): BlogPostView[] {
  const take = Math.max(1, input.take);
  const maxConsecutiveProducts = Math.max(1, Math.min(3, input.maxConsecutiveProducts ?? 1));

  const rss = sortByPublishedDesc(input.rss);
  const products = sortByPublishedDesc(input.products);

  let i = 0;
  let j = 0;
  let lastKind: PostKind | null = null;
  let streak = 0;
  const out: BlogPostView[] = [];

  while (out.length < take && (i < rss.length || j < products.length)) {
    if (i >= rss.length) {
      out.push(products[j++]!);
      lastKind = "product";
      streak = lastKind === "product" ? streak + 1 : 1;
      continue;
    }

    if (j >= products.length) {
      out.push(rss[i++]!);
      lastKind = "rss";
      streak = lastKind === "rss" ? streak + 1 : 1;
      continue;
    }

    const nextR = rss[i]!;
    const nextP = products[j]!;

    const mustPickRss = lastKind === "product" && streak >= maxConsecutiveProducts;
    if (mustPickRss) {
      out.push(nextR);
      i += 1;
      lastKind = "rss";
      streak = 1;
      continue;
    }

    const tR = Date.parse(nextR.published_at) || 0;
    const tP = Date.parse(nextP.published_at) || 0;

    if (tP > tR) {
      out.push(nextP);
      j += 1;
      if (lastKind === "product") streak += 1;
      else {
        lastKind = "product";
        streak = 1;
      }
      continue;
    }

    out.push(nextR);
    i += 1;
    if (lastKind === "rss") streak += 1;
    else {
      lastKind = "rss";
      streak = 1;
    }
  }

  return out;
}

function isSupabaseReadable(): boolean {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anon) return false;
  if (anon === "sb_invalid_key") return false;
  return anon.length > 40;
}

function getDefaultFeeds(): string[] {
  const fromEnv = (process.env.BLOG_RSS_FEEDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (fromEnv.length > 0) return fromEnv;

  return [
    "https://www.adrenaline.com.br/feed/",
    "https://www.tecmundo.com.br/rss",
    "https://canaltech.com.br/rss/",
    "https://olhardigital.com.br/feed/",
    "https://www.hardware.com.br/feed/",
    "https://g1.globo.com/dynamo/sp/campinas-e-regiao/rss2.xml",
    "https://www.acidadeon.com/campinas/feed/",
  ];
}

function normalizeCategory(input: string | null | undefined, hint?: { title?: string; sourceUrl?: string }): AllowedCategory {
  const c = cleanText(input || "");
  const raw = c.toLowerCase();
  const title = cleanText(hint?.title || "").toLowerCase();
  const source = cleanText(hint?.sourceUrl || "").toLowerCase();

  if (raw.includes("topic") || raw.includes("trend") || raw.includes("trens")) return "Topic Trens";
  if (raw.includes("hardware")) return "Hardware";
  if (raw.includes("game")) return "Games";
  if (raw.includes("mobile") || raw.includes("celular") || raw.includes("smartphone")) return "Mobile";
  if (raw.includes("segurança") || raw.includes("seguranca") || raw.includes("ciber")) return "Segurança";
  if (raw === "ia" || raw.includes("inteligência artificial") || raw.includes("inteligencia artificial")) return "IA";
  if (raw.includes("loja") || raw.includes("ofertas")) return "Loja";

  const looksCampinas =
    source.includes("campinas") ||
    title.includes("campinas") ||
    title.includes("cambui") ||
    title.includes("cambuí") ||
    title.includes("campinas e região") ||
    title.includes("campinas e regiao");
  if (looksCampinas) return "Início";

  if (source.includes("balao.info") && source.includes("/product/")) return "Loja";

  if (
    /gpu|placa de v|placa de ví|processador|intel|amd|ryzen|core i|ssd|nvme|mem[oó]ria|ram|fonte|placa-m[aã]e|motherboard|gabinete/i.test(
      title,
    )
  ) {
    return "Hardware";
  }
  if (/game|games|steam|xbox|playstation|ps5|nintendo|switch|fortnite|gta|cs2|valorant/i.test(title)) return "Games";
  if (/android|iphone|ios|smartphone|celular|galaxy|xiaomi|motorola|samsung/i.test(title)) return "Mobile";
  if (/seguran[cç]a|ciber|malware|phishing|ransomware|vazamento|hack/i.test(title)) return "Segurança";
  if (/\bia\b|chatgpt|openai|gemini|llama|copilot|intelig[eê]ncia artificial/i.test(title)) return "IA";

  return "Início";
}

function buildSlugFromRss(item: RssItem): string {
  const baseSlug = slugify(item.title).slice(0, 80);
  const sourceHash = sha256(item.url).slice(0, 8);
  return `${baseSlug}-${sourceHash}`;
}

function getTrendsFeedUrl(): string {
  return "https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR";
}

function buildSlugFromTrend(query: string, yyyymmdd: string): string {
  const baseSlug = slugify(query).slice(0, 70);
  const sourceHash = sha256(`${yyyymmdd}:${query}`).slice(0, 8);
  return `${baseSlug}-${yyyymmdd}-${sourceHash}`;
}

function prependImagesToHtml(contentHtml: string, imageUrls: string[]): string {
  const urls = (imageUrls || []).filter(Boolean).slice(0, 3);
  if (urls.length === 0) return contentHtml;
  if (/<img\b/i.test(contentHtml)) return contentHtml;

  const imgs = urls.map((u) => `<p><img src="${u}" alt="" /></p>`).join("");
  return `${imgs}${contentHtml}`;
}

async function buildDynamicTrendPosts(): Promise<BlogPostView[]> {
  try {
    const yyyymmdd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const items = await fetchRssItems(getTrendsFeedUrl(), 20);
    const top = items.slice(0, 5);
    const now = Date.now();

    const posts: BlogPostView[] = [];
    for (let idx = 0; idx < top.length; idx += 1) {
      const item = top[idx]!;
      const slug = buildSlugFromTrend(item.title, yyyymmdd);
      const publishedAtIso = new Date(now - idx * 60_000).toISOString();
      const postUrl = `https://www.balao.info/blog/${slug}`;

      const generated = await generateBlogPostFromTrend({
        query: item.title,
        publishedAtIso,
        url: postUrl,
        sourceUrl: item.url,
      });

      posts.push({
        id: sha256(`trend:${yyyymmdd}:${item.title}`),
        slug,
        title: generated.title,
        excerpt: generated.excerpt,
        content_html: generated.content_html,
        cover_image: null,
        category: normalizeCategory(generated.category, { title: generated.title, sourceUrl: item.url }),
        published_at: publishedAtIso,
        created_at: publishedAtIso,
        updated_at: publishedAtIso,
        source_url: item.url,
        canonical_url: postUrl,
        seo_title: generated.seo_title,
        seo_description: generated.seo_description,
        json_ld: generated.json_ld,
        reading_time_minutes: generated.reading_time_minutes,
      });
    }

    return posts;
  } catch {
    return [];
  }
}

async function buildDynamicPosts(): Promise<BlogPostView[]> {
  const feeds = getDefaultFeeds();
  const all: RssItem[] = [];

  await Promise.all(
    feeds.map(async (feedUrl) => {
      try {
        const items = await fetchRssItems(feedUrl, 20);
        all.push(...items);
      } catch {
        return;
      }
    }),
  );

  const seen = new Set<string>();
  const uniq = all.filter((i) => {
    const key = i.url;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const sorted = uniq.sort((a, b) => {
    const ta = a.publishedAt ? Date.parse(a.publishedAt) : 0;
    const tb = b.publishedAt ? Date.parse(b.publishedAt) : 0;
    return tb - ta;
  });

  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const daySeed = new Date(now).toISOString().slice(0, 10);
  const minuteOfDay = Math.floor((now - Date.parse(`${daySeed}T00:00:00.000Z`)) / 60_000);
  const ordered = sorted
    .map((i) => ({ i, h: sha256(`${daySeed}:${i.url}`) }))
    .sort((a, b) => (a.h < b.h ? -1 : a.h > b.h ? 1 : 0))
    .map((x) => x.i);
  const offset = ordered.length > 0 ? ((minuteOfDay % ordered.length) + ordered.length) % ordered.length : 0;
  const rotated = ordered.length > 0 ? ordered.slice(offset).concat(ordered.slice(0, offset)) : [];
  const posts: BlogPostView[] = [];

  for (let idx = 0; idx < Math.min(60, rotated.length); idx += 1) {
    const item = rotated[idx]!;
    const slug = buildSlugFromRss(item);
    const publishedAtIso = new Date(now - idx * 60_000).toISOString();
    const postUrl = `https://www.balao.info/blog/${slug}`;
    const generated = await generateBlogPostFromRss(item, { slug, publishedAtIso, url: postUrl });
    const cover = item.imageUrls?.[0] ? String(item.imageUrls[0]) : null;
    const contentWithImages = prependImagesToHtml(generated.content_html, item.imageUrls || []);

    posts.push({
      id: sha256(`rss:${item.url}`),
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content_html: contentWithImages,
      cover_image: cover,
      category: normalizeCategory(generated.category, { title: generated.title, sourceUrl: item.url }),
      published_at: publishedAtIso,
      created_at: publishedAtIso,
      updated_at: publishedAtIso,
      source_url: item.url,
      canonical_url: postUrl,
      seo_title: generated.seo_title,
      seo_description: generated.seo_description,
      json_ld: generated.json_ld,
      reading_time_minutes: generated.reading_time_minutes,
    });
  }

  return posts;
}

function buildSlugFromProductUrl(input: { name: string; url: string }): string {
  const baseSlug = slugify(input.name).slice(0, 70);
  const sourceHash = sha256(input.url).slice(0, 8);
  return `${baseSlug}-${sourceHash}`;
}

async function buildDynamicProductPosts(): Promise<BlogPostView[]> {
  const siteProducts = await scrapeSiteProducts({ take: 10 });
  const now = Date.now();

  const posts: BlogPostView[] = [];
  for (let idx = 0; idx < siteProducts.length; idx += 1) {
    const p = siteProducts[idx]!;
    const slug = buildSlugFromProductUrl({ name: p.name, url: p.url });
    const created = new Date(now - idx * 60_000).toISOString();
    const url = `https://www.balao.info/blog/${slug}`;

    const generated = await generateBlogPostFromProduct(
      {
        id: p.id,
        name: p.name,
        price: p.priceText || "",
        image: p.imageUrl || "/logo.png",
        product_url: p.url,
        category: "Ofertas Balão",
        slug,
        description: p.description || undefined,
      } as any,
      { slug, publishedAtIso: created, url, productUrl: p.url },
    );

    posts.push({
      id: sha256(`site-product-post:${p.url}`),
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content_html: generated.content_html,
      cover_image: p.imageUrl,
      category: "Loja",
      published_at: created,
      created_at: created,
      updated_at: created,
      source_url: p.url,
      canonical_url: url,
      seo_title: generated.seo_title,
      seo_description: generated.seo_description,
      json_ld: generated.json_ld,
      reading_time_minutes: generated.reading_time_minutes,
    });
  }

  return posts;
}

export async function listBlogPostsForPage(input?: { category?: string; take?: number }): Promise<BlogPostView[]> {
  const take = Math.max(1, Math.min(80, input?.take ?? 50));
  const category = input?.category ? normalizeCategory(input.category) : undefined;

  if (isSupabaseReadable()) {
    const dbPosts = await getBlogPosts({ limit: take, category });
    if (dbPosts.length > 0) {
      const mapped = dbPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: cleanText(p.title),
        excerpt: cleanText(p.excerpt || p.seo_description || ""),
        content_html: p.content_html,
        cover_image: p.cover_image ? String(p.cover_image) : null,
        category: normalizeCategory(p.category, { title: p.title, sourceUrl: p.source_url }),
        published_at: p.published_at,
        created_at: p.created_at,
        updated_at: p.updated_at,
        source_url: p.source_url ? String(p.source_url) : null,
        canonical_url: p.canonical_url ? String(p.canonical_url) : `https://www.balao.info/blog/${p.slug}`,
        seo_title: p.seo_title ? cleanText(String(p.seo_title)) : null,
        seo_description: p.seo_description ? cleanText(String(p.seo_description)) : null,
        json_ld: p.json_ld,
        reading_time_minutes: p.reading_time_minutes ?? null,
      }));

      if (category) {
        return sortByPublishedDesc(mapped).slice(0, take);
      }

      const rss = mapped.filter((p) => kindOfPost(p) === "rss");
      const products = mapped.filter((p) => kindOfPost(p) === "product");
      return mixRssAndProductPosts({ rss, products, take, maxConsecutiveProducts: 1 });
    }
  }

  const [rssPosts, productPosts, trendPosts] = await Promise.all([buildDynamicPosts(), buildDynamicProductPosts(), buildDynamicTrendPosts()]);
  const merged = rssPosts.concat(productPosts).concat(trendPosts);
  if (category) {
    return sortByPublishedDesc(merged.filter((p) => p.category === category)).slice(0, take);
  }

  const rssBucket = rssPosts.concat(trendPosts);
  return mixRssAndProductPosts({ rss: rssBucket, products: productPosts, take, maxConsecutiveProducts: 1 });
}

export async function getBlogPostForPage(slug: string): Promise<BlogPostView | null> {
  if (isSupabaseReadable()) {
    const post = await getBlogPostBySlug(slug);
    if (post) {
      return {
        id: post.id,
        slug: post.slug,
        title: cleanText(post.title),
        excerpt: cleanText(post.excerpt || post.seo_description || ""),
        content_html: post.content_html,
        cover_image: post.cover_image ? String(post.cover_image) : null,
        category: normalizeCategory(post.category, { title: post.title, sourceUrl: post.source_url }),
        published_at: post.published_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        source_url: post.source_url ? String(post.source_url) : null,
        canonical_url: post.canonical_url ? String(post.canonical_url) : `https://www.balao.info/blog/${post.slug}`,
        seo_title: post.seo_title ? cleanText(String(post.seo_title)) : null,
        seo_description: post.seo_description ? cleanText(String(post.seo_description)) : null,
        json_ld: post.json_ld,
        reading_time_minutes: post.reading_time_minutes ?? null,
      };
    }
  }

  const [rssPosts, productPosts, trendPosts] = await Promise.all([buildDynamicPosts(), buildDynamicProductPosts(), buildDynamicTrendPosts()]);
  return rssPosts.concat(productPosts).concat(trendPosts).find((p) => p.slug === slug) || null;
}
