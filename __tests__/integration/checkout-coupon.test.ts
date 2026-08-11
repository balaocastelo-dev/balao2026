
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/checkout/route';

// Mocks
vi.mock('@/lib/db', () => ({
  createOrder: vi.fn().mockResolvedValue({ id: '12345' }),
}));

vi.mock('@/lib/supabase-admin', () => ({
  hasAdmin: true
}));

vi.mock('@/lib/mail', () => ({
  sendEmail: vi.fn().mockResolvedValue(true),
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
          { name: 'Produto 1', price: 100, quantity: 1 }
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
          { name: 'Produto 1', price: 100, quantity: 1 }
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
});
