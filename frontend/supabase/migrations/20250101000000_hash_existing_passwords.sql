-- Migration to hash existing plain text passwords
-- This is a critical security update

-- First, ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add password_hash column if it doesn't exist
ALTER TABLE admin_user 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Hash existing plain text passwords (only if password column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_user' AND column_name = 'password') THEN
    UPDATE admin_user 
    SET password_hash = crypt(password, gen_salt('bf'))
    WHERE password_hash IS NULL AND password IS NOT NULL;
  END IF;
END $$;

-- Remove the plain text password column for security (only if it exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'admin_user' AND column_name = 'password') THEN
    ALTER TABLE admin_user DROP COLUMN password;
  END IF;
END $$;

-- Add last_login column if it doesn't exist
ALTER TABLE admin_user 
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_admin_user_updated_at ON admin_user;

-- Create the trigger
CREATE TRIGGER update_admin_user_updated_at 
    BEFORE UPDATE ON admin_user 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Update the verify function to work with hashed passwords
DROP FUNCTION IF EXISTS verify_admin_password(TEXT, TEXT);

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
  
  -- Verify password against hash
  RETURN (stored_hash = crypt(user_password, stored_hash));
END;
$$ LANGUAGE plpgsql;

-- Function to create admin user with hashed password
DROP FUNCTION IF EXISTS create_admin_user_with_password(TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_admin_user_with_password(
  user_email TEXT,
  user_password TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_user (email, password_hash, is_active)
  VALUES (
    LOWER(TRIM(user_email)),
    crypt(user_password, gen_salt('bf')),
    true
  )
  ON CONFLICT (email) 
  DO UPDATE SET 
    password_hash = crypt(user_password, gen_salt('bf')),
    is_active = true,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to change admin password
DROP FUNCTION IF EXISTS change_admin_password(TEXT, TEXT);

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
  
  -- Update password hash
  UPDATE admin_user 
  SET 
    password_hash = crypt(new_password, gen_salt('bf')),
    updated_at = NOW()
  WHERE email = LOWER(TRIM(user_email));
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to list admin users (for debugging) - Skipped for now to avoid conflicts
-- This function can be created separately if needed

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user_with_password(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION change_admin_password(TEXT, TEXT) TO anon, authenticated; 