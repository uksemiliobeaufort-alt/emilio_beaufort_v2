-- Enable real-time subscriptions for cosmetics and hair_extensions tables
-- Add cosmetics table to real-time publication
DO $$
BEGIN
    -- Check if the table is already in the publication
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'cosmetics'
    ) THEN
        -- Add to publication only if not already a member
        ALTER PUBLICATION supabase_realtime ADD TABLE cosmetics;
    END IF;
END
$$;

-- Add hair_extensions table to real-time publication
DO $$
BEGIN
    -- Check if the table is already in the publication
    IF NOT EXISTS (
        SELECT 1
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'hair_extensions'
    ) THEN
        -- Add to publication only if not already a member
        ALTER PUBLICATION supabase_realtime ADD TABLE hair_extensions;
    END IF;
END
$$;

-- Add comments for documentation
COMMENT ON TABLE cosmetics IS 'Cosmetics products table with real-time subscriptions enabled';
COMMENT ON TABLE hair_extensions IS 'Hair extensions products table with real-time subscriptions enabled'; 