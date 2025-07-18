-- Drop the existing career_form table if it exists
DROP TABLE IF EXISTS career_form CASCADE;

-- Create the career_form table with the correct schema
CREATE TABLE career_form (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    resume_url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    portfolio TEXT,
    cover_letter TEXT,
    job_title TEXT
);

-- Enable Row Level Security
ALTER TABLE career_form ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for public form submissions)
CREATE POLICY "Allow public insert" ON career_form
    FOR INSERT TO public, anon, authenticated
    WITH CHECK (true);

-- Allow anyone to select (for admin viewing)
CREATE POLICY "Allow public select" ON career_form
    FOR SELECT TO public, anon, authenticated
    USING (true); 