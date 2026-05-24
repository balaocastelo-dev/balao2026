import { NextResponse } from 'next/server';
import { requireAdminApiAuth } from '@/lib/admin/auth';
import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';
import { repriceAllEnabledProducts } from '@/lib/kabum/sync-worker';

function defaultSettingsRow() {
  return {
    percentage: 15,
    mode: 'kabum_plus_percentage',
    min_margin: 0,
    sync_interval_seconds: 300,
    max_parallel_agents: 10,
    is_active: false
  };
}

export async function GET(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  if (!hasAdmin) {
    return NextResponse.json({ error: 'Supabase admin não configurado' }, { status: 500 });
  }

  const { data, error } = await supabaseAdmin
    .from('ai_kabum_sync_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!error && data && data.length > 0) {
    return NextResponse.json(data[0]);
  }

  const insert = await supabaseAdmin.from('ai_kabum_sync_settings').insert(defaultSettingsRow()).select('*').single();
  if (insert.error) {
    return NextResponse.json(defaultSettingsRow());
  }
  return NextResponse.json(insert.data);
}

export async function POST(request: Request) {
  const unauthorized = requireAdminApiAuth(request);
  if (unauthorized) return unauthorized;

  if (!hasAdmin) {
    return NextResponse.json({ error: 'Supabase admin não configurado' }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Payload inválido' }, { status: 400 });
  }

  const percentage = Number((body as any).percentage);
  const mode = String((body as any).mode || 'kabum_plus_percentage');
  const min_margin = Number((body as any).min_margin);
  const sync_interval_seconds = Number((body as any).sync_interval_seconds);
  const max_parallel_agents = Number((body as any).max_parallel_agents);
  const is_active = Boolean((body as any).is_active);

  const allowedModes = new Set(['kabum_plus_percentage', 'kabum_minus_percentage', 'min_margin']);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 500) {
    return NextResponse.json({ error: 'percentage inválido' }, { status: 400 });
  }
  if (!allowedModes.has(mode)) {
    return NextResponse.json({ error: 'mode inválido' }, { status: 400 });
  }
  if (!Number.isFinite(min_margin) || min_margin < 0) {
    return NextResponse.json({ error: 'min_margin inválido' }, { status: 400 });
  }
  if (!Number.isFinite(sync_interval_seconds) || sync_interval_seconds < 10 || sync_interval_seconds > 86400) {
    return NextResponse.json({ error: 'sync_interval_seconds inválido' }, { status: 400 });
  }
  if (!Number.isFinite(max_parallel_agents) || max_parallel_agents < 1 || max_parallel_agents > 50) {
    return NextResponse.json({ error: 'max_parallel_agents inválido' }, { status: 400 });
  }

  const current = await supabaseAdmin
    .from('ai_kabum_sync_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (current.data && current.data.length > 0) {
    const id = (current.data[0] as any).id;
    const { data, error } = await supabaseAdmin
      .from('ai_kabum_sync_settings')
      .update({
        percentage,
        mode,
        min_margin,
        sync_interval_seconds,
        max_parallel_agents,
        is_active
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const repriced = await repriceAllEnabledProducts({
      percentage: Number(data.percentage ?? percentage),
      mode: data.mode,
      min_margin: Number(data.min_margin ?? min_margin),
      sync_interval_seconds: Number(data.sync_interval_seconds ?? sync_interval_seconds),
      max_parallel_agents: Number(data.max_parallel_agents ?? max_parallel_agents),
      is_active: Boolean(data.is_active ?? is_active)
    }).catch(() => null);

    return NextResponse.json({ ...data, repricedCount: repriced?.updated ?? 0 });
  }

  const { data, error } = await supabaseAdmin
    .from('ai_kabum_sync_settings')
    .insert({
      percentage,
      mode,
      min_margin,
      sync_interval_seconds,
      max_parallel_agents,
      is_active
    })
    .select('*')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const repriced = await repriceAllEnabledProducts({
    percentage: Number(data.percentage ?? percentage),
    mode: data.mode,
    min_margin: Number(data.min_margin ?? min_margin),
    sync_interval_seconds: Number(data.sync_interval_seconds ?? sync_interval_seconds),
    max_parallel_agents: Number(data.max_parallel_agents ?? max_parallel_agents),
    is_active: Boolean(data.is_active ?? is_active)
  }).catch(() => null);

  return NextResponse.json({ ...data, repricedCount: repriced?.updated ?? 0 });
}
