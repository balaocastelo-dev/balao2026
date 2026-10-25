
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/route';
import { createOrder, getProductById } from '@/lib/db';

// Mocks
vi.mock('@/lib/db', () => ({
  createOrder: vi.fn().mockResolvedValue({ id: '12345' }),
  // O checkout reprecifica pelo banco: o produto p1 custa R$ 100,00 no site.
  getProductById: vi.fn().mockImplementation((id: string) =>
    Promise.resolve(id === 'p1' ? { id: 'p1', name: 'Produto 1', price: 'R$ 100,00', image: '', category: '', slug: 'p1' } : null)
  ),
  getProductsByCategory: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/lib/cache', () => ({
  getCachedProductByIdentifier: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/turso', () => ({
  turso: { execute: vi.fn().mockResolvedValue({ rows: [] }) },
  isTursoActive: () => true,
}));

vi.mock('@/lib/mail', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
  sendNewOrderNotification: vi.fn().mockResolvedValue(true),
  sendSystemNotification: vi.fn().mockResolvedValue(true),
}));

vi.mock('@/lib/coupons', () => ({
  validateCoupon: vi.fn().mockImplementation((code) => {
    if (code === 'TEST10') {
      return Promise.resolve({
        valid: true,
        discount: 10, // R$ 10.00 discount
        coupon: { code: 'TEST10', type: 'fixed', value: 10 }
      });
    }
    return Promise.resolve({ valid: false });
  }),
}));

describe('Checkout API with Coupons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('should process order correctly when total matches calculated total with coupon', async () => {
    const req = {
      json: async () => ({
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '11999999999',
          address: 'Rua Teste',
          cep: '00000000',
          city: 'Cidade',
          state: 'SP',
          number: '123'
        },
        items: [
          { product_id: 'p1', name: 'Produto 1', price: 100, quantity: 1 }
        ],
        total: 90, // 100 - 10 discount
        shippingCost: 0,
        shippingOption: { name: 'PAC', days: '4 a 5 dias úteis', cost: 0 },
        couponCode: 'TEST10',
        discountValue: 10
      })
    } as unknown as Request;

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).not.toBe(500);
    expect(data.success).toBe(true);
    expect(console.warn).not.toHaveBeenCalledWith(expect.stringContaining('Price mismatch'));
  });

  it('should log warning when total does NOT match calculated total', async () => {
    const req = {
      json: async () => ({
        customer: {
          name: 'Test User',
          email: 'test@example.com',
          phone: '11999999999',
          address: 'Rua Teste',
          cep: '00000000',
          city: 'Cidade',
          state: 'SP',
          number: '123'
        },
        items: [
          { product_id: 'p1', name: 'Produto 1', price: 100, quantity: 1 }
        ],
        total: 100, // Sending 100 instead of 90 (simulating the bug)
        shippingCost: 0,
        shippingOption: { name: 'PAC', days: '4 a 5 dias úteis', cost: 0 },
        couponCode: 'TEST10',
        discountValue: 10
      })
    } as unknown as Request;

    const res = await POST(req);
    
    expect(res.status).not.toBe(500); // It still succeeds
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('CRITICAL: Price mismatch'));
  });

  const pedidoCom = (itens: unknown[], total: number) => ({
    json: async () => ({
      customer: { name: 'T', email: 't@example.com', phone: '1', address: 'R', cep: '0', city: 'C', state: 'SP', number: '1' },
      items: itens,
      total,
      shippingCost: 0,
      shippingOption: { name: 'Retirada', days: 'hoje', cost: 0 },
    }),
  }) as unknown as Request;

  it('não cria o pedido com preço antigo do carrinho (queda de preço) e devolve o preço novo', async () => {
    const res = await POST(pedidoCom([{ product_id: 'p1', name: 'Produto 1', price: 'R$ 120,00', quantity: 1 }], 120));
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error).toBe('precos_atualizados');
    expect(data.itens[0]).toMatchObject({ id: 'p1', price: 'R$ 100,00' });
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('não aceita preço adulterado no navegador', async () => {
    const res = await POST(pedidoCom([{ product_id: 'p1', name: 'Produto 1', price: 1, quantity: 1 }], 1));
    expect(res.status).toBe(409);
    expect(createOrder).not.toHaveBeenCalled();
  });

  it('grava o pedido com o preço do banco', async () => {
    const res = await POST(pedidoCom([{ product_id: 'p1', name: 'Produto 1', price: 100, quantity: 2 }], 200));
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.total).toBe(200);
    const [, itens] = (createOrder as unknown as { mock: { calls: unknown[][] } }).mock.calls[0];
    expect((itens as { price: number }[])[0].price).toBe(100);
  });

  it('recusa produto que não existe mais no site', async () => {
    const res = await POST(pedidoCom([{ product_id: 'sumiu', name: 'X', price: 10, quantity: 1 }], 10));
    const data = await res.json();
    expect(res.status).toBe(409);
    expect(data.error).toBe('produto_indisponivel');
    expect(getProductById).toHaveBeenCalledWith('sumiu');
  });
});
