-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL,
    expiration_date TIMESTAMP WITH TIME ZONE,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    min_purchase_value NUMERIC DEFAULT 0,
    applicable_products JSONB DEFAULT '[]', -- List of product IDs
    applicable_categories JSONB DEFAULT '[]', -- List of category names
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookup by code
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_coupons_updated_at ON coupons;
CREATE TRIGGER update_coupons_updated_at
    BEFORE UPDATE ON coupons
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Allow read access to everyone (needed for validation)
DROP POLICY IF EXISTS "Public read access for coupons" ON coupons;
CREATE POLICY "Public read access for coupons" ON coupons
    FOR SELECT USING (true);

-- Allow full access to authenticated service role (admin)
DROP POLICY IF EXISTS "Service role full access" ON coupons;
CREATE POLICY "Service role full access" ON coupons
    USING (auth.role() = 'service_role');

-- Add coupon columns to orders table if they don't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0;
