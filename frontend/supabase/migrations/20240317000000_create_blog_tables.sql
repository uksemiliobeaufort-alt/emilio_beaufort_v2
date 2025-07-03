-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    gallery TEXT[],
    excerpt TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    admin_email TEXT;
    token_parts TEXT[];
    token_email TEXT;
BEGIN
    -- Get the admin token from the request header
    IF current_setting('request.headers', true)::json->>'x-admin-token' IS NULL THEN
        RETURN false;
    END IF;

    -- Decode the base64 token
    token_parts := string_to_array(convert_from(decode(split_part(current_setting('request.headers', true)::json->>'x-admin-token', '.', 1), 'base64'), 'UTF8'), ':');
    IF array_length(token_parts, 1) < 1 THEN
        RETURN false;
    END IF;

    token_email := token_parts[1];

    -- Check if the email exists in admin_user table
    SELECT email INTO admin_email
    FROM admin_user
    WHERE email = token_email;

    RETURN admin_email IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to automatically update updated_at
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON blog_posts
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for admin users only" ON blog_posts
    FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Enable update for admin users only" ON blog_posts
    FOR UPDATE USING (is_admin());

CREATE POLICY "Enable delete for admin users only" ON blog_posts
    FOR DELETE USING (is_admin());

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog', 'blog', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;

-- Create storage policy for blog bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT
USING (bucket_id = 'blog');

CREATE POLICY "Admin Insert" ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'blog' 
    AND is_admin()
);

CREATE POLICY "Admin Update" ON storage.objects FOR UPDATE
USING (
    bucket_id = 'blog' 
    AND is_admin()
);

CREATE POLICY "Admin Delete" ON storage.objects FOR DELETE
USING (bucket_id = 'blog' AND is_admin()); 