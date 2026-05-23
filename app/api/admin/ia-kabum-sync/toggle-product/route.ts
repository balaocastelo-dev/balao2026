import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  if (!hasAdmin) {
    return NextResponse.json({ error: 'Supabase admin não configurado' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const productId = body?.productId ? String(body.productId) : '';
  const enabled = Boolean(body?.enabled);
  if (!productId) return NextResponse.json({ error: 'productId obrigatório' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('products')
    .update({ kabum_sync_enabled: enabled })
    .eq('id', productId)
    .select('id,kabum_sync_enabled')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

