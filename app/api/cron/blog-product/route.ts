import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { hasAdmin } from "@/lib/supabase-admin";
import { slugify } from "@/lib/blog-utils";
import { generateBlogPostFromProduct } from "@/lib/blog-ai";
import { hasBlogSourceItem, insertBlogPost, insertBlogSourceItem } from "@/lib/db";
import type { Product } from "@/lib/utils";

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

async function getRandomProduct(): Promise<Product | null> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id,name,price,image,category,slug,description,specs,product_url,created_at")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error || !data || data.length === 0) return null;
  const list = data as Product[];
  const picked = list[Math.floor(Math.random() * list.length)];
  return picked || null;
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

    if (process.env.BLOG_AGENT_PRODUCT_ENABLED === "false") {
      return NextResponse.json({ ok: true, skipped: true, reason: "BLOG_AGENT_PRODUCT_ENABLED=false" });
    }

    const product = await getRandomProduct();
    if (!product) {
      return NextResponse.json({ ok: false, error: "Nenhum produto encontrado" }, { status: 404 });
    }

    const sourceHash = sha256(`product:${product.id}`);
    const exists = await hasBlogSourceItem({ source_type: "product", source_hash: sourceHash });
    if (exists) {
      return NextResponse.json({ ok: true, inserted: 0, message: "Produto já usado" });
    }

    const publishedAtIso = new Date().toISOString();
    const baseSlug = slugify(product.name).slice(0, 80);
    const slug = `${baseSlug}-${sourceHash.slice(0, 8)}`;
    const postUrl = `https://www.balao.info/blog/${slug}`;
    const productUrl = `https://www.balao.info/product/${product.slug || product.id}`;

    const generated = await generateBlogPostFromProduct(product, {
      slug,
      publishedAtIso,
      url: postUrl,
      productUrl,
    });

    const inserted = await insertBlogPost({
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content_html: generated.content_html,
      cover_image: product.image || null,
      category: generated.category,
      tags: generated.tags,
      status: "published",
      published_at: publishedAtIso,
      source_type: "product",
      source_url: productUrl,
      source_title: product.name,
      product_id: product.id,
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
        source_url: productUrl,
        source_hash: sourceHash,
        source_title: product.name,
        source_published_at: publishedAtIso,
      });
    } catch {}

    return NextResponse.json({ ok: true, inserted: 1, slug: inserted.slug, id: inserted.id, productId: product.id });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Erro" }, { status: 500 });
  }
}
