import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSupabaseAdmin, mockSelect, mockIlike, mockLimit, mockEq, mockOrder, mockSingle } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockLimit = vi.fn();
  const mockOrder = vi.fn();
  
  // Chain setups
  const mockIlike = vi.fn(() => ({ limit: mockLimit }));
  
  // eq returns object that has order and single
  const mockEq = vi.fn(() => ({ 
      order: mockOrder,
      single: mockSingle
  }));

  // select returns object that has ilike and eq
  const mockSelect = vi.fn(() => ({ 
      ilike: mockIlike, 
      eq: mockEq 
  }));

  const mockSupabaseAdmin = {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
  };
  
  return { mockSupabaseAdmin, mockSelect, mockIlike, mockLimit, mockEq, mockOrder, mockSingle };
});

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: mockSupabaseAdmin,
}));

import { validateCoupon, getCouponByCode } from '../../lib/coupons';

describe('Coupons Library', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default return values for chains if needed
    mockSelect.mockReturnValue({ ilike: mockIlike, eq: mockEq });
    mockIlike.mockReturnValue({ limit: mockLimit });
    mockEq.mockReturnValue({ order: mockOrder, single: mockSingle });
  });

  describe('validateCoupon', () => {
    it('should return invalid if code is empty', async () => {
      const result = await validateCoupon('', 100, []);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Código inválido.');
    });

    it('should return invalid if coupon not found', async () => {
      mockLimit.mockResolvedValueOnce({ data: [], error: null });

      const result = await validateCoupon('INVALID', 100, []);
      expect(result.valid).toBe(false);
      expect(result.message).toBe('Cupom não encontrado.');
    });

    it('should validate a valid percentage coupon', async () => {
      const mockCoupon = {
        id: '1',
        code: 'TEST10',
        discount_type: 'percentage',
        discount_value: 10,
        status: 'active',
        expiration_date: null,
        min_purchase_value: 50,
      };

      mockLimit.mockResolvedValueOnce({ data: [mockCoupon], error: null });

      const result = await validateCoupon('TEST10', 100, [{ price: 100, quantity: 1 }]);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(10);
    });

    it('should validate a valid fixed value coupon', async () => {
      const mockCoupon = {
        id: '2',
        code: 'FIXED20',
        discount_type: 'fixed',
        discount_value: 20,
        status: 'active',
        expiration_date: null,
        min_purchase_value: 0,
      };

      mockLimit.mockResolvedValueOnce({ data: [mockCoupon], error: null });

      const result = await validateCoupon('FIXED20', 100, [{ price: 100, quantity: 1 }]);
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(20);
    });

    it('should fail if minimum purchase not met', async () => {
        const mockCoupon = {
          id: '3',
          code: 'MIN100',
          discount_type: 'percentage',
          discount_value: 10,
          status: 'active',
          min_purchase_value: 100,
        };
  
        mockLimit.mockResolvedValueOnce({ data: [mockCoupon], error: null });
  
        const result = await validateCoupon('MIN100', 50, [{ price: 50, quantity: 1 }]);
        expect(result.valid).toBe(false);
        expect(result.message).toContain('Valor mínimo');
    });

    it('should fail if coupon is inactive', async () => {
        const mockCoupon = {
          id: '4',
          code: 'INACTIVE',
          status: 'inactive',
        };
  
        mockLimit.mockResolvedValueOnce({ data: [mockCoupon], error: null });
  
        const result = await validateCoupon('INACTIVE', 100, []);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Este cupom não está mais ativo.');
    });

    it('should fail if coupon is expired', async () => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1);

        const mockCoupon = {
          id: '5',
          code: 'EXPIRED',
          status: 'active',
          expiration_date: pastDate.toISOString(),
        };
  
        mockLimit.mockResolvedValueOnce({ data: [mockCoupon], error: null });
  
        const result = await validateCoupon('EXPIRED', 100, []);
        expect(result.valid).toBe(false);
        expect(result.message).toBe('Este cupom expirou.');
    });
  });

  describe('getCouponByCode', () => {
      it('should return coupon if found', async () => {
        const mockCoupon = { id: '1', code: 'TEST' };
        mockLimit.mockResolvedValueOnce({ data: [mockCoupon], error: null });

        const result = await getCouponByCode('TEST');
        expect(result).toEqual(mockCoupon);
      });

      it('should return null if not found', async () => {
        mockLimit.mockResolvedValueOnce({ data: [], error: null });

        const result = await getCouponByCode('TEST');
        expect(result).toBeNull();
      });
  });
});
