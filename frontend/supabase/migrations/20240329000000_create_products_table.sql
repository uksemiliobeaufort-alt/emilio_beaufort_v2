-- Create products table for storing product information
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  detailed_description TEXT,
  price DECIMAL(10,2),
  original_price DECIMAL(10,2),
  category TEXT NOT NULL CHECK (category IN ('skincare', 'shaving', 'fragrance', 'accessories', 'grooming-tools')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  weight DECIMAL(8,2),
  dimensions TEXT, -- JSON string for width, height, depth
  ingredients TEXT,
  usage_instructions TEXT,
  main_image_url TEXT,
  gallery_images TEXT[], -- Array of image URLs
  metadata JSONB DEFAULT '{}', -- Additional flexible data
  seo_title TEXT,
  seo_description TEXT,
  seo_keywords TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by TEXT,
  updated_by TEXT
);

-- Create indexes for better query performance
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_sku ON products(sku);

-- Full text search index
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '') || ' ' || COALESCE(detailed_description, '')));

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read access for published products
CREATE POLICY "Allow public read for published products" ON products
  FOR SELECT 
  TO anon, authenticated
  USING (status = 'published');

-- Allow authenticated users (admins) full access
CREATE POLICY "Allow admin full access" ON products
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Allow public read access to product images
CREATE POLICY "Public read access for product images" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'product-images');

-- Allow authenticated users to upload product images
CREATE POLICY "Admin upload access for product images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Allow authenticated users to update product images
CREATE POLICY "Admin update access for product images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images');

-- Allow authenticated users to delete product images
CREATE POLICY "Admin delete access for product images" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'product-images');

-- Set up automatic updating of updated_at column
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 