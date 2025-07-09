-- Create feedback table for storing user feedback
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT,
  type TEXT NOT NULL CHECK (type IN ('bug', 'suggestion', 'compliment')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for better query performance
CREATE INDEX idx_feedback_type ON feedback(type);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);
CREATE INDEX idx_feedback_email ON feedback(email) WHERE email IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for feedback submission)
CREATE POLICY "Allow feedback submission" ON feedback
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can read feedback
CREATE POLICY "Allow feedback read for admins" ON feedback
  FOR SELECT 
  TO authenticated
  USING (true);

-- Set up automatic updating of updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 