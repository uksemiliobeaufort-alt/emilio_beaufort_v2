-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  featured_image_url TEXT,
  gallery TEXT[],
  excerpt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read blog posts
CREATE POLICY "Allow public read access" ON blog_posts
  FOR SELECT
  USING (true);

-- Allow authenticated users to create/update/delete blog posts
CREATE POLICY "Allow authenticated users to manage blog posts" ON blog_posts
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_blog_posts_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_posts_updated_at_column(); 