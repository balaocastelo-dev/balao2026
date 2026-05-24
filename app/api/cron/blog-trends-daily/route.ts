import { NextResponse } from "next/server";
import crypto from "crypto";
import { fetchRssItems } from "@/lib/rss";
import { slugify } from "@/lib/blog-utils";
import { generateBlogPostFromTrend } from "@/lib/blog-ai";
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

function getTrendsFeedUrl(): string {
  return "https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR";
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
        reason: "Supabase admin não configurado. As tendências aparecem no blog em modo dinâmico sem persistência.",
      });
    }

    if (process.env.BLOG_AGENT_TRENDS_ENABLED === "false") {
      return NextResponse.json({ ok: true, skipped: true, reason: "BLOG_AGENT_TRENDS_ENABLED=false" });
    }

    const items = await fetchRssItems(getTrendsFeedUrl(), 25);
    if (items.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, message: "Sem itens do Google Trends" });
    }

    const dayKey = new Date().toISOString().slice(0, 10);
    let insertedCount = 0;
    const insertedSlugs: string[] = [];

    for (let idx = 0; idx < items.length && insertedCount < 5; idx += 1) {
      const item = items[idx]!;
      const sourceHash = sha256(`trend:${dayKey}:${item.title}`);
      const exists = await hasBlogSourceItem({ source_type: "trend", source_hash: sourceHash });
      if (exists) continue;

      const publishedAtIso = new Date(Date.now() - insertedCount * 60_000).toISOString();
      const baseSlug = slugify(`${dayKey} ${item.title}`).slice(0, 80);
      const slug = `${baseSlug}-${sourceHash.slice(0, 8)}`;
      const postUrl = `https://www.balao.info/blog/${slug}`;

      const generated = await generateBlogPostFromTrend({
        query: item.title,
        publishedAtIso,
        url: postUrl,
        sourceUrl: item.url,
      });

      const inserted = await insertBlogPost({
        slug,
        title: generated.title,
        excerpt: generated.excerpt,
        content_html: generated.content_html,
        cover_image: null,
        category: generated.category,
        tags: generated.tags,
        status: "published",
        published_at: publishedAtIso,
        source_type: "trend",
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
          source_type: "trend",
          source_url: item.url,
          source_hash: sourceHash,
          source_title: item.title,
          source_published_at: publishedAtIso,
        });
      } catch {}

      insertedCount += 1;
      insertedSlugs.push(inserted.slug);
    }

    return NextResponse.json({ ok: true, inserted: insertedCount, slugs: insertedSlugs, mode: "daily-5" });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Erro" }, { status: 500 });
  }
}
