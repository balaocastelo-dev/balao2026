import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { syncAllEnabledProducts } from '@/lib/kabum/sync-worker';

export async function POST(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  const result = await syncAllEnabledProducts();
  return NextResponse.json(result);
}

