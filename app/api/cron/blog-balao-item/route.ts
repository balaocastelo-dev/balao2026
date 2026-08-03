import { NextResponse } from "next/server";
import crypto from "crypto";
import { hasAdmin } from "@/lib/supabase-admin";
import { insertBlogPost, insertBlogSourceItem, hasBlogSourceItem } from "@/lib/db";
import { scrapeSiteProducts } from "@/lib/site-products";
import { generateBlogPostFromProduct } from "@/lib/blog-ai";
import { slugify, isThinProductContent } from "@/lib/blog-utils";

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

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await scrapeSiteProducts({ take: 20 });
    if (items.length === 0) {
      return NextResponse.json({ ok: true, inserted: 0, message: "Nenhum item encontrado no site" });
    }

    const picked = items[Math.floor(Math.random() * items.length)]!;
    const sourceHash = sha256(`site-product:${picked.url}`);

    if (hasAdmin) {
      const exists = await hasBlogSourceItem({ source_type: "product", source_hash: sourceHash });
      if (exists) {
        return NextResponse.json({ ok: true, inserted: 0, message: "Item já usado" });
      }
    }

    const publishedAtIso = new Date().toISOString();
    const baseSlug = slugify(picked.name).slice(0, 80);
    const slug = `${baseSlug}-${sourceHash.slice(0, 8)}`;
    const postUrl = `https://www.balao.info/blog/${slug}`;

    const generated = await generateBlogPostFromProduct(
      {
        id: picked.id,
        name: picked.name,
        price: picked.priceText || "",
        image: picked.imageUrl || "/logo.png",
        product_url: picked.url,
        category: "Ofertas Balão",
        slug,
        description: picked.description || undefined,
      },
      { slug, publishedAtIso, url: postUrl, productUrl: picked.url },
    );

    if (isThinProductContent({ contentHtml: generated.content_html, seoDescription: generated.seo_description })) {
      return NextResponse.json({ ok: true, inserted: 0, message: "Conteúdo insuficiente, item ignorado" });
    }

    if (!hasAdmin) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        generated: true,
        mode: "no-config",
        slug,
        title: generated.title,
        url: postUrl,
      });
    }

    const inserted = await insertBlogPost({
      slug,
      title: generated.title,
      excerpt: picked.priceText ? `${picked.priceText} — ${generated.excerpt}` : generated.excerpt,
      content_html: generated.content_html,
      cover_image: picked.imageUrl,
      category: generated.category || "Ofertas Balão",
      tags: generated.tags,
      status: "published",
      published_at: publishedAtIso,
      source_type: "product",
      source_url: picked.url,
      source_title: picked.name,
      product_id: picked.id,
      seo_title: generated.seo_title,
      seo_description: generated.seo_description,
      canonical_url: postUrl,
      json_ld: generated.json_ld,
      reading_time_minutes: generated.reading_time_minutes,
      internal_links: null,
    });

    try {
      await insertBlogSourceItem({
        source_type: "product",
        source_url: picked.url,
        source_hash: sourceHash,
        source_title: picked.name,
        source_published_at: publishedAtIso,
      });
    } catch {}

    return NextResponse.json({ ok: true, inserted: 1, slug: inserted.slug, id: inserted.id, sourceUrl: picked.url });
  } catch (error: unknown) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Erro" }, { status: 500 });
  }
}

