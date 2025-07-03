-- Create page_views table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at);

-- Enable real-time for this table
ALTER TABLE page_views REPLICA IDENTITY FULL;

-- Set up RLS (Row Level Security)
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for tracking)
CREATE POLICY "Allow public insert" ON page_views
  FOR INSERT TO public
  WITH CHECK (true);

-- Allow authenticated users to view all records
CREATE POLICY "Allow authenticated read" ON page_views
  FOR SELECT TO authenticated
  USING (true); 