-- Create cosmetics table for cosmetics-specific product information
CREATE TABLE cosmetics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    ingredients TEXT,
    skin_type VARCHAR(50),
    product_benefits TEXT,
    spf_level VARCHAR(20),
    volume_size VARCHAR(50),
    dermatologist_tested BOOLEAN DEFAULT FALSE,
    cruelty_free BOOLEAN DEFAULT FALSE,
    organic_natural BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for cosmetics table
ALTER TABLE cosmetics ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all cosmetics
CREATE POLICY "Anyone can read cosmetics" ON cosmetics FOR SELECT USING (true);

-- Policy for authenticated users to insert cosmetics
CREATE POLICY "Authenticated users can insert cosmetics" ON cosmetics FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update cosmetics
CREATE POLICY "Authenticated users can update cosmetics" ON cosmetics FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete cosmetics
CREATE POLICY "Authenticated users can delete cosmetics" ON cosmetics FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create index on product_id for better performance
CREATE INDEX idx_cosmetics_product_id ON cosmetics(product_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cosmetics_updated_at 
    BEFORE UPDATE ON cosmetics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 