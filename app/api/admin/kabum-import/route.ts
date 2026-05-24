import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { isValidKabumUrl } from '@/lib/kabum/validators';
import { fetchKabumProductData } from '@/lib/kabum/scraper';
import { categorizeProductName } from '@/lib/ai/category-agent';
import { getCategories, saveProducts } from '@/lib/db';
import type { Category, Product } from '@/lib/utils';

type ImportResultItem = { kabumUrl: string; id?: string; status: 'imported' | 'skipped' | 'error'; reason?: string };

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomInt(min: number, max: number): number {
  const a = Math.ceil(min);
  const b = Math.floor(max);
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function formatPriceBR(value: number): string {
  if (!Number.isFinite(value)) return '0,00';
  return value.toFixed(2).replace('.', ',');
}

function kabumProductIdFromUrl(kabumUrl: string): string | null {
  const m = kabumUrl.match(/\/produto\/(\d+)\//);
  return m?.[1] || null;
}

function extractKabumProductUrlsFromHtml(html: string): string[] {
  const out = new Set<string>();
  const hrefRegex = /href="(\/produto\/\d+\/[^"]+)"/gi;
  let m: RegExpExecArray | null = null;
  while ((m = hrefRegex.exec(html))) {
    const path = String(m[1] || '').trim();
    if (!path) continue;
    out.add(`https://www.kabum.com.br${path}`);
  }

  const absRegex = /https?:\/\/www\.kabum\.com\.br\/produto\/\d+\/[^\s"'<>]+/gi;
  while ((m = absRegex.exec(html))) {
    const url = String(m[0] || '').trim();
    if (url) out.add(url);
  }

  return Array.from(out);
}

function buildCategoryPathIndex(categories: Category[]): string[] {
  const byId = new Map<string, Category>();
  categories.forEach(c => byId.set(c.id, c));

  const cache = new Map<string, string>();
  const compute = (cat: Category): string => {
    if (cache.has(cat.id)) return cache.get(cat.id)!;
    const parts: string[] = [cat.name];
    let current: Category | undefined = cat;
    while (current?.parent_id) {
      const parent = byId.get(current.parent_id);
      if (!parent) break;
      parts.unshift(parent.name);
      current = parent;
    }
    const path = parts.join(' > ');
    cache.set(cat.id, path);
    return path;
  };

  return categories.map(compute).filter(Boolean);
}

async function fetchHtml(url: string, timeoutMs: number): Promise<{ ok: boolean; status: number; html: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        pragma: 'no-cache',
        'cache-control': 'no-cache'
      }
    });
    const html = await res.text();
    return { ok: res.ok, status: res.status, html };
  } catch (e: any) {
    return { ok: false, status: 0, html: String(e?.message || e) };
  } finally {
    clearTimeout(timeout);
  }
}

function withPageNumber(url: string, pageNumber: number): string {
  const u = new URL(url);
  u.searchParams.set('page_number', String(pageNumber));
  return u.toString();
}

async function runWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const safeLimit = Math.max(1, Math.floor(limit || 1));
  const results: R[] = new Array(items.length) as any;
  let idx = 0;
  const workers = new Array(Math.min(safeLimit, items.length)).fill(null).map(async () => {
    while (true) {
      const current = idx++;
      if (current >= items.length) break;
      results[current] = await fn(items[current]);
    }
  });
  await Promise.all(workers);
  return results;
}

export async function POST(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const url = String(body?.url || '').trim();
  const maxPages = Math.max(1, Math.min(50, Number(body?.maxPages ?? 10)));
  const maxItems = Math.max(1, Math.min(5000, Number(body?.maxItems ?? 1000)));
  const delayMinMs = Math.max(0, Math.min(5000, Number(body?.delayMinMs ?? 800)));
  const delayMaxMs = Math.max(delayMinMs, Math.min(8000, Number(body?.delayMaxMs ?? 1600)));
  const maxParallel = Math.max(1, Math.min(8, Number(body?.maxParallel ?? 3)));
  const autoCategory = Boolean(body?.autoCategory ?? true);
  const fallbackCategory = String(body?.fallbackCategory || 'Hardware').trim() || 'Hardware';

  if (!isValidKabumUrl(url)) {
    return NextResponse.json({ error: 'URL Kabum inválida' }, { status: 400 });
  }

  const categories = await getCategories();
  const categoryPaths = buildCategoryPathIndex(categories);

  const productUrls: string[] = [];
  const seen = new Set<string>();
  let pagesFetched = 0;

  for (let page = 1; page <= maxPages; page++) {
    const pageUrl = withPageNumber(url, page);
    const { ok, status, html } = await fetchHtml(pageUrl, 15000);
    pagesFetched += 1;
    if (!ok) {
      return NextResponse.json({ error: `Falha ao buscar página ${page} (${status})` }, { status: 502 });
    }

    const urls = extractKabumProductUrlsFromHtml(html);
    let newOnThisPage = 0;
    for (const u of urls) {
      if (productUrls.length >= maxItems) break;
      if (seen.has(u)) continue;
      seen.add(u);
      productUrls.push(u);
      newOnThisPage += 1;
    }

    if (productUrls.length >= maxItems) break;
    if (newOnThisPage === 0) break;
    await sleep(randomInt(delayMinMs, delayMaxMs));
  }

  const nowIso = new Date().toISOString();
  const results = await runWithConcurrency(productUrls, maxParallel, async kabumUrl => {
    const productId = kabumProductIdFromUrl(kabumUrl);
    const id = productId ? `kabum-${productId}` : `kabum-${encodeURIComponent(kabumUrl).replace(/[^a-zA-Z0-9]/g, '').slice(0, 24)}`;

    const kabum = await fetchKabumProductData(kabumUrl);
    const name = String(kabum.title || '').trim();
    const priceNumber = kabum.price;
    const price = priceNumber != null && Number.isFinite(priceNumber) ? formatPriceBR(priceNumber) : '0,00';

    if (!name) {
      return { kabumUrl, id, status: 'skipped', reason: 'Sem título' } satisfies ImportResultItem;
    }

    let category = fallbackCategory;
    if (autoCategory && categoryPaths.length > 0) {
      const r = await categorizeProductName(name, categoryPaths, { kabumBreadcrumbs: kabum.breadcrumbs || [] });
      if (r.category) category = r.category;
    }

    const p: Product = {
      id,
      name,
      price,
      image: '/placeholder.png',
      image_urls: ['/placeholder.png'],
      product_url: kabumUrl,
      category,
      slug: id,
      kabum_url: kabumUrl,
      kabum_last_price: priceNumber ?? null,
      kabum_last_stock: kabum.stock ?? null,
      kabum_last_checked_at: nowIso,
      kabum_sync_enabled: true,
      kabum_sync_status: 'pending',
      kabum_sync_error: kabum.raw && (kabum.raw as any).error ? String((kabum.raw as any).error) : null
    };

    try {
      await saveProducts([p]);
      return { kabumUrl, id, status: 'imported' } satisfies ImportResultItem;
    } catch (e: any) {
      return { kabumUrl, id, status: 'error', reason: String(e?.message || e) } satisfies ImportResultItem;
    }
  });

  const imported = results.filter(r => r.status === 'imported').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errored = results.filter(r => r.status === 'error').length;

  return NextResponse.json({
    pagesFetched,
    productUrlsFound: productUrls.length,
    imported,
    skipped,
    errored,
    results
  });
}
