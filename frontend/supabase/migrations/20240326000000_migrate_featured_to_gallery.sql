-- Migrate existing featured images to gallery format
-- This ensures all existing featured images are also included in the gallery array
UPDATE blog_posts
SET gallery_base64 = ARRAY[featured_image_base64]
WHERE featured_image_base64 IS NOT NULL 
AND (gallery_base64 IS NULL OR array_length(gallery_base64, 1) IS NULL);

-- Add helpful comments
COMMENT ON COLUMN blog_posts.gallery_base64 IS 'Array of base64-encoded images for the blog post gallery';
COMMENT ON COLUMN blog_posts.featured_image_base64 IS 'Primary featured image in base64 format (legacy - use gallery_base64[1] instead)'; 