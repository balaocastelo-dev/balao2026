import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateCoupon } from '../lib/coupons';

// Mock supabaseAdmin
const mockSelect = vi.fn();
const mockIlike = vi.fn();
const mockLimit = vi.fn();

vi.mock('../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnValue({
        ilike: mockIlike.mockReturnValue({
          limit: mockLimit
        })
      })
    }))
  }
}));

describe('validateCoupon', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return invalid if code is missing', async () => {
    const result = await validateCoupon('', 100, []);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Código inválido.');
  });

  it('should return invalid if coupon not found', async () => {
    mockLimit.mockResolvedValue({ data: [], error: null });
    
    const result = await validateCoupon('INVALID', 100, []);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Cupom não encontrado.');
  });

  it('should return invalid if coupon is inactive', async () => {
    mockLimit.mockResolvedValue({ 
      data: [{ 
        status: 'inactive', 
        code: 'TEST',
        discount_type: 'percentage',
        discount_value: 10
      }], 
      error: null 
    });
    
    const result = await validateCoupon('TEST', 100, []);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Este cupom não está mais ativo.');
  });

  it('should return invalid if coupon is expired', async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    mockLimit.mockResolvedValue({ 
      data: [{ 
        status: 'active', 
        code: 'EXPIRED',
        expiration_date: yesterday.toISOString(),
        discount_type: 'percentage',
        discount_value: 10
      }], 
      error: null 
    });
    
    const result = await validateCoupon('EXPIRED', 100, []);
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Este cupom expirou.');
  });

  it('should validate percentage discount correctly', async () => {
    mockLimit.mockResolvedValue({ 
      data: [{ 
        status: 'active', 
        code: 'PERCENT',
        discount_type: 'percentage',
        discount_value: 10, // 10%
        id: '123'
      }], 
      error: null 
    });
    
    const items = [{ id: '1', price: 100, quantity: 1 }];
    const result = await validateCoupon('PERCENT', 100, items);
    
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(10); // 10% of 100
  });

  it('should validate fixed discount correctly', async () => {
    mockLimit.mockResolvedValue({ 
      data: [{ 
        status: 'active', 
        code: 'FIXED',
        discount_type: 'fixed',
        discount_value: 20, // R$ 20
        id: '124'
      }], 
      error: null 
    });
    
    const items = [{ id: '1', price: 100, quantity: 1 }];
    const result = await validateCoupon('FIXED', 100, items);
    
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(20);
  });

  it('should apply product restrictions correctly', async () => {
    mockLimit.mockResolvedValue({ 
      data: [{ 
        status: 'active', 
        code: 'PRODUCT_ONLY',
        discount_type: 'fixed',
        discount_value: 50,
        applicable_products: ['prod-1'],
        id: '125'
      }], 
      error: null 
    });
    
    const items = [
        { id: 'prod-1', price: 100, quantity: 1 },
        { id: 'prod-2', price: 100, quantity: 1 }
    ];
    // Should only apply to prod-1 (100)
    // Discount 50 capped at 100 (eligible total) -> 50
    
    const result = await validateCoupon('PRODUCT_ONLY', 200, items);
    
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(50);
  });

  it('should fail if no products match restriction', async () => {
    mockLimit.mockResolvedValue({ 
      data: [{ 
        status: 'active', 
        code: 'PRODUCT_ONLY',
        discount_type: 'fixed',
        discount_value: 50,
        applicable_products: ['prod-3'],
        id: '125'
      }], 
      error: null 
    });
    
    const items = [
        { id: 'prod-1', price: 100, quantity: 1 },
        { id: 'prod-2', price: 100, quantity: 1 }
    ];
    
    const result = await validateCoupon('PRODUCT_ONLY', 200, items);
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe("Este cupom não se aplica aos produtos no carrinho.");
  });
});
