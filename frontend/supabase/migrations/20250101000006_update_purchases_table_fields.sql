-- Update purchases table to include business and personal name fields
-- Add new columns
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS personal_name TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS company_type TEXT;

-- Update existing records to populate new fields
-- If customer_name exists, copy it to personal_name
UPDATE purchases 
SET personal_name = customer_name 
WHERE personal_name IS NULL AND customer_name IS NOT NULL;

-- Rename existing columns to match new structure
ALTER TABLE purchases RENAME COLUMN customer_name TO personal_name_old;
ALTER TABLE purchases RENAME COLUMN customer_email TO email;
ALTER TABLE purchases RENAME COLUMN customer_phone TO phone;
ALTER TABLE purchases RENAME COLUMN shipping_address TO address;
ALTER TABLE purchases RENAME COLUMN shipping_city TO city;
ALTER TABLE purchases RENAME COLUMN shipping_state TO state;
ALTER TABLE purchases RENAME COLUMN shipping_pincode TO pincode;
ALTER TABLE purchases RENAME COLUMN total_amount TO total;

-- Drop the old column if it exists
ALTER TABLE purchases DROP COLUMN IF EXISTS personal_name_old;

-- Update indexes to reflect new column names
DROP INDEX IF EXISTS idx_purchases_customer_email;
CREATE INDEX IF NOT EXISTS idx_purchases_email ON purchases(email);

-- Add comments for new fields
COMMENT ON COLUMN purchases.business_name IS 'Business or company name of the customer';
COMMENT ON COLUMN purchases.personal_name IS 'Personal name of the customer';
COMMENT ON COLUMN purchases.email IS 'Customer email address';
COMMENT ON COLUMN purchases.phone IS 'Customer phone number';
COMMENT ON COLUMN purchases.gst_number IS 'GST number for business customers';
COMMENT ON COLUMN purchases.company_type IS 'Type of company (Proprietorship, Partnership, etc.)';
COMMENT ON COLUMN purchases.address IS 'Shipping address';
COMMENT ON COLUMN purchases.city IS 'Shipping city';
COMMENT ON COLUMN purchases.state IS 'Shipping state';
COMMENT ON COLUMN purchases.pincode IS 'Shipping pincode';
COMMENT ON COLUMN purchases.total IS 'Total order amount';
