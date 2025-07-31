-- Migration to add HR role and update HR user permissions
-- This migration adds HR-specific role and permissions

-- First, check if role column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'role'
  ) THEN
    -- Add role column if it doesn't exist
    ALTER TABLE admin_user ADD COLUMN role TEXT DEFAULT 'admin';
    
    -- Update existing users to have admin role
    UPDATE admin_user SET role = 'admin' WHERE role IS NULL;
    
    -- Make role NOT NULL after setting defaults
    ALTER TABLE admin_user ALTER COLUMN role SET NOT NULL;
  END IF;
END $$;

-- Check if permissions column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'permissions'
  ) THEN
    -- Add permissions column if it doesn't exist
    ALTER TABLE admin_user ADD COLUMN permissions JSONB DEFAULT '{}';
  END IF;
END $$;

-- Check if department column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'department'
  ) THEN
    -- Add department column if it doesn't exist
    ALTER TABLE admin_user ADD COLUMN department TEXT;
  END IF;
END $$;

-- Check if first_name column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'first_name'
  ) THEN
    -- Add first_name column if it doesn't exist
    ALTER TABLE admin_user ADD COLUMN first_name TEXT;
  END IF;
END $$;

-- Check if last_name column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'last_name'
  ) THEN
    -- Add last_name column if it doesn't exist
    ALTER TABLE admin_user ADD COLUMN last_name TEXT;
  END IF;
END $$;

-- Check if updated_at column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'updated_at'
  ) THEN
    -- Add updated_at column if it doesn't exist
    ALTER TABLE admin_user ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Now update the role constraint to include 'hr'
ALTER TABLE admin_user DROP CONSTRAINT IF EXISTS admin_user_role_check;
ALTER TABLE admin_user ADD CONSTRAINT admin_user_role_check 
  CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer', 'hr'));

-- Update the check_admin_permission function to handle HR role
CREATE OR REPLACE FUNCTION check_admin_permission(
  user_email TEXT,
  required_permission TEXT
)
RETURNS boolean AS $$
DECLARE
  user_role TEXT;
  user_permissions JSONB;
BEGIN
  -- Get user role and permissions
  SELECT role, permissions INTO user_role, user_permissions
  FROM admin_user
  WHERE email = LOWER(TRIM(user_email)) AND is_active = true;
  
  -- Super admin has all permissions
  IF user_role = 'super_admin' THEN
    RETURN true;
  END IF;
  
  -- Check specific permission in JSONB
  IF user_permissions ? required_permission THEN
    RETURN (user_permissions->required_permission)::boolean;
  END IF;
  
  -- Default role-based permissions
  CASE user_role
    WHEN 'admin' THEN
      RETURN required_permission IN ('manage_users', 'manage_products', 'manage_blog', 'manage_careers', 'view_analytics', 'manage_partnerships');
    WHEN 'moderator' THEN
      RETURN required_permission IN ('manage_products', 'manage_blog', 'view_analytics');
    WHEN 'hr' THEN
      RETURN required_permission IN ('view_analytics', 'manage_careers');
    WHEN 'viewer' THEN
      RETURN required_permission IN ('view_analytics');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update HR user with specific permissions
CREATE OR REPLACE FUNCTION update_hr_user_permissions()
RETURNS void AS $$
BEGIN
  -- Update the HR user to have 'hr' role and specific permissions
  UPDATE admin_user 
  SET 
    role = 'hr',
    permissions = '{"view_analytics": true, "manage_careers": true}'::jsonb,
    department = 'Human Resources',
    first_name = 'HR',
    last_name = 'Manager',
    updated_at = NOW()
  WHERE email = 'hr.emiliobeaufort@gmail.com';
  
  -- If the user doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO admin_user (
      email, 
      password_hash, 
      role, 
      permissions, 
      department, 
      first_name, 
      last_name, 
      is_active
    ) VALUES (
      'hr.emiliobeaufort@gmail.com',
      crypt('hr.emilio@2025', gen_salt('bf')),
      'hr',
      '{"view_analytics": true, "manage_careers": true}'::jsonb,
      'Human Resources',
      'HR',
      'Manager',
      true
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function to update HR user
SELECT update_hr_user_permissions();

-- Grant execute permissions for the new function
GRANT EXECUTE ON FUNCTION update_hr_user_permissions() TO anon, authenticated;

-- Create a function to list all roles and their permissions for debugging
CREATE OR REPLACE FUNCTION get_role_permissions()
RETURNS TABLE(
  role_name TEXT,
  permissions TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'super_admin'::TEXT,
    ARRAY['all_permissions']::TEXT[]
  UNION ALL
  SELECT 
    'admin'::TEXT,
    ARRAY['manage_users', 'manage_products', 'manage_blog', 'manage_careers', 'view_analytics', 'manage_partnerships']::TEXT[]
  UNION ALL
  SELECT 
    'moderator'::TEXT,
    ARRAY['manage_products', 'manage_blog', 'view_analytics']::TEXT[]
  UNION ALL
  SELECT 
    'hr'::TEXT,
    ARRAY['view_analytics', 'manage_careers']::TEXT[]
  UNION ALL
  SELECT 
    'viewer'::TEXT,
    ARRAY['view_analytics']::TEXT[];
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_role_permissions() TO anon, authenticated; 