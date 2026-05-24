import { NextResponse } from "next/server";
import crypto from "crypto";
import { fetchCampinasVideoItems, fetchRssItems, type RssItem } from "@/lib/rss";
import { slugify } from "@/lib/blog-utils";
import { generateBlogPostFromProduct, generateBlogPostFromRss, generateBlogPostFromTrend } from "@/lib/blog-ai";
import { hasBlogSourceItem, insertBlogPost, insertBlogSourceItem } from "@/lib/db";
import { hasAdmin } from "@/lib/supabase-admin";
import { scrapeSiteProducts } from "@/lib/site-products";
import { markAgentRunning, recordAgentRun } from "@/lib/ai/master-agent";
import { readArticle } from "@/lib/article-reader";

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

function getBrtParts(now: Date): { hour: number; minute: number; ymd: string } {
  const parts = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value || "";
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = Number.parseInt(get("hour"), 10);
  const minute = Number.parseInt(get("minute"), 10);
  return {
    hour: Number.isFinite(hour) ? hour : now.getUTCHours(),
    minute: Number.isFinite(minute) ? minute : now.getUTCMinutes(),
    ymd: `${year}${month}${day}`,
  };
}

function getTrendsFeedUrl(): string {
  return "https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR";
}

function buildSlug(title: string, hash: string): string {
  const base = slugify(title).slice(0, 80);
  return `${base}-${hash.slice(0, 8)}`;
}

function interleaveImagesIntoHtml(contentHtml: string, imageUrls: string[], coverUrl?: string | null): string {
  const cover = String(coverUrl || "").trim();
  const urls = (imageUrls || [])
    .filter(Boolean)
    .map((u) => String(u).trim())
    .filter((u) => u && u !== cover)
    .slice(0, 3);

  if (urls.length === 0) return contentHtml;
  if (/<img\b/i.test(contentHtml)) return contentHtml;

  const paragraphEnds = Array.from(contentHtml.matchAll(/<\/p>/gi)).map((m) => m.index ?? -1).filter((i) => i >= 0);
  if (paragraphEnds.length === 0) {
    const imgs = urls.map((u) => `<p><img src="${u}" alt="" loading="lazy" /></p>`).join("");
    return `${imgs}${contentHtml}`;
  }

  let out = contentHtml;
  let offset = 0;
  let cursor = 0;

  for (let i = 0; i < urls.length; i += 1) {
    const idx = Math.min(cursor, paragraphEnds.length - 1);
    const endPos = paragraphEnds[idx]!;
    const insertAt = endPos + "</p>".length + offset;
    const imgHtml = `\n<p><img src="${urls[i]}" alt="" loading="lazy" /></p>\n`;
    out = out.slice(0, insertAt) + imgHtml + out.slice(insertAt);
    offset += imgHtml.length;
    cursor += 2;
  }

  return out;
}

function isCampinasRegionText(input: string): boolean {
  const s = String(input || "").toLowerCase();
  if (!s) return false;
  const keywords = [
    "campinas",
    "sumaré",
    "sumare",
    "americana",
    "hortolândia",
    "hortolandia",
    "valinhos",
    "vinhedo",
    "paulínia",
    "paulinia",
    "indaiatuba",
    "santa bárbara",
    "santa barbara",
    "nova odessa",
    "louveira",
    "jaguariúna",
    "jaguariuna",
    "pedreira",
    "cosmópolis",
    "cosmopolis",
    "itapira",
    "mogi guaçu",
    "mogi guacu",
    "mogi mirim",
    "monte mor",
    "vinhedo",
  ];
  return keywords.some((k) => s.includes(k));
}

async function insertTrendPost(now: Date) {
  const brt = getBrtParts(now);
  const items = await fetchRssItems(getTrendsFeedUrl(), 25);
  if (items.length === 0) return { inserted: 0, reason: "Sem itens Trends" };

  const idx = (brt.minute + brt.hour * 60) % items.length;
  const item = items[idx]!;

  const dayKey = brt.ymd;
  const baseHash = sha256(`trend:${dayKey}:${item.title}`);
  const sourceHash = baseHash;
  const exists = await hasBlogSourceItem({ source_type: "trend", source_hash: sourceHash });
  if (exists) {
    return { inserted: 0, reason: "Trend já usado" };
  }

  const publishedAtIso = now.toISOString();
  const slug = buildSlug(`Em alta: ${item.title}`, sourceHash);
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

  return { inserted: 1, slug: inserted.slug, id: inserted.id, kind: "trend" };
}

async function insertRssPost(now: Date, feeds: string[], kind: "tech" | "campinas" | "general") {
  const brt = getBrtParts(now);
  if (feeds.length === 0) return { inserted: 0, reason: "Sem feeds" };

  const feedIdx = (brt.minute + brt.hour * 60) % feeds.length;
  const feedUrl = feeds[feedIdx]!;

  const items = await fetchRssItems(feedUrl, 40);
  if (items.length === 0) return { inserted: 0, reason: "Sem itens RSS", feedUrl };

  const dayKey = brt.ymd;
  const startIdx = (brt.minute + brt.hour * 60) % items.length;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[(startIdx + i) % items.length]!;
    const baseHash = sha256(`rss:${dayKey}:${item.url}`);
    const exists = await hasBlogSourceItem({ source_type: "rss", source_hash: baseHash });
    const sourceHash = exists ? sha256(`rss:${dayKey}:${brt.hour}:${brt.minute}:${item.url}`) : baseHash;

    const publishedAtIso = now.toISOString();
    const slug = buildSlug(item.title, sourceHash);
    const postUrl = `https://www.balao.info/blog/${slug}`;

    const article = await readArticle(item.url, { timeoutMs: 12000 });
    const summaryText = String(item.summary || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (article.wordCount < 120 && summaryText.length < 80) {
      continue;
    }

    const coverFromFeed = item.imageUrls?.[0] ? String(item.imageUrls[0]) : null;
    const coverFromPage = article.imageUrl ? String(article.imageUrl) : null;
    const cover = coverFromFeed || coverFromPage;
    const imageUrls = (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : cover ? [cover] : []).slice(0, 6);

    const generated = await generateBlogPostFromRss(item, {
      slug,
      publishedAtIso,
      url: postUrl,
      articleText: article.contentText,
      articleTitle: article.title || undefined,
      articleDescription: article.description || undefined,
    });
    const contentWithImages = interleaveImagesIntoHtml(generated.content_html, imageUrls || [], cover);

    const inserted = await insertBlogPost({
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content_html: contentWithImages,
      cover_image: cover,
      category: kind === "campinas" ? "Início" : generated.category,
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

    return { inserted: 1, slug: inserted.slug, id: inserted.id, kind, feedUrl };
  }

  return { inserted: 0, reason: "Sem item elegível", kind, feedUrl };
}

async function insertCampinasVideoPost(now: Date) {
  const brt = getBrtParts(now);
  const [g1Items, bandItems, recordItems] = await Promise.all([
    fetchCampinasVideoItems(40),
    fetchRssItems("https://www.youtube.com/feeds/videos.xml?channel_id=UCoa-D_VfMkFrCYodrOC9-mA", 40).catch(() => [] as RssItem[]),
    fetchRssItems("https://www.youtube.com/feeds/videos.xml?channel_id=UCuiLR4p6wQ3xLEm15pEn1Xw", 40).catch(() => [] as RssItem[]),
  ]);

  const youtubeFiltered = bandItems
    .concat(recordItems)
    .filter((i) => isCampinasRegionText(`${i.title} ${i.summary || ""} ${i.url}`));

  const combined = g1Items.concat(youtubeFiltered);
  if (combined.length === 0) return { inserted: 0, reason: "Sem itens de vídeo" };

  const seen = new Set<string>();
  const items = combined.filter((i) => {
    if (seen.has(i.url)) return false;
    seen.add(i.url);
    return true;
  });

  const dayKey = brt.ymd;
  const startIdx = (brt.minute + brt.hour * 60) % items.length;

  for (let i = 0; i < items.length; i += 1) {
    const item = items[(startIdx + i) % items.length]!;
    const baseHash = sha256(`rss_video:${dayKey}:${item.url}`);
    const exists = await hasBlogSourceItem({ source_type: "rss", source_hash: baseHash });
    const sourceHash = exists ? sha256(`rss_video:${dayKey}:${brt.hour}:${brt.minute}:${item.url}`) : baseHash;

    const publishedAtIso = now.toISOString();
    const slug = buildSlug(item.title, sourceHash);
    const postUrl = `https://www.balao.info/blog/${slug}`;

    const article = await readArticle(item.url, { timeoutMs: 12000 });
    const coverFromFeed = item.imageUrls?.[0] ? String(item.imageUrls[0]) : null;
    const coverFromPage = article.imageUrl ? String(article.imageUrl) : null;
    const cover = coverFromFeed || coverFromPage;
    const imageUrls = (item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls : cover ? [cover] : []).slice(0, 6);

    const generated = await generateBlogPostFromRss(item, {
      slug,
      publishedAtIso,
      url: postUrl,
      articleText: article.contentText,
      articleTitle: article.title || undefined,
      articleDescription: article.description || undefined,
    });
    const contentWithImages = interleaveImagesIntoHtml(generated.content_html, imageUrls || [], cover);
    const inserted = await insertBlogPost({
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content_html: contentWithImages,
      cover_image: cover,
      category: "Início",
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

    return { inserted: 1, slug: inserted.slug, id: inserted.id, kind: "campinas-video", feedUrl: item.sourceFeed };
  }

  return { inserted: 0, reason: "Sem item elegível", kind: "campinas-video" };
}

async function insertBalaoProductPost(now: Date) {
  const brt = getBrtParts(now);
  const products = await scrapeSiteProducts({ take: 30 });
  if (products.length === 0) return { inserted: 0, reason: "Sem produtos do site" };

  const idx = (brt.minute + brt.hour * 60) % products.length;
  const picked = products[idx]!;

  const dayKey = brt.ymd;
  const baseHash = sha256(`product:${dayKey}:${picked.url}`);
  const exists = await hasBlogSourceItem({ source_type: "product", source_hash: baseHash });
  const sourceHash = exists ? sha256(`product:${dayKey}:${brt.hour}:${brt.minute}:${picked.url}`) : baseHash;

  const publishedAtIso = now.toISOString();
  const slug = buildSlug(picked.name, sourceHash);
  const postUrl = `https://www.balao.info/blog/${slug}`;

  const generated = await generateBlogPostFromProduct(
    {
      id: picked.id,
      name: picked.name,
      price: picked.priceText || "",
      image: picked.imageUrl || "/logo.png",
      category: "Loja",
      slug,
      product_url: picked.url,
      description: picked.description || undefined,
    } as any,
    { slug, publishedAtIso, url: postUrl, productUrl: picked.url },
  );

  const inserted = await insertBlogPost({
    slug,
    title: generated.title,
    excerpt: generated.excerpt,
    content_html: generated.content_html,
    cover_image: picked.imageUrl,
    category: "Loja",
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

  return { inserted: 1, slug: inserted.slug, id: inserted.id, kind: "product", url: picked.url };
}

export async function GET(req: Request) {
  const startedAtMs = Date.now();
  markAgentRunning("cron.blog-minute");
  const respond = (data: any, status?: number) => {
    const ok = Boolean(data?.ok);
    const inserted = typeof data?.inserted === "number" ? data.inserted : undefined;
    const summary = typeof data?.reason === "string" && data.reason ? data.reason : inserted === 1 ? "Inserido" : ok ? "OK" : "Erro";
    recordAgentRun({
      agentId: "cron.blog-minute",
      ok,
      startedAtMs,
      summary,
      meta: { inserted, kind: data?.kind, slot: data?.slot, feedUrl: data?.feedUrl, fallbackFrom: data?.fallbackFrom },
    });
    return NextResponse.json(data, status ? { status } : undefined);
  };

  try {
    if (!isAuthorized(req)) {
      return respond({ ok: false, error: "Unauthorized" }, 401);
    }

    if (!hasAdmin) {
      return respond({
        ok: true,
        inserted: 0,
        skipped: true,
        reason: "Supabase admin não configurado. O blog continua atualizando automaticamente em modo dinâmico.",
      });
    }

    const now = new Date();
    const brt = getBrtParts(now);
    const minuteKey = Math.floor(now.getTime() / 60_000);

    if (brt.hour === 8 && brt.minute < 5) {
      const trend = await insertTrendPost(now);
      if (trend.inserted === 1) return respond({ ok: true, ...trend });
    }

    const techFeeds = [
      "https://www.adrenaline.com.br/feed/",
      "https://www.tecmundo.com.br/rss",
      "https://canaltech.com.br/rss/",
      "https://olhardigital.com.br/feed/",
      "https://www.hardware.com.br/feed/",
    ];

    const campinasFeeds = ["https://g1.globo.com/dynamo/sp/campinas-e-regiao/rss2.xml", "https://www.acidadeon.com/campinas/feed/"];

    const generalFeeds = [
      "https://g1.globo.com/dynamo/rss2.xml",
      "https://www.bbc.com/portuguese/index.xml",
    ];

    const slot = minuteKey % 4;
    if (slot === 0) {
      const product = await insertBalaoProductPost(now);
      if (product.inserted === 1) return respond({ ok: true, ...product });
    }

    if (slot === 1) {
      const tech = await insertRssPost(now, techFeeds, "tech");
      if (tech.inserted === 1) return respond({ ok: true, ...tech });
    }

    if (slot === 2) {
      const campinasVideo = await insertCampinasVideoPost(now);
      if (campinasVideo.inserted === 1) return respond({ ok: true, ...campinasVideo });

      const campinas = await insertRssPost(now, campinasFeeds, "campinas");
      if (campinas.inserted === 1) return respond({ ok: true, ...campinas, fallbackFrom: "campinas-video" });
    }

    const general = await insertRssPost(now, generalFeeds.concat(techFeeds), "general");
    if (general.inserted === 1) return respond({ ok: true, ...general });

    const fallbackProduct = await insertBalaoProductPost(now);
    if (fallbackProduct.inserted === 1) return respond({ ok: true, ...fallbackProduct });

    return respond({ ok: true, inserted: 0, reason: "Nenhuma fonte gerou post", slot });
  } catch (error: any) {
    return respond({ ok: false, error: error?.message || "Erro" }, 500);
  }
}
