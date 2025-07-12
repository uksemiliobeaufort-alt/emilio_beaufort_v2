-- Create accepted_inquiries table for storing accepted partnership inquiries
CREATE TABLE accepted_inquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  original_id UUID REFERENCES partnership_inquiries(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  message TEXT NOT NULL,
  inquiry_type TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  accepted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_accepted_inquiries_email ON accepted_inquiries(email);
CREATE INDEX idx_accepted_inquiries_accepted_at ON accepted_inquiries(accepted_at);
CREATE INDEX idx_accepted_inquiries_company ON accepted_inquiries(company);
CREATE INDEX idx_accepted_inquiries_original_id ON accepted_inquiries(original_id);

-- Enable Row Level Security
ALTER TABLE accepted_inquiries ENABLE ROW LEVEL SECURITY;

-- Only authenticated users (admins) can read accepted inquiries
CREATE POLICY "Allow accepted inquiries read for admins" ON accepted_inquiries
  FOR SELECT 
  TO authenticated
  USING (true);

-- Only authenticated users (admins) can insert accepted inquiries
CREATE POLICY "Allow accepted inquiries insert for admins" ON accepted_inquiries
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users (admins) can update accepted inquiries
CREATE POLICY "Allow accepted inquiries update for admins" ON accepted_inquiries
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Set up automatic updating of updated_at column
CREATE OR REPLACE FUNCTION update_accepted_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_accepted_inquiries_updated_at
    BEFORE UPDATE ON accepted_inquiries
    FOR EACH ROW
    EXECUTE FUNCTION update_accepted_inquiries_updated_at();

-- Add status column to partnership_inquiries if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'partnership_inquiries' 
                   AND column_name = 'status') THEN
        ALTER TABLE partnership_inquiries ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create index for status column
CREATE INDEX IF NOT EXISTS idx_partnership_inquiries_status ON partnership_inquiries(status); 