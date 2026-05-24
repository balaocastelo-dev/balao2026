import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { categorizeProductName } from '@/lib/ai/category-agent';
import { isValidKabumUrl } from '@/lib/kabum/validators';

type InputProduct = { id: string; name: string; kabumUrl?: string | null };

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

function safeJsonParse(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function extractJsonLdBlocks(html: string): unknown[] {
  const blocks: unknown[] = [];
  const scriptRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null = null;
  while ((match = scriptRegex.exec(html))) {
    const raw = (match[1] || '').trim();
    if (!raw) continue;
    const parsed = safeJsonParse(raw);
    if (!parsed) continue;
    if (Array.isArray(parsed)) blocks.push(...parsed);
    else blocks.push(parsed);
  }
  return blocks;
}

function findBreadcrumbs(blocks: unknown[]): string[] {
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue;
    const obj: any = b;
    const candidates: any[] = [];
    candidates.push(obj);
    if (Array.isArray(obj['@graph'])) candidates.push(...obj['@graph']);
    for (const node of candidates) {
      if (!node || typeof node !== 'object') continue;
      if ((node as any)['@type'] !== 'BreadcrumbList') continue;
      const items = (node as any).itemListElement;
      const arr = Array.isArray(items) ? items : [];
      const names = arr
        .map((it: any) => it?.item?.name || it?.name)
        .filter(Boolean)
        .map((s: any) => String(s).trim())
        .filter(Boolean);
      if (names.length) return names;
    }
  }
  return [];
}

async function fetchKabumContext(kabumUrl: string): Promise<{ breadcrumbs: string[] } | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(kabumUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });
    if (!res.ok) return null;
    const html = await res.text();
    const blocks = extractJsonLdBlocks(html);
    const breadcrumbs = findBreadcrumbs(blocks);
    return { breadcrumbs };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const products = Array.isArray(body?.products) ? (body.products as InputProduct[]) : [];
  const categories = Array.isArray(body?.categories) ? (body.categories as string[]) : [];
  const maxParallel = Math.max(1, Math.min(20, Number(body?.maxParallel || 10)));

  if (!products.length || !categories.length) {
    return NextResponse.json({ results: [] });
  }

  const results = await runWithConcurrency(products, maxParallel, async p => {
    const name = String((p as any)?.name || '').trim();
    const id = String((p as any)?.id || '').trim();
    const kabumUrl = (p as any)?.kabumUrl ? String((p as any).kabumUrl).trim() : null;
    const ctx = kabumUrl && isValidKabumUrl(kabumUrl) ? await fetchKabumContext(kabumUrl) : null;
    const r = await categorizeProductName(name, categories, { kabumBreadcrumbs: ctx?.breadcrumbs || [] });
    return { id, ...r };
  });

  return NextResponse.json({ results });
}
