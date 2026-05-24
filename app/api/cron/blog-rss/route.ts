import { NextResponse } from "next/server";
import crypto from "crypto";
import { fetchRssItems, shouldSkipRssItemForBlog } from "@/lib/rss";
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

    const feeds = (process.env.BLOG_RSS_FEEDS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (feeds.length === 0) {
      return NextResponse.json({ ok: false, error: "BLOG_RSS_FEEDS vazio" }, { status: 400 });
    }

    const feedIndex = Math.abs(new Date().getUTCMinutes()) % feeds.length;
    const feedUrl = feeds[feedIndex];

    const items = await fetchRssItems(feedUrl, 30);
    if (items.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, feedUrl, message: "Sem itens no feed" });
    }

    for (const item of items) {
      if (shouldSkipRssItemForBlog(item)) continue;
      const sourceHash = sha256(item.url);
      const exists = await hasBlogSourceItem({ source_type: "rss", source_hash: sourceHash });
      if (exists) continue;

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
