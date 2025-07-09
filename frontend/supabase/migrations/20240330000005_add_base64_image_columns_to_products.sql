-- Add base64 image columns to cosmetics table
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS main_image_base64 TEXT;
ALTER TABLE cosmetics ADD COLUMN IF NOT EXISTS gallery_base64 TEXT[];

-- Add base64 image columns to hair_extensions table  
ALTER TABLE hair_extensions ADD COLUMN IF NOT EXISTS main_image_base64 TEXT;
ALTER TABLE hair_extensions ADD COLUMN IF NOT EXISTS gallery_base64 TEXT[];

-- Add comments for documentation
COMMENT ON COLUMN cosmetics.main_image_base64 IS 'Main product image in base64 format';
COMMENT ON COLUMN cosmetics.gallery_base64 IS 'Array of base64-encoded gallery images';
COMMENT ON COLUMN hair_extensions.main_image_base64 IS 'Main product image in base64 format';
COMMENT ON COLUMN hair_extensions.gallery_base64 IS 'Array of base64-encoded gallery images';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS cosmetics_main_image_base64_idx ON cosmetics(main_image_base64);
CREATE INDEX IF NOT EXISTS hair_extensions_main_image_base64_idx ON hair_extensions(main_image_base64); 