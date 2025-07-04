-- Add base64 image columns to blog_posts table
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS featured_image_base64 TEXT;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS gallery_base64 TEXT[];

-- Create index for better performance on base64 lookups
CREATE INDEX IF NOT EXISTS blog_posts_featured_image_idx ON blog_posts(featured_image_base64); 