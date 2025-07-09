-- Create hair_extensions table for hair extension-specific product information
CREATE TABLE hair_extensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    hair_type VARCHAR(100),
    hair_texture VARCHAR(50),
    hair_length VARCHAR(50),
    hair_weight VARCHAR(50),
    hair_color_shade VARCHAR(100),
    installation_method VARCHAR(50),
    care_instructions TEXT,
    quantity_in_set VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for hair_extensions table
ALTER TABLE hair_extensions ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all hair extensions
CREATE POLICY "Anyone can read hair_extensions" ON hair_extensions FOR SELECT USING (true);

-- Policy for authenticated users to insert hair extensions
CREATE POLICY "Authenticated users can insert hair_extensions" ON hair_extensions FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update hair extensions
CREATE POLICY "Authenticated users can update hair_extensions" ON hair_extensions FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete hair extensions
CREATE POLICY "Authenticated users can delete hair_extensions" ON hair_extensions FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create index on product_id for better performance
CREATE INDEX idx_hair_extensions_product_id ON hair_extensions(product_id);

-- Create updated_at trigger
CREATE TRIGGER update_hair_extensions_updated_at 
    BEFORE UPDATE ON hair_extensions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 