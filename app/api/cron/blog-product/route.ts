import { NextResponse } from "next/server";
import crypto from "crypto";
import { turso, isTursoActive } from "@/lib/turso";
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
  const res = await turso.execute(
    "SELECT id, name, price, image, category, slug, description, specs, product_url, created_at FROM products ORDER BY created_at DESC LIMIT 500"
  );

  if (!res.rows || res.rows.length === 0) return null;
  const list = res.rows.map((r: any) => ({
    ...r,
    specs: typeof r.specs === "string" ? (() => { try { return JSON.parse(r.specs); } catch { return {}; } })() : r.specs,
  })) as unknown as Product[];
  const picked = list[Math.floor(Math.random() * list.length)];
  return picked || null;
}

export async function GET(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!isTursoActive()) {
      return NextResponse.json({
        ok: true,
        inserted: 0,
        skipped: true,
        reason: "Banco de dados nao configurado. Blog funciona em modo dinamico sem persistencia.",
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

    const priceText = String(product.price || "").trim();
    const excerpt = priceText ? `${priceText} — ${generated.excerpt}` : generated.excerpt;

    const inserted = await insertBlogPost({
      slug,
      title: generated.title,
      excerpt,
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
