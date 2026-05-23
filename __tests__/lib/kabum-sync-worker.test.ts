import { describe, it, expect, vi, beforeEach } from 'vitest';

type QueryResult = { data: any; error: any };

class MockQuery {
  private table: string;
  private ctx: any;
  private action: 'update' | 'insert' | 'select' | null = null;
  private payload: any = null;
  private selected: string | null = null;
  private filters: Record<string, any> = {};

  constructor(table: string, ctx: any) {
    this.table = table;
    this.ctx = ctx;
  }

  update(payload: any) {
    this.action = 'update';
    this.payload = payload;
    return this;
  }

  insert(payload: any) {
    this.action = 'insert';
    this.payload = payload;
    return this;
  }

  select(columns: string) {
    this.selected = columns;
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  eq(column: string, value: any) {
    this.filters[column] = value;
    return this;
  }

  or() {
    return this;
  }

  not() {
    return this;
  }

  maybeSingle() {
    return Promise.resolve(this.executeSingle());
  }

  single() {
    return Promise.resolve(this.executeSingle());
  }

  then(onFulfilled: any, onRejected: any) {
    return Promise.resolve(this.execute()).then(onFulfilled, onRejected);
  }

  private executeSingle(): QueryResult {
    const r = this.execute();
    if (Array.isArray(r.data)) {
      return { data: r.data[0] ?? null, error: r.error };
    }
    return r;
  }

  private execute(): QueryResult {
    if (this.table === 'products' && this.action === 'update') {
      const isLockAttempt = this.payload?.kabum_sync_status === 'syncing';
      if (isLockAttempt) {
        return { data: this.ctx.lockedProduct, error: null };
      }
      this.ctx.productUpdates.push({ filters: this.filters, payload: this.payload });
      return { data: null, error: null };
    }

    if (this.table === 'ai_kabum_sync_logs' && this.action === 'insert') {
      this.ctx.logs.push(this.payload);
      return { data: null, error: null };
    }

    if (this.table === 'ai_kabum_sync_settings' && this.action === null) {
      return { data: [], error: null };
    }

    return { data: null, error: null };
  }
}

const mockCtx = vi.hoisted(() => ({
  lockedProduct: null as any,
  productUpdates: [] as any[],
  logs: [] as any[]
}));

vi.mock('@/lib/supabase-admin', () => {
  return {
    hasAdmin: true,
    supabaseAdmin: {
      from: (table: string) => new MockQuery(table, mockCtx)
    }
  };
});

const fetchKabumProductData = vi.hoisted(() => vi.fn());
vi.mock('@/lib/kabum/scraper', () => ({ fetchKabumProductData }));

vi.mock('@/lib/ai/llama-agent', () => ({
  validateKabumMatch: vi.fn(async () => ({ confidence: 1, sameProduct: true, reason: 'ok' }))
}));

import { syncOneProduct } from '@/lib/kabum/sync-worker';

beforeEach(() => {
  mockCtx.productUpdates = [];
  mockCtx.logs = [];
  fetchKabumProductData.mockReset();
});

describe('kabum/sync-worker', () => {
  it('syncOneProduct should return error when product has no kabum_url', async () => {
    mockCtx.lockedProduct = {
      id: 'p1',
      name: 'Produto Teste',
      price: 'R$ 100,00',
      kabum_url: null
    };

    const r = await syncOneProduct('p1');
    expect(r.status).toBe('error');
    expect(mockCtx.productUpdates.length).toBeGreaterThan(0);
    expect(mockCtx.logs.length).toBeGreaterThan(0);
    expect(JSON.stringify(mockCtx.logs[0])).toContain('Produto sem kabum_url');
  });

  it('syncOneProduct should log error when Kabum scraping fails', async () => {
    mockCtx.lockedProduct = {
      id: 'p2',
      name: 'Produto Teste 2',
      price: 'R$ 200,00',
      kabum_url: 'https://www.kabum.com.br/produto/123'
    };

    fetchKabumProductData.mockResolvedValue({
      price: null,
      stock: 'Indisponível',
      title: null,
      available: false
    });

    const r = await syncOneProduct('p2');
    expect(r.status).toBe('error');
    expect(mockCtx.logs.length).toBeGreaterThan(0);
    expect(JSON.stringify(mockCtx.logs[0])).toContain('Falha ao obter preço na Kabum');
  });
});
