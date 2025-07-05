-- Clear existing admin users and recreate with better emails
DELETE FROM admin_user WHERE email IN ('admin@gmail.com', 'admin@example.com', 'admin@emiliobeaufort.com');

-- Create admin users with better email formats that won't be rejected
SELECT create_admin_user_with_password('admin@beaufort.app', 'admin123');
SELECT create_admin_user_with_password('test@beaufort.app', 'test123');
SELECT create_admin_user_with_password('demo@beaufort.app', 'demo123');
SELECT create_admin_user_with_password('support@beaufort.app', 'support123');

-- Function to safely change admin password
CREATE OR REPLACE FUNCTION change_admin_password(
  user_email TEXT,
  new_password TEXT
)
RETURNS boolean AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user exists and is active
  SELECT EXISTS (
    SELECT 1 FROM admin_user 
    WHERE email = LOWER(TRIM(user_email)) AND is_active = true
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Update password
  UPDATE admin_user 
  SET 
    password_hash = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE email = LOWER(TRIM(user_email));
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to activate/deactivate admin user
CREATE OR REPLACE FUNCTION set_admin_status(
  user_email TEXT,
  active_status BOOLEAN
)
RETURNS boolean AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- Check if user exists
  SELECT EXISTS (
    SELECT 1 FROM admin_user 
    WHERE email = LOWER(TRIM(user_email))
  ) INTO user_exists;
  
  IF NOT user_exists THEN
    RETURN false;
  END IF;
  
  -- Update status
  UPDATE admin_user 
  SET 
    is_active = active_status,
    updated_at = NOW()
  WHERE email = LOWER(TRIM(user_email));
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to get admin user details
CREATE OR REPLACE FUNCTION get_admin_user(user_email TEXT)
RETURNS TABLE(
  id UUID,
  email TEXT,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  last_login TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    admin_user.id,
    admin_user.email,
    admin_user.is_active,
    admin_user.created_at,
    admin_user.last_login,
    admin_user.updated_at
  FROM admin_user
  WHERE admin_user.email = LOWER(TRIM(user_email));
END;
$$ LANGUAGE plpgsql;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION change_admin_password(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_admin_status(TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_user(TEXT) TO anon, authenticated; 