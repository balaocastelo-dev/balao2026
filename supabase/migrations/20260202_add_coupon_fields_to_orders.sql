-- Add coupon fields to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS coupon_code TEXT,
ADD COLUMN IF NOT EXISTS discount_value DECIMAL(10,2) DEFAULT 0;

-- Index for reporting/analytics on coupons
CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);
