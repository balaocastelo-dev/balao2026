import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { syncOneProduct } from '@/lib/kabum/sync-worker';

export async function POST(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const productId = body?.productId ? String(body.productId) : '';
  if (!productId) return NextResponse.json({ error: 'productId obrigatório' }, { status: 400 });

  const result = await syncOneProduct(productId);
  return NextResponse.json(result);
}

