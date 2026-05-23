import { isValidKabumUrl } from './validators';

export type KabumProductData = {
  price: number | null;
  stock: string | null;
  title: string | null;
  available: boolean;
  raw?: unknown;
};

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

function findProductInJsonLd(blocks: unknown[]): any | null {
  for (const b of blocks) {
    if (!b || typeof b !== 'object') continue;
    const obj: any = b;
    if (obj['@type'] === 'Product') return obj;
    if (Array.isArray(obj['@graph'])) {
      for (const node of obj['@graph']) {
        if (node && typeof node === 'object' && (node as any)['@type'] === 'Product') {
          return node;
        }
      }
    }
  }
  return null;
}

function extractKabumDataFromHtml(html: string): KabumProductData {
  const blocks = extractJsonLdBlocks(html);
  const product = findProductInJsonLd(blocks);

  let title: string | null = null;
  let price: number | null = null;
  let available = false;
  let stock: string | null = null;

  if (product) {
    if (typeof product.name === 'string') title = product.name;
    const offers = product.offers;
    const offer = Array.isArray(offers) ? offers[0] : offers;
    if (offer) {
      const rawPrice = offer.price ?? offer.lowPrice ?? offer.highPrice;
      const parsedPrice = typeof rawPrice === 'string' ? Number(rawPrice) : Number(rawPrice);
      if (Number.isFinite(parsedPrice)) price = parsedPrice;

      const availability = typeof offer.availability === 'string' ? offer.availability : '';
      available = /InStock/i.test(availability) || /LimitedAvailability/i.test(availability);
      stock = available ? 'Em estoque' : 'Indisponível';
    }
  }

  if (!Number.isFinite(price as any)) {
    const brlRegex = /R\$\s*([\d\.\,]+)/i;
    const m = html.match(brlRegex);
    if (m?.[1]) {
      const normalized = m[1].replace(/\./g, '').replace(',', '.');
      const parsed = Number(normalized);
      if (Number.isFinite(parsed)) price = parsed;
    }
  }

  if (!title) {
    const titleRegex = /<title>([\s\S]*?)<\/title>/i;
    const m = html.match(titleRegex);
    if (m?.[1]) title = m[1].replace(/\s+/g, ' ').trim();
  }

  return {
    price: price ?? null,
    stock,
    title,
    available,
    raw: { jsonLdBlocks: blocks.length }
  };
}

export async function fetchKabumProductData(kabumUrl: string): Promise<KabumProductData> {
  if (!isValidKabumUrl(kabumUrl)) {
    return { price: null, stock: null, title: null, available: false, raw: { error: 'invalid_url' } };
  }

  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(kabumUrl, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'accept-language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        'cache-control': 'no-cache',
        pragma: 'no-cache'
      }
    });

    const httpStatus = res.status;
    const html = await res.text();

    if (httpStatus === 403 || httpStatus === 429) {
      return { price: null, stock: null, title: null, available: false, raw: { error: 'blocked', httpStatus } };
    }

    if (!res.ok) {
      return { price: null, stock: null, title: null, available: false, raw: { error: 'http_error', httpStatus } };
    }

    const parsed = extractKabumDataFromHtml(html);
    return { ...parsed, raw: { ...(parsed.raw as any), httpStatus } };
  } catch (error: any) {
    const isAbort = error?.name === 'AbortError';
    return {
      price: null,
      stock: null,
      title: null,
      available: false,
      raw: { error: isAbort ? 'timeout' : 'fetch_error', message: String(error?.message || error) }
    };
  } finally {
    clearTimeout(timeout);
  }
}

