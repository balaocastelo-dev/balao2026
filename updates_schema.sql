-- Add metadata column to carousel_images if it doesn't exist
ALTER TABLE carousel_images 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create a table for import history if desired (optional but good for "Register in history")
CREATE TABLE IF NOT EXISTS import_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    product_count INTEGER,
    price_percentage NUMERIC,
    applied_category TEXT,
    applied_scope TEXT
);
