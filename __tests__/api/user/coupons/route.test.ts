import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '../../../../app/api/user/coupons/route';

// Mock supabase client
const mockGetUser = vi.fn();
const mockSupabase = {
  auth: {
    getUser: mockGetUser,
  },
};

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock coupon lib functions
vi.mock('@/lib/coupons', () => ({
  getUserCoupons: vi.fn(),
  getCouponByCode: vi.fn(),
  assignCouponToUser: vi.fn(),
}));

import { getUserCoupons, getCouponByCode, assignCouponToUser } from '@/lib/coupons';

describe('User Coupons API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if unauthorized', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: 'Auth error' });
      
      const req = new Request('http://localhost/api/user/coupons');
      const res = await GET(req);
      
      expect(res.status).toBe(401);
    });

    it('should return coupons if authorized', async () => {
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } }, error: null });
      const mockCoupons = [{ id: '1', code: 'TEST' }];
      (getUserCoupons as any).mockResolvedValue(mockCoupons);

      const req = new Request('http://localhost/api/user/coupons');
      const res = await GET(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.coupons).toEqual(mockCoupons);
      expect(getUserCoupons).toHaveBeenCalledWith('user123');
    });
  });

  describe('POST', () => {
    it('should return 401 if unauthorized', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: 'Auth error' });
      
      const req = new Request('http://localhost/api/user/coupons', {
          method: 'POST',
          body: JSON.stringify({ code: 'TEST' })
      });
      const res = await POST(req);
      
      expect(res.status).toBe(401);
    });

    it('should return 400 if code is missing', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } }, error: null });
        
        const req = new Request('http://localhost/api/user/coupons', {
            method: 'POST',
            body: JSON.stringify({})
        });
        const res = await POST(req);
        
        expect(res.status).toBe(400);
    });

    it('should return 404 if coupon not found', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } }, error: null });
        (getCouponByCode as any).mockResolvedValue(null);

        const req = new Request('http://localhost/api/user/coupons', {
            method: 'POST',
            body: JSON.stringify({ code: 'INVALID' })
        });
        const res = await POST(req);
        
        expect(res.status).toBe(404);
    });

    it('should return 400 if coupon inactive', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } }, error: null });
        (getCouponByCode as any).mockResolvedValue({ id: '1', status: 'inactive' });

        const req = new Request('http://localhost/api/user/coupons', {
            method: 'POST',
            body: JSON.stringify({ code: 'INACTIVE' })
        });
        const res = await POST(req);
        
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: "Este cupom não está mais ativo" });
    });

    it('should assign coupon if valid', async () => {
        mockGetUser.mockResolvedValue({ data: { user: { id: 'user123' } }, error: null });
        (getCouponByCode as any).mockResolvedValue({ id: '1', status: 'active' });
        (assignCouponToUser as any).mockResolvedValue({ id: 'uc1' });

        const req = new Request('http://localhost/api/user/coupons', {
            method: 'POST',
            body: JSON.stringify({ code: 'VALID' })
        });
        const res = await POST(req);
        
        expect(res.status).toBe(200);
        expect(assignCouponToUser).toHaveBeenCalledWith('user123', '1');
    });
  });
});
