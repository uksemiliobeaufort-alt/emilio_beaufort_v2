-- Create founders bucket for storing founder images
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('founders', 'founders', true)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies to include founders bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create storage policies for all buckets
-- Allow public read access since buckets are public
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id IN ('cosmetics-images', 'hair-extensions-images', 'founders'));

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('cosmetics-images', 'hair-extensions-images', 'founders')
  AND auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('cosmetics-images', 'hair-extensions-images', 'founders')
  AND auth.role() = 'authenticated'
); 