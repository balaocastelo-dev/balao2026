import { supabaseAdmin, hasAdmin } from '@/lib/supabase-admin';
import { parsePriceToNumber, Product } from '@/lib/utils';
import { validateKabumMatch } from '@/lib/ai/llama-agent';
import { calculateBalaoPrice, formatBRL, KabumPricingMode } from '@/lib/kabum/pricing';
import { fetchKabumProductData } from '@/lib/kabum/scraper';
import { isValidKabumUrl } from '@/lib/kabum/validators';

export type KabumSyncSettings = {
  id?: string;
  percentage: number;
  mode: KabumPricingMode;
  min_margin: number;
  sync_interval_seconds: number;
  max_parallel_agents: number;
  is_active: boolean;
};

export type SyncOneResult = {
  productId: string;
  status: 'success' | 'manual_review' | 'error' | 'skipped';
  message?: string;
  kabumPrice?: number | null;
  kabumStock?: string | null;
  suggestedPrice?: number | null;
  confidence?: number;
};

function getDefaultSettings(): KabumSyncSettings {
  return {
    percentage: 15,
    mode: 'kabum_plus_percentage',
    min_margin: 0,
    sync_interval_seconds: 300,
    max_parallel_agents: 10,
    is_active: false
  };
}

async function getSettings(): Promise<KabumSyncSettings> {
  if (!hasAdmin) return getDefaultSettings();

  const { data, error } = await supabaseAdmin
    .from('ai_kabum_sync_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return getDefaultSettings();

  const row: any = data[0];
  return {
    id: row.id,
    percentage: Number(row.percentage ?? 15),
    mode: (row.mode as KabumPricingMode) || 'kabum_plus_percentage',
    min_margin: Number(row.min_margin ?? 0),
    sync_interval_seconds: Number(row.sync_interval_seconds ?? 300),
    max_parallel_agents: Number(row.max_parallel_agents ?? 10),
    is_active: Boolean(row.is_active)
  };
}

async function logSync(input: {
  productId: string;
  kabumUrl: string | null;
  oldBalaoPrice: number | null;
  newBalaoPrice: number | null;
  kabumPrice: number | null;
  kabumStock: string | null;
  status: string;
  errorMessage: string | null;
}) {
  if (!hasAdmin) return;
  await supabaseAdmin.from('ai_kabum_sync_logs').insert({
    product_id: input.productId,
    kabum_url: input.kabumUrl,
    old_balao_price: input.oldBalaoPrice,
    new_balao_price: input.newBalaoPrice,
    kabum_price: input.kabumPrice,
    kabum_stock: input.kabumStock,
    status: input.status,
    error_message: input.errorMessage
  });
}

async function acquireProductLock(productId: string): Promise<Product | null> {
  if (!hasAdmin) throw new Error('Supabase admin não configurado');

  const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from('products')
    .update({
      kabum_sync_status: 'syncing',
      kabum_sync_error: null,
      kabum_last_checked_at: new Date().toISOString()
    })
    .eq('id', productId)
    .or(`kabum_sync_status.is.null,kabum_sync_status.neq.syncing,kabum_last_checked_at.lt.${cutoff}`)
    .select('*')
    .maybeSingle();

  if (error) throw error;
  return (data as any) || null;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const safeLimit = Math.max(1, Math.floor(limit || 1));
  const results: R[] = new Array(items.length) as any;
  let index = 0;

  const workers = new Array(Math.min(safeLimit, items.length)).fill(null).map(async () => {
    while (true) {
      const current = index++;
      if (current >= items.length) break;
      results[current] = await fn(items[current]);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function syncOneProduct(productId: string): Promise<SyncOneResult> {
  if (!hasAdmin) {
    return { productId, status: 'error', message: 'Supabase admin não configurado' };
  }

  let product: Product | null = null;
  try {
    product = await acquireProductLock(productId);
    if (!product) {
      return { productId, status: 'skipped', message: 'Produto em sincronização (lock)' };
    }

    const kabumUrl = (product.kabum_url || '').trim();
    if (!kabumUrl) {
      await supabaseAdmin
        .from('products')
        .update({ kabum_sync_status: 'error', kabum_sync_error: 'Produto sem kabum_url' })
        .eq('id', productId);
      await logSync({
        productId,
        kabumUrl: null,
        oldBalaoPrice: null,
        newBalaoPrice: null,
        kabumPrice: null,
        kabumStock: null,
        status: 'error',
        errorMessage: 'Produto sem kabum_url'
      });
      return { productId, status: 'error', message: 'Produto sem kabum_url' };
    }

    if (!isValidKabumUrl(kabumUrl)) {
      await supabaseAdmin
        .from('products')
        .update({ kabum_sync_status: 'error', kabum_sync_error: 'Link Kabum inválido' })
        .eq('id', productId);
      await logSync({
        productId,
        kabumUrl,
        oldBalaoPrice: null,
        newBalaoPrice: null,
        kabumPrice: null,
        kabumStock: null,
        status: 'error',
        errorMessage: 'Link Kabum inválido'
      });
      return { productId, status: 'error', message: 'Link Kabum inválido' };
    }

    const kabumData = await fetchKabumProductData(kabumUrl);
    if (kabumData.price == null) {
      await supabaseAdmin
        .from('products')
        .update({
          kabum_last_price: null,
          kabum_last_stock: kabumData.stock,
          kabum_last_checked_at: new Date().toISOString(),
          kabum_sync_status: 'error',
          kabum_sync_error: 'Falha ao obter preço na Kabum'
        })
        .eq('id', productId);
      await logSync({
        productId,
        kabumUrl,
        oldBalaoPrice: parsePriceToNumber(product.price),
        newBalaoPrice: null,
        kabumPrice: null,
        kabumStock: kabumData.stock,
        status: 'error',
        errorMessage: 'Falha ao obter preço na Kabum'
      });
      return { productId, status: 'error', message: 'Falha ao obter preço na Kabum', kabumStock: kabumData.stock };
    }

    const settings = await getSettings();
    const match = await validateKabumMatch(product.name, kabumData.title || '');
    const suggested = calculateBalaoPrice(kabumData.price, settings);

    if (!match.sameProduct || match.confidence < 0.75) {
      await supabaseAdmin
        .from('products')
        .update({
          kabum_last_price: kabumData.price,
          kabum_last_stock: kabumData.stock,
          kabum_last_checked_at: new Date().toISOString(),
          kabum_sync_status: 'manual_review',
          kabum_sync_error: match.reason
        })
        .eq('id', productId);

      await logSync({
        productId,
        kabumUrl,
        oldBalaoPrice: parsePriceToNumber(product.price),
        newBalaoPrice: null,
        kabumPrice: kabumData.price,
        kabumStock: kabumData.stock,
        status: 'manual_review',
        errorMessage: match.reason
      });

      return {
        productId,
        status: 'manual_review',
        message: match.reason,
        kabumPrice: kabumData.price,
        kabumStock: kabumData.stock,
        suggestedPrice: suggested,
        confidence: match.confidence
      };
    }

    const oldPriceNumber = parsePriceToNumber(product.price);
    const newPriceString = formatBRL(suggested);

    await supabaseAdmin
      .from('products')
      .update({
        price: newPriceString,
        kabum_last_price: kabumData.price,
        kabum_last_stock: kabumData.stock,
        kabum_last_checked_at: new Date().toISOString(),
        kabum_sync_status: 'success',
        kabum_sync_error: null
      })
      .eq('id', productId);

    await logSync({
      productId,
      kabumUrl,
      oldBalaoPrice: Number.isFinite(oldPriceNumber) ? oldPriceNumber : null,
      newBalaoPrice: suggested,
      kabumPrice: kabumData.price,
      kabumStock: kabumData.stock,
      status: 'success',
      errorMessage: null
    });

    return {
      productId,
      status: 'success',
      kabumPrice: kabumData.price,
      kabumStock: kabumData.stock,
      suggestedPrice: suggested,
      confidence: match.confidence
    };
  } catch (error: any) {
    const message = String(error?.message || error);
    try {
      await supabaseAdmin
        .from('products')
        .update({ kabum_sync_status: 'error', kabum_sync_error: message, kabum_last_checked_at: new Date().toISOString() })
        .eq('id', productId);
      await logSync({
        productId,
        kabumUrl: (product?.kabum_url as any) || null,
        oldBalaoPrice: product ? parsePriceToNumber(product.price) : null,
        newBalaoPrice: null,
        kabumPrice: null,
        kabumStock: null,
        status: 'error',
        errorMessage: message
      });
    } catch {}
    return { productId, status: 'error', message };
  }
}

export async function syncAllEnabledProducts(): Promise<{
  settings: KabumSyncSettings;
  total: number;
  results: SyncOneResult[];
}> {
  if (!hasAdmin) {
    return { settings: getDefaultSettings(), total: 0, results: [] };
  }

  const settings = await getSettings();
  const limit = Math.max(1, Math.min(50, Math.floor(settings.max_parallel_agents || 10)));

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id')
    .eq('kabum_sync_enabled', true)
    .not('kabum_url', 'is', null);

  if (error) throw error;

  const ids = (data || []).map((r: any) => String(r.id)).filter(Boolean);
  const results = await runWithConcurrency(ids, limit, async id => {
    await sleep(200);
    return syncOneProduct(id);
  });

  return { settings, total: ids.length, results };
}

export async function repriceAllEnabledProducts(inputSettings?: KabumSyncSettings): Promise<{
  settings: KabumSyncSettings;
  total: number;
  updated: number;
}> {
  if (!hasAdmin) {
    return { settings: inputSettings || getDefaultSettings(), total: 0, updated: 0 };
  }

  const settings = inputSettings || (await getSettings());

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('id,price,kabum_last_price,kabum_last_stock,kabum_url')
    .eq('kabum_sync_enabled', true)
    .not('kabum_url', 'is', null)
    .not('kabum_last_price', 'is', null)
    .limit(1000);

  if (error) throw error;

  const items = (data || []).map((r: any) => ({
    id: String(r.id),
    currentPrice: String(r.price || ''),
    kabumLastPrice: Number(r.kabum_last_price),
    kabumLastStock: r.kabum_last_stock == null ? null : String(r.kabum_last_stock),
    kabumUrl: r.kabum_url == null ? null : String(r.kabum_url)
  }));

  let updated = 0;
  for (const p of items) {
    if (!Number.isFinite(p.kabumLastPrice) || p.kabumLastPrice <= 0) continue;
    const suggested = calculateBalaoPrice(p.kabumLastPrice, settings);
    if (!Number.isFinite(suggested) || suggested <= 0) continue;

    const newPriceString = formatBRL(suggested);
    const oldPriceNumber = parsePriceToNumber(p.currentPrice);

    const { error: updError } = await supabaseAdmin
      .from('products')
      .update({
        price: newPriceString,
        kabum_sync_status: 'repriced',
        kabum_sync_error: null
      })
      .eq('id', p.id);

    if (updError) continue;

    await logSync({
      productId: p.id,
      kabumUrl: p.kabumUrl,
      oldBalaoPrice: Number.isFinite(oldPriceNumber) ? oldPriceNumber : null,
      newBalaoPrice: suggested,
      kabumPrice: p.kabumLastPrice,
      kabumStock: p.kabumLastStock,
      status: 'repriced',
      errorMessage: null
    });

    updated += 1;
  }

  return { settings, total: items.length, updated };
}
