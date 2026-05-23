import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  if (!hasAdmin) {
    return NextResponse.json({ error: 'Supabase admin não configurado' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  const limit = Math.max(1, Math.min(500, Number(searchParams.get('limit') || 200)));

  let query = supabaseAdmin
    .from('ai_kabum_sync_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (productId) query = query.eq('product_id', productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

