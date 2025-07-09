-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('cosmetics-images', 'cosmetics-images', true),
  ('hair-extensions-images', 'hair-extensions-images', true)
ON CONFLICT (id) DO NOTHING;

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