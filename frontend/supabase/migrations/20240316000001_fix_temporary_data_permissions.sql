-- First disable RLS to ensure we can modify the policies
ALTER TABLE temporary_data DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON temporary_data;
DROP POLICY IF EXISTS "Allow authenticated users to select" ON temporary_data;
DROP POLICY IF EXISTS "Allow authenticated users to update own records" ON temporary_data;
DROP POLICY IF EXISTS "Allow authenticated users to delete own records" ON temporary_data;
DROP POLICY IF EXISTS "Allow admin insert" ON temporary_data;
DROP POLICY IF EXISTS "Allow admin select" ON temporary_data;
DROP POLICY IF EXISTS "Allow admin update" ON temporary_data;
DROP POLICY IF EXISTS "Allow admin delete" ON temporary_data;
DROP POLICY IF EXISTS "Admin bypass RLS" ON temporary_data;
DROP POLICY IF EXISTS "Admin full access" ON temporary_data;

-- Enable RLS
ALTER TABLE temporary_data ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations for everyone (since we handle auth in the application)
CREATE POLICY "Allow all operations" ON temporary_data
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Grant all privileges to authenticated and anonymous users
GRANT ALL ON temporary_data TO authenticated;
GRANT ALL ON temporary_data TO anon;

-- Safely handle publication membership
DO $$
BEGIN
    -- Check if the table is already in the publication
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'temporary_data'
    ) THEN
        -- Add to publication only if not already a member
        ALTER PUBLICATION supabase_realtime ADD TABLE temporary_data;
    END IF;
END
$$; 