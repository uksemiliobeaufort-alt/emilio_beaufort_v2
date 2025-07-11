-- Drop existing tables if they exist
DROP TABLE IF EXISTS cosmetics CASCADE;
DROP TABLE IF EXISTS hair_extensions CASCADE;

-- Create cosmetics table with all product fields (both cosmetics and hair extension fields)
CREATE TABLE cosmetics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    main_image_url TEXT,
    gallery_images TEXT[],
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    metadata JSONB,
    
    -- Cosmetics-specific fields
    ingredients TEXT,
    skin_type VARCHAR(50),
    product_benefits TEXT,
    spf_level VARCHAR(20),
    volume_size VARCHAR(50),
    dermatologist_tested BOOLEAN DEFAULT FALSE,
    cruelty_free BOOLEAN DEFAULT FALSE,
    organic_natural BOOLEAN DEFAULT FALSE,
    
    -- Hair extension fields (will be empty for cosmetics)
    hair_type VARCHAR(100),
    hair_texture VARCHAR(50),
    hair_length VARCHAR(50),
    hair_weight VARCHAR(50),
    hair_color_shade VARCHAR(100),
    installation_method VARCHAR(50),
    care_instructions TEXT,
    quantity_in_set VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Create hair_extensions table with all product fields (both cosmetics and hair extension fields)
CREATE TABLE hair_extensions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    featured BOOLEAN DEFAULT FALSE,
    in_stock BOOLEAN DEFAULT TRUE,
    stock_quantity INTEGER DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    main_image_url TEXT,
    gallery_images TEXT[],
    seo_title VARCHAR(255),
    seo_description TEXT,
    seo_keywords TEXT[],
    metadata JSONB,
    
    -- Cosmetics fields (will be empty for hair extensions)
    ingredients TEXT,
    skin_type VARCHAR(50),
    product_benefits TEXT,
    spf_level VARCHAR(20),
    volume_size VARCHAR(50),
    dermatologist_tested BOOLEAN DEFAULT FALSE,
    cruelty_free BOOLEAN DEFAULT FALSE,
    organic_natural BOOLEAN DEFAULT FALSE,
    
    -- Hair extension-specific fields
    hair_type VARCHAR(100),
    hair_texture VARCHAR(50),
    hair_length VARCHAR(50),
    hair_weight VARCHAR(50),
    hair_color_shade VARCHAR(100),
    installation_method VARCHAR(50),
    care_instructions TEXT,
    quantity_in_set VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Add RLS policies for cosmetics table
ALTER TABLE cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published cosmetics" ON cosmetics FOR SELECT 
USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert cosmetics" ON cosmetics FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update cosmetics" ON cosmetics FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete cosmetics" ON cosmetics FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Add RLS policies for hair_extensions table
ALTER TABLE hair_extensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published hair_extensions" ON hair_extensions FOR SELECT 
USING (status = 'published' OR auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert hair_extensions" ON hair_extensions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update hair_extensions" ON hair_extensions FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete hair_extensions" ON hair_extensions FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_cosmetics_status ON cosmetics(status);
CREATE INDEX idx_cosmetics_featured ON cosmetics(featured);
CREATE INDEX idx_cosmetics_created_at ON cosmetics(created_at);

CREATE INDEX idx_hair_extensions_status ON hair_extensions(status);
CREATE INDEX idx_hair_extensions_featured ON hair_extensions(featured);
CREATE INDEX idx_hair_extensions_created_at ON hair_extensions(created_at);

-- Create updated_at triggers
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

CREATE TRIGGER update_hair_extensions_updated_at 
    BEFORE UPDATE ON hair_extensions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 