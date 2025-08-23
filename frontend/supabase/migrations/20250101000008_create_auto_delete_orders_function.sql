-- Create function to automatically delete orders older than 60 days
CREATE OR REPLACE FUNCTION auto_delete_old_orders()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
    cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Calculate date 60 days ago
    cutoff_date := NOW() - INTERVAL '60 days';
    
    -- Delete orders older than 60 days
    DELETE FROM purchases 
    WHERE created_at < cutoff_date;
    
    -- Get the count of deleted rows
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Log the deletion (optional)
    RAISE NOTICE 'Deleted % orders older than %', deleted_count, cutoff_date;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users (admins)
GRANT EXECUTE ON FUNCTION auto_delete_old_orders() TO authenticated;

-- Create a comment for documentation
COMMENT ON FUNCTION auto_delete_old_orders() IS 'Automatically deletes orders older than 60 days from the purchases table';

-- Optional: Create an index to improve deletion performance
CREATE INDEX IF NOT EXISTS idx_purchases_created_at_for_deletion ON purchases(created_at) 
WHERE created_at < (NOW() - INTERVAL '60 days');
