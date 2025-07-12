-- Create partnership_inquiries table for storing partnership inquiries
CREATE TABLE partnership_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_partnership_inquiries_email ON partnership_inquiries(email);
CREATE INDEX idx_partnership_inquiries_company ON partnership_inquiries(company);
CREATE INDEX idx_partnership_inquiries_status ON partnership_inquiries(status);
CREATE INDEX idx_partnership_inquiries_created_at ON partnership_inquiries(created_at);

-- Enable Row Level Security
ALTER TABLE partnership_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert partnership inquiries (for the form)
CREATE POLICY "Allow partnership inquiries insert for all" ON partnership_inquiries
  FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can read partnership inquiries
CREATE POLICY "Allow partnership inquiries read for admins" ON partnership_inquiries
  FOR SELECT 
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can update partnership inquiries
CREATE POLICY "Allow partnership inquiries update for admins" ON partnership_inquiries
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Set up automatic updating of updated_at column
CREATE OR REPLACE FUNCTION update_partnership_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_partnership_inquiries_updated_at
    BEFORE UPDATE ON partnership_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_partnership_inquiries_updated_at(); 