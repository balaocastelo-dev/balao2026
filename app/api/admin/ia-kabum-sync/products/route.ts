import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';
import { calculateBalaoPrice } from '@/lib/kabum/pricing';
import { KabumPricingMode } from '@/lib/kabum/pricing';

type SettingsRow = {
  percentage: number;
  mode: KabumPricingMode;
  min_margin: number;
};

async function getSettings(): Promise<SettingsRow> {
  if (!hasAdmin) return { percentage: 15, mode: 'kabum_plus_percentage', min_margin: 0 };
  const { data } = await supabaseAdmin
    .from('ai_kabum_sync_settings')
    .select('percentage, mode, min_margin')
    .order('created_at', { ascending: false })
    .limit(1);
  if (!data || data.length === 0) return { percentage: 15, mode: 'kabum_plus_percentage', min_margin: 0 };
  const r: any = data[0];
  return {
    percentage: Number(r.percentage ?? 15),
    mode: (r.mode as KabumPricingMode) || 'kabum_plus_percentage',
    min_margin: Number(r.min_margin ?? 0)
  };
}

export async function GET(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  if (!hasAdmin) {
    return NextResponse.json({ error: 'Supabase admin não configurado' }, { status: 500 });
  }

  const settings = await getSettings();

  const { data, error } = await supabaseAdmin
    .from('products')
    .select(
      'id,name,price,kabum_url,kabum_last_price,kabum_last_stock,kabum_last_checked_at,kabum_sync_enabled,kabum_sync_status,kabum_sync_error'
    )
    .not('kabum_url', 'is', null)
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const products = (data || [])
    .map((p: any) => {
      const kabumLastPrice = p.kabum_last_price == null ? null : Number(p.kabum_last_price);
      const suggestedPrice =
        kabumLastPrice != null && Number.isFinite(kabumLastPrice)
          ? calculateBalaoPrice(kabumLastPrice, settings)
          : null;
      return {
        ...p,
        suggested_price: suggestedPrice
      };
    })
    .filter((p: any) => typeof p.kabum_url === 'string' && p.kabum_url.trim().length > 0);

  return NextResponse.json({ settings, products });
}

