-- Create products table for common product information
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    detailed_description TEXT,
    price DECIMAL(10,2),
    original_price DECIMAL(10,2),
    category VARCHAR(50) NOT NULL CHECK (category IN ('cosmetics', 'hair-extension')),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Add RLS policies for products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Policy for anyone to read published products
CREATE POLICY "Anyone can read published products" ON products FOR SELECT 
USING (status = 'published' OR auth.role() = 'authenticated');

-- Policy for authenticated users to insert products
CREATE POLICY "Authenticated users can insert products" ON products FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update products
CREATE POLICY "Authenticated users can update products" ON products FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete products
CREATE POLICY "Authenticated users can delete products" ON products FOR DELETE 
USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 