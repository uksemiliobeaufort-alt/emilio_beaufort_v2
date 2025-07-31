-- Migration to fix admin authentication for plain text passwords
-- This migration adapts the auth system to work with current plain text passwords

-- First, check if password_hash column exists and rename password to password_hash if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'password'
  ) THEN
    -- Rename password column to password_hash to match the expected structure
    ALTER TABLE admin_user RENAME COLUMN password TO password_hash;
  END IF;
END $$;

-- Check if is_active column exists and add it if it doesn't
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_user' AND column_name = 'is_active'
  ) THEN
    -- Add is_active column if it doesn't exist
    ALTER TABLE admin_user ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- Check if role column exists and add it if it doesn't
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

-- Create a new function to verify admin password with plain text comparison
CREATE OR REPLACE FUNCTION verify_admin_password_plain_text(
  user_email TEXT,
  user_password TEXT
)
RETURNS boolean AS $$
DECLARE
  stored_password TEXT;
  user_active BOOLEAN;
BEGIN
  -- Get password and active status
  SELECT password_hash, is_active INTO stored_password, user_active
  FROM admin_user
  WHERE email = LOWER(TRIM(user_email));
  
  -- Check if user exists and is active
  IF stored_password IS NULL OR user_active IS NOT TRUE THEN
    RETURN false;
  END IF;
  
  -- Compare plain text passwords
  RETURN stored_password = user_password;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update HR user with specific permissions
CREATE OR REPLACE FUNCTION update_hr_user_permissions_plain_text()
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
      'hr.emilio@2025',
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
SELECT update_hr_user_permissions_plain_text();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_admin_password_plain_text(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_hr_user_permissions_plain_text() TO anon, authenticated; 