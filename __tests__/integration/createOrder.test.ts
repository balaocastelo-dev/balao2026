import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrder } from '../../lib/db';

// Mock do cliente Turso
const mockExecute = vi.fn();

vi.mock('../../lib/turso', () => ({
  turso: {
    execute: (...args: unknown[]) => mockExecute(...args),
  },
  isTursoActive: () => true,
}));

describe('createOrder Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExecute.mockImplementation(({ sql }: { sql: string }) => {
      if (sql.includes('SELECT * FROM orders')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  it('should create an order with coupon data', async () => {
    const mockOrder = {
      id: 'order-123',
      total: 100,
      coupon_code: 'TEST20',
      discount_value: 20,
    };

    mockExecute.mockImplementation(({ sql }: { sql: string }) => {
      if (sql.startsWith('SELECT * FROM orders')) {
        return Promise.resolve({ rows: [mockOrder] });
      }
      return Promise.resolve({ rows: [] });
    });

    const orderData = {
      status: 'pending' as const,
      total: 100,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      customer_whatsapp: '1234567890',
      address: { street: 'Main St' },
      coupon_code: 'TEST20',
      discount_value: 20,
    };

    const items = [
      { product_id: 'prod-1', product_name: 'Product 1', product_image: 'img1.jpg', quantity: 1, price: 100 },
    ];

    const result = await createOrder(orderData, items);

    // 1 INSERT orders + 1 INSERT order_items + 1 SELECT order + 1 SELECT items
    expect(mockExecute).toHaveBeenCalledTimes(4);

    const orderInsertCall = mockExecute.mock.calls.find(
      (c) => (c[0] as { sql: string }).sql.includes('INSERT INTO orders')
    ) as [{ sql: string; args: unknown[] }] | undefined;

    expect(orderInsertCall).toBeDefined();
    expect(orderInsertCall![0].args).toContain('TEST20');
    expect(orderInsertCall![0].args).toContain(100);
    expect(orderInsertCall![0].args).toContain(20);

    expect(result?.id).toBe('order-123');
    expect(result?.coupon_code).toBe('TEST20');
  });

  it('should handle order creation without coupon', async () => {
    const mockOrder = {
      id: 'order-456',
      total: 100,
      coupon_code: null,
      discount_value: null,
    };

    mockExecute.mockImplementation(({ sql }: { sql: string }) => {
      if (sql.startsWith('SELECT * FROM orders')) {
        return Promise.resolve({ rows: [mockOrder] });
      }
      return Promise.resolve({ rows: [] });
    });

    const orderData = {
      status: 'pending' as const,
      total: 100,
      customer_name: 'Jane Doe',
      customer_email: 'jane@example.com',
      customer_whatsapp: '0987654321',
      address: { street: 'Second St' },
      // No coupon data
    };

    const items = [
      { product_id: 'prod-2', product_name: 'Product 2', product_image: 'img2.jpg', quantity: 1, price: 100 },
    ];

    const result = await createOrder(orderData, items);

    const orderInsertCall = mockExecute.mock.calls.find(
      (c) => (c[0] as { sql: string }).sql.includes('INSERT INTO orders')
    ) as [{ sql: string; args: unknown[] }] | undefined;

    expect(orderInsertCall).toBeDefined();
    // coupon_code e discount_value ficam como NULL
    expect(orderInsertCall![0].args[7]).toBeNull();
    expect(orderInsertCall![0].args[8]).toBeNull();

    expect(result?.id).toBe('order-456');
  });
});
