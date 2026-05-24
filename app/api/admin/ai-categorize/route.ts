import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { categorizeProductName } from '@/lib/ai/category-agent';

type InputProduct = { id: string; name: string };

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
  const products = Array.isArray(body?.products) ? (body.products as InputProduct[]) : [];
  const categories = Array.isArray(body?.categories) ? (body.categories as string[]) : [];
  const maxParallel = Math.max(1, Math.min(20, Number(body?.maxParallel || 10)));

  if (!products.length || !categories.length) {
    return NextResponse.json({ results: [] });
  }

  const results = await runWithConcurrency(products, maxParallel, async p => {
    const name = String((p as any)?.name || '').trim();
    const id = String((p as any)?.id || '').trim();
    const r = await categorizeProductName(name, categories);
    return { id, ...r };
  });

  return NextResponse.json({ results });
}

