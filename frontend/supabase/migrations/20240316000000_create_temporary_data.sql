-- Enable the pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the temporary_data table with automatic deletion
CREATE TABLE IF NOT EXISTS temporary_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT NOT NULL,
    message TEXT NOT NULL
);

-- Create an index on created_at for better performance of the retention policy
CREATE INDEX IF NOT EXISTS idx_temporary_data_created_at ON temporary_data(created_at);

-- Create a function to delete old records
CREATE OR REPLACE FUNCTION delete_old_temporary_data()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    DELETE FROM temporary_data
    WHERE created_at < NOW() - INTERVAL '15 days';
END;
$$;

-- Instead of using pg_cron, we'll use a trigger to check and delete old records on insert
CREATE OR REPLACE FUNCTION check_and_delete_old_records()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Delete records older than 15 days
    DELETE FROM temporary_data
    WHERE created_at < NOW() - INTERVAL '15 days';
    RETURN NEW;
END;
$$;

-- Create the trigger to run the cleanup function on each insert
CREATE TRIGGER cleanup_old_records
    AFTER INSERT ON temporary_data
    FOR EACH STATEMENT
    EXECUTE FUNCTION check_and_delete_old_records();

-- Add RLS policies
ALTER TABLE temporary_data ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert and select
CREATE POLICY "Allow authenticated users to insert" ON temporary_data
    FOR INSERT TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated users to select" ON temporary_data
    FOR SELECT TO authenticated
    USING (true);

-- Allow authenticated users to update their own records
CREATE POLICY "Allow authenticated users to update own records" ON temporary_data
    FOR UPDATE TO authenticated
    USING (auth.uid() IN (
        SELECT auth.uid()
        FROM auth.users
        WHERE users.id = auth.uid()
    ))
    WITH CHECK (true);

-- Allow authenticated users to delete their own records
CREATE POLICY "Allow authenticated users to delete own records" ON temporary_data
    FOR DELETE TO authenticated
    USING (auth.uid() IN (
        SELECT auth.uid()
        FROM auth.users
        WHERE users.id = auth.uid()
    ));

-- Enable realtime subscriptions for this table
ALTER PUBLICATION supabase_realtime ADD TABLE temporary_data; 