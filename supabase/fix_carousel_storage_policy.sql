-- Fix Storage Permissions for Carousel
-- Ensure the 'carousel' bucket is public and accessible

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel', 'carousel', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Enable RLS (Commented out as it requires owner privileges and is usually already enabled)
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access Carousel" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload Carousel" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Carousel" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Carousel" ON storage.objects;

-- 4. Create policies
CREATE POLICY "Public Access Carousel"
ON storage.objects FOR SELECT
USING ( bucket_id = 'carousel' );

CREATE POLICY "Auth Upload Carousel"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'carousel' );

CREATE POLICY "Auth Update Carousel"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'carousel' );

CREATE POLICY "Auth Delete Carousel"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'carousel' );
