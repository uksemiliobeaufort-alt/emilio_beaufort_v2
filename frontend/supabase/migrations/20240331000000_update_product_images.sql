-- Drop base64 columns from cosmetics table if they exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cosmetics' AND column_name = 'main_image_base64') THEN
        ALTER TABLE cosmetics DROP COLUMN main_image_base64;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cosmetics' AND column_name = 'gallery_base64') THEN
        ALTER TABLE cosmetics DROP COLUMN gallery_base64;
    END IF;
END $$;

-- Drop base64 columns from hair_extensions table if they exist
DO $$ 
BEGIN 
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hair_extensions' AND column_name = 'main_image_base64') THEN
        ALTER TABLE hair_extensions DROP COLUMN main_image_base64;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hair_extensions' AND column_name = 'gallery_base64') THEN
        ALTER TABLE hair_extensions DROP COLUMN gallery_base64;
    END IF;
END $$;

-- Add URL columns to cosmetics table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cosmetics' AND column_name = 'main_image_url') THEN
        ALTER TABLE cosmetics ADD COLUMN main_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cosmetics' AND column_name = 'gallery_urls') THEN
        ALTER TABLE cosmetics ADD COLUMN gallery_urls TEXT[];
    END IF;
END $$;

-- Add URL columns to hair_extensions table if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hair_extensions' AND column_name = 'main_image_url') THEN
        ALTER TABLE hair_extensions ADD COLUMN main_image_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'hair_extensions' AND column_name = 'gallery_urls') THEN
        ALTER TABLE hair_extensions ADD COLUMN gallery_urls TEXT[];
    END IF;
END $$;

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cosmetics-images', 'cosmetics-images', true),
  ('hair-extensions-images', 'hair-extensions-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create storage policies
-- Allow public read access since buckets are public
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('cosmetics-images', 'hair-extensions-images'));

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('cosmetics-images', 'hair-extensions-images')
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('cosmetics-images', 'hair-extensions-images')
  AND auth.role() = 'authenticated'
); 