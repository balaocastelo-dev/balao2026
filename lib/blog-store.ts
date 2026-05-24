import crypto from "crypto";
import { fetchRssItems, type RssItem } from "@/lib/rss";
import { slugify } from "@/lib/blog-utils";
import { generateBlogPostFromRss } from "@/lib/blog-ai";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/db";

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
  seo_title: string | null;
  seo_description: string | null;
  json_ld: any;
  reading_time_minutes: number | null;
};

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
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
    const slug = buildSlugFromRss(item);
    const publishedAt = item.publishedAt ? new Date(item.publishedAt) : new Date();
    const publishedAtIso = Number.isFinite(publishedAt.getTime()) ? publishedAt.toISOString() : nowIso;
    const postUrl = `https://www.balao.info/blog/${slug}`;
    const generated = await generateBlogPostFromRss(item, { slug, publishedAtIso, url: postUrl });

    posts.push({
      id: sha256(`rss:${item.url}`),
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content_html: generated.content_html,
      cover_image: null,
      category: normalizeCategory(generated.category),
      published_at: publishedAtIso,
      created_at: publishedAtIso,
      updated_at: publishedAtIso,
      source_url: item.url,
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
      return dbPosts.map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: (p.excerpt || p.seo_description || "").trim(),
        content_html: p.content_html,
        cover_image: p.cover_image ? String(p.cover_image) : null,
        category: normalizeCategory(p.category),
        published_at: p.published_at,
        created_at: p.created_at,
        updated_at: p.updated_at,
        source_url: p.source_url ? String(p.source_url) : null,
        seo_title: p.seo_title ? String(p.seo_title) : null,
        seo_description: p.seo_description ? String(p.seo_description) : null,
        json_ld: p.json_ld,
        reading_time_minutes: p.reading_time_minutes ?? null,
      }));
    }
  }

  const dyn = await buildDynamicPosts();
  const filtered = category ? dyn.filter((p) => p.category === category) : dyn;
  return filtered.slice(0, take);
}

export async function getBlogPostForPage(slug: string): Promise<BlogPostView | null> {
  if (isSupabaseReadable()) {
    const post = await getBlogPostBySlug(slug);
    if (post) {
      return {
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: (post.excerpt || post.seo_description || "").trim(),
        content_html: post.content_html,
        cover_image: post.cover_image ? String(post.cover_image) : null,
        category: normalizeCategory(post.category),
        published_at: post.published_at,
        created_at: post.created_at,
        updated_at: post.updated_at,
        source_url: post.source_url ? String(post.source_url) : null,
        seo_title: post.seo_title ? String(post.seo_title) : null,
        seo_description: post.seo_description ? String(post.seo_description) : null,
        json_ld: post.json_ld,
        reading_time_minutes: post.reading_time_minutes ?? null,
      };
    }
  }

  const posts = await buildDynamicPosts();
  return posts.find((p) => p.slug === slug) || null;
}

