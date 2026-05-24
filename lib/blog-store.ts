import crypto from "crypto";
import { fetchRssItems, shouldSkipRssItemForBlog, type RssItem } from "@/lib/rss";
import { slugify } from "@/lib/blog-utils";
import { generateBlogPostFromRss } from "@/lib/blog-ai";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/db";
import { scrapeSiteProducts } from "@/lib/site-products";
import { generateBlogPostFromProduct } from "@/lib/blog-ai";
import { cache } from "react";

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

const getDbPostsCached = cache(async (limit: number, category: string | undefined, bucket: number) => {
  void bucket;
  return getBlogPosts({ limit, category });
});

const getDbPostBySlugCached = cache(async (slug: string, bucket: number) => {
  void bucket;
  return getBlogPostBySlug(slug);
});

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
  if (category.includes("ofertas balão") || category.includes("ofertas balao")) return "product";

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
  ];
}

function normalizeCategory(input: string | null | undefined): string {
  const c = String(input || "").trim();
  return c || "Tecnologia";
}

function buildSlugFromRss(item: RssItem): string {
  const baseSlug = slugify(item.title).slice(0, 80);
  const sourceHash = sha256(item.url).slice(0, 8);
  return `${baseSlug}-${sourceHash}`;
}

function extractFirstImageUrlFromHtml(html: string | null | undefined): string | null {
  const input = String(html || "");
  if (!input) return null;
  const m = input.match(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/i);
  const src = (m?.[1] || m?.[2] || m?.[3] || "").trim();
  return src ? src : null;
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

  const nowIso = new Date().toISOString();
  const posts: BlogPostView[] = [];

  for (const item of sorted.slice(0, 60)) {
    if (shouldSkipRssItemForBlog(item)) continue;
    const slug = buildSlugFromRss(item);
    const publishedAt = item.publishedAt ? new Date(item.publishedAt) : new Date();
    const publishedAtIso = Number.isFinite(publishedAt.getTime()) ? publishedAt.toISOString() : nowIso;
    const postUrl = `https://www.balao.info/blog/${slug}`;
    const generated = await generateBlogPostFromRss(item, { slug, publishedAtIso, url: postUrl });
    const cover = (item.imageUrls?.[0] ? String(item.imageUrls[0]) : null) || extractFirstImageUrlFromHtml(generated.content_html);

    posts.push({
      id: sha256(`rss:${item.url}`),
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content_html: generated.content_html,
      cover_image: cover,
      category: normalizeCategory(generated.category),
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

    const priceText = String(p.priceText || "").trim();
    const excerpt = priceText ? `${priceText} — ${generated.excerpt}` : generated.excerpt;

    posts.push({
      id: sha256(`site-product-post:${p.url}`),
      slug,
      title: generated.title,
      excerpt,
      content_html: generated.content_html,
      cover_image: p.imageUrl,
      category: "Ofertas Balão",
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

  const normalizeTextForMatch = (s: string) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}+/gu, "")
      .replace(/\s+/g, " ")
      .trim();

  const isThirdPartySalesPost = (p: BlogPostView) => {
    const src = String(p.source_url || "").trim();
    if (!src) return false;
    const domain = (() => {
      try {
        return new URL(src).hostname.replace(/^www\./i, "").toLowerCase();
      } catch {
        return "";
      }
    })();
    if (!domain || domain === "balao.info") return false;

    const hay = normalizeTextForMatch(`${p.title} ${p.excerpt || ""}`);
    const thirdPartyCommerceDomains =
      /amazon\.|mercadolivre\.|meli\.|aliexpress\.|shopee\.|magazineluiza\.|magalu\.|kabum\.|americanas\.|submarino\.|casasbahia\.|pontofrio\.|extra\.|fastshop\.|carrefour\.|pichau\.|terabyte|alibaba\./i;
    if (thirdPartyCommerceDomains.test(src)) return true;

    const commerceSignals =
      /\b(oferta|ofertas|promocao|promocoes|promo|cupom|cupons|desconto|descontos|cashback|frete gratis|melhor preco|preco|parcelad|compre|comprar|vale a pena|review de compra|onde comprar|link de compra)\b/i;
    const hasPrice = /\br\$\s*\d/i.test(hay) || /\b\d{1,3}%\b/.test(hay);
    if (commerceSignals.test(hay) && hasPrice) return true;
    if (commerceSignals.test(normalizeTextForMatch(p.title)) && hasPrice) return true;
    return false;
  };

  if (isSupabaseReadable()) {
    const bucket = Math.floor(Date.now() / 60_000);
    const dbPosts = await getDbPostsCached(take, category, bucket);
    if (dbPosts.length > 0) {
      const mapped = dbPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: cleanText(p.title),
        excerpt: cleanText(p.excerpt || p.seo_description || ""),
        content_html: p.content_html,
        cover_image: p.cover_image ? String(p.cover_image) : extractFirstImageUrlFromHtml(p.content_html),
        category: normalizeCategory(p.category),
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
        return sortByPublishedDesc(mapped).filter((p) => !isThirdPartySalesPost(p)).slice(0, take);
      }

      const rss = mapped.filter((p) => kindOfPost(p) === "rss").filter((p) => !isThirdPartySalesPost(p));
      const products = mapped.filter((p) => kindOfPost(p) === "product");
      return mixRssAndProductPosts({ rss, products, take, maxConsecutiveProducts: 1 });
    }
  }

  const [rssPosts, productPosts] = await Promise.all([buildDynamicPosts(), buildDynamicProductPosts()]);
  const merged = rssPosts.concat(productPosts);
  if (category) {
    return sortByPublishedDesc(merged.filter((p) => p.category === category)).filter((p) => !isThirdPartySalesPost(p)).slice(0, take);
  }

  return mixRssAndProductPosts({ rss: rssPosts.filter((p) => !isThirdPartySalesPost(p)), products: productPosts, take, maxConsecutiveProducts: 1 });
}

export async function getBlogPostForPage(slug: string): Promise<BlogPostView | null> {
  if (isSupabaseReadable()) {
    const bucket = Math.floor(Date.now() / 300_000);
    const post = await getDbPostBySlugCached(slug, bucket);
    if (post) {
      const cover = post.cover_image ? String(post.cover_image) : extractFirstImageUrlFromHtml(post.content_html);
      return {
        id: post.id,
        slug: post.slug,
        title: cleanText(post.title),
        excerpt: cleanText(post.excerpt || post.seo_description || ""),
        content_html: post.content_html,
        cover_image: cover,
        category: normalizeCategory(post.category),
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

  const [rssPosts, productPosts] = await Promise.all([buildDynamicPosts(), buildDynamicProductPosts()]);
  return rssPosts.concat(productPosts).find((p) => p.slug === slug) || null;
}
