-- 1. Create carousel_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS carousel_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text NOT NULL,
  title text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add metadata column if it doesn't exist (for the update we just made)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'carousel_images' AND column_name = 'metadata') THEN
        ALTER TABLE carousel_images ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 3. Enable RLS on carousel_images
ALTER TABLE carousel_images ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (Dropping first to avoid conflicts if re-running)
DROP POLICY IF EXISTS "Public carousel images are viewable by everyone" ON carousel_images;
CREATE POLICY "Public carousel images are viewable by everyone"
  ON carousel_images FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Enable all operations for anon" ON carousel_images;
CREATE POLICY "Enable all operations for anon"
  ON carousel_images FOR ALL
  USING ( true )
  WITH CHECK ( true );

-- 5. Create import_history table
CREATE TABLE IF NOT EXISTS import_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    product_count INTEGER,
    price_percentage NUMERIC,
    applied_category TEXT,
    applied_scope TEXT
);

-- 6. Enable RLS on import_history (optional but good practice)
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all operations for anon history" ON import_history;
CREATE POLICY "Enable all operations for anon history"
  ON import_history FOR ALL
  USING ( true )
  WITH CHECK ( true );
