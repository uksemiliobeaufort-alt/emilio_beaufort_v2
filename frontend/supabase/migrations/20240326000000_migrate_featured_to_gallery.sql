-- Migration to copy featured_image_base64 to gallery_base64 for existing posts
-- This ensures all existing posts have their images in the gallery_base64 array

UPDATE blog_posts 
SET gallery_base64 = ARRAY[featured_image_base64]
WHERE featured_image_base64 IS NOT NULL 
  AND (gallery_base64 IS NULL OR array_length(gallery_base64, 1) = 0);

-- Add a comment for documentation
COMMENT ON COLUMN blog_posts.gallery_base64 IS 'Array of base64-encoded images for the blog post gallery';
COMMENT ON COLUMN blog_posts.featured_image_base64 IS 'Primary featured image in base64 format (legacy - use gallery_base64[1] instead)'; 