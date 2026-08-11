import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder } from '../../lib/db';

// Mock supabaseAdmin
const mockInsert = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock('../../lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      insert: mockInsert.mockReturnValue({
        select: mockSelect.mockReturnValue({
          single: mockSingle
        })
      })
    }))
  }
}));

describe('createOrder Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create an order with coupon data', async () => {
    // Mock successful order creation
    const mockOrder = {
      id: 'order-123',
      total: 100,
      coupon_code: 'TEST20',
      discount_value: 20
    };

    mockSingle.mockResolvedValue({ data: mockOrder, error: null });
    // Mock successful items insertion
    mockInsert.mockImplementationOnce(() => ({
        select: () => ({
            single: () => Promise.resolve({ data: mockOrder, error: null })
        })
    })).mockImplementationOnce(() => Promise.resolve({ error: null })); // For order_items

    const orderData = {
      status: 'pending' as const,
      total: 100,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_whatsapp: '1234567890',
      address: { street: 'Main St' },
      coupon_code: 'TEST20',
      discount_value: 20
    };

    const items = [
      { product_id: 'prod-1', product_name: 'Product 1', product_image: 'img1.jpg', quantity: 1, price: 100 }
    ];

    const result = await createOrder(orderData, items as any);

    // Verify order insertion
    expect(mockInsert).toHaveBeenCalledTimes(2); // 1 for order, 1 for items
    
    // Check first call (order creation)
    const orderInsertCall = mockInsert.mock.calls[0][0];
    expect(orderInsertCall).toMatchObject({
      coupon_code: 'TEST20',
      discount_value: 20,
      total: 100
    });

    expect(result).toEqual(mockOrder);
  });

  it('should handle order creation without coupon', async () => {
    const mockOrder = {
      id: 'order-456',
      total: 100,
      coupon_code: null,
      discount_value: 0
    };

    mockSingle.mockResolvedValue({ data: mockOrder, error: null });
    // Reset mock for this test
    mockInsert.mockImplementationOnce(() => ({
        select: () => ({
            single: () => Promise.resolve({ data: mockOrder, error: null })
        })
    })).mockImplementationOnce(() => Promise.resolve({ error: null }));

    const orderData = {
      status: 'pending' as const,
      total: 100,
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      customer_whatsapp: '0987654321',
      address: { street: 'Second St' }
      // No coupon data
    };

    const items = [
      { product_id: 'prod-2', product_name: 'Product 2', product_image: 'img2.jpg', quantity: 1, price: 100 }
    ];

    const result = await createOrder(orderData, items as any);

    const orderInsertCall = mockInsert.mock.calls[0][0];
    expect(orderInsertCall.coupon_code).toBeUndefined();
    expect(orderInsertCall.discount_value).toBeUndefined();

    expect(result).toEqual(mockOrder);
  });
});
