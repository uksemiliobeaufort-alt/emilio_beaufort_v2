-- Create activity_events table for custom analytics
CREATE TABLE IF NOT EXISTS activity_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- anonymous user id (from cookie/localStorage)
  event_type TEXT NOT NULL, -- e.g. 'page_view', 'click'
  event_data JSONB, -- extra data (page, button, etc)
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by date
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON activity_events(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE activity_events ENABLE ROW LEVEL SECURITY;

-- Allow public to insert (for tracking)
CREATE POLICY "Allow public insert" ON activity_events
  FOR INSERT TO public
  WITH CHECK (true);

-- Allow authenticated users to read all records (for admin dashboard)
CREATE POLICY "Allow authenticated read" ON activity_events
  FOR SELECT TO authenticated
  USING (true); 