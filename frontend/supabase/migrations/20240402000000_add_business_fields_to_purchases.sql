-- Add business-related fields to purchases table
-- This migration adds the new fields needed for the inquiry form

-- Add new columns for business details
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS company_type TEXT;

-- Add comments for new fields
COMMENT ON COLUMN purchases.business_name IS 'Business or company name of the customer';
COMMENT ON COLUMN purchases.gst_number IS 'GST number for business customers';
COMMENT ON COLUMN purchases.company_type IS 'Type of company (Proprietorship, Partnership, etc.)';
