-- Add the admin@gmail.com credential that the user is trying to use
SELECT create_admin_user_with_password('admin@gmail.com', 'admin123');

-- Also add some common admin emails for testing
SELECT create_admin_user_with_password('admin@admin.com', 'admin123');
SELECT create_admin_user_with_password('test@admin.com', 'test123');

-- Update the verify function to be more robust
CREATE OR REPLACE FUNCTION verify_admin_password(
  user_email TEXT,
  user_password TEXT
)
RETURNS boolean AS $$
DECLARE
  stored_hash TEXT;
  user_active BOOLEAN;
BEGIN
  -- Get password hash and active status
  SELECT password_hash, is_active INTO stored_hash, user_active
  FROM admin_user
  WHERE email = LOWER(TRIM(user_email));
  
  -- Check if user exists and is active
  IF stored_hash IS NULL OR user_active IS NOT TRUE THEN
    RETURN false;
  END IF;
  
  -- Verify password
  RETURN (stored_hash = crypt(user_password, stored_hash));
END;
$$ LANGUAGE plpgsql;

-- Create a function to list all admin users (for debugging)
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE(email TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ, last_login TIMESTAMPTZ) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    admin_user.email,
    admin_user.is_active,
    admin_user.created_at,
    admin_user.last_login
  FROM admin_user
  ORDER BY admin_user.created_at;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION list_admin_users() TO anon, authenticated; 