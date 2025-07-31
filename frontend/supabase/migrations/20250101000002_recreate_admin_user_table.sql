-- Migration to completely recreate admin_user table with role-based access
-- This is a comprehensive security and functionality upgrade

-- First, ensure pgcrypto extension is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing admin_user table and all related functions
DROP TABLE IF EXISTS admin_user CASCADE;

-- Create new admin_user table with role-based access
CREATE TABLE admin_user (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'moderator', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  department TEXT,
  permissions JSONB DEFAULT '{}',
  last_login TIMESTAMPTZ,
  login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_user ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX idx_admin_user_email ON admin_user(email);
CREATE INDEX idx_admin_user_role ON admin_user(role);
CREATE INDEX idx_admin_user_active ON admin_user(is_active);
CREATE INDEX idx_admin_user_department ON admin_user(department);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create the trigger
CREATE TRIGGER update_admin_user_updated_at 
    BEFORE UPDATE ON admin_user 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create admin user with hashed password
CREATE OR REPLACE FUNCTION create_admin_user_with_password(
  user_email TEXT,
  user_password TEXT,
  user_role TEXT DEFAULT 'admin',
  user_first_name TEXT DEFAULT NULL,
  user_last_name TEXT DEFAULT NULL,
  user_department TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO admin_user (email, password_hash, role, first_name, last_name, department, is_active)
  VALUES (
    LOWER(TRIM(user_email)),
    crypt(user_password, gen_salt('bf')),
    user_role,
    user_first_name,
    user_last_name,
    user_department,
    true
  )
  ON CONFLICT (email) 
  DO UPDATE SET 
    password_hash = crypt(user_password, gen_salt('bf')),
    role = user_role,
    first_name = user_first_name,
    last_name = user_last_name,
    department = user_department,
    is_active = true,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password(
  user_email TEXT,
  user_password TEXT
)
RETURNS boolean AS $$
DECLARE
  stored_hash TEXT;
  user_active BOOLEAN;
  user_locked_until TIMESTAMPTZ;
BEGIN
  -- Get password hash, active status, and lock status
  SELECT password_hash, is_active, locked_until INTO stored_hash, user_active, user_locked_until
  FROM admin_user
  WHERE email = LOWER(TRIM(user_email));
  
  -- Check if user exists and is active
  IF stored_hash IS NULL OR user_active IS NOT TRUE THEN
    RETURN false;
  END IF;
  
  -- Check if account is locked
  IF user_locked_until IS NOT NULL AND user_locked_until > NOW() THEN
    RETURN false;
  END IF;
  
  -- Verify password against hash
  RETURN (stored_hash = crypt(user_password, stored_hash));
END;
$$ LANGUAGE plpgsql;

-- Function to change admin password
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

-- Function to update last login
CREATE OR REPLACE FUNCTION update_admin_last_login(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE admin_user 
  SET 
    last_login = NOW(),
    login_attempts = 0,
    locked_until = NULL,
    updated_at = NOW()
  WHERE email = LOWER(TRIM(user_email));
END;
$$ LANGUAGE plpgsql;

-- Function to handle failed login attempts
CREATE OR REPLACE FUNCTION handle_failed_login(user_email TEXT)
RETURNS void AS $$
DECLARE
  current_attempts INTEGER;
  lock_duration INTERVAL;
BEGIN
  -- Get current login attempts
  SELECT login_attempts INTO current_attempts
  FROM admin_user
  WHERE email = LOWER(TRIM(user_email));
  
  -- Increment login attempts
  current_attempts := current_attempts + 1;
  
  -- Determine lock duration based on attempts
  IF current_attempts >= 10 THEN
    lock_duration := INTERVAL '24 hours';
  ELSIF current_attempts >= 5 THEN
    lock_duration := INTERVAL '1 hour';
  ELSIF current_attempts >= 3 THEN
    lock_duration := INTERVAL '15 minutes';
  ELSE
    lock_duration := NULL;
  END IF;
  
  -- Update user with new attempt count and lock if needed
  UPDATE admin_user 
  SET 
    login_attempts = current_attempts,
    locked_until = CASE WHEN lock_duration IS NOT NULL THEN NOW() + lock_duration ELSE NULL END,
    updated_at = NOW()
  WHERE email = LOWER(TRIM(user_email));
END;
$$ LANGUAGE plpgsql;

-- Function to check user permissions
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
      RETURN required_permission IN ('manage_users', 'manage_products', 'manage_blog', 'manage_careers', 'view_analytics');
    WHEN 'moderator' THEN
      RETURN required_permission IN ('manage_products', 'manage_blog', 'view_analytics');
    WHEN 'viewer' THEN
      RETURN required_permission IN ('view_analytics');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to list admin users (for debugging)
CREATE OR REPLACE FUNCTION list_admin_users()
RETURNS TABLE(
  id UUID,
  email TEXT, 
  role TEXT,
  is_active BOOLEAN, 
  first_name TEXT,
  last_name TEXT,
  department TEXT,
  created_at TIMESTAMPTZ, 
  last_login TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    admin_user.id,
    admin_user.email,
    admin_user.role,
    admin_user.is_active,
    admin_user.first_name,
    admin_user.last_name,
    admin_user.department,
    admin_user.created_at,
    admin_user.last_login
  FROM admin_user
  ORDER BY admin_user.created_at;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION create_admin_user_with_password(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION change_admin_password(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION update_admin_last_login(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION handle_failed_login(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION check_admin_permission(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION list_admin_users() TO anon, authenticated;

-- Create default admin users with roles
SELECT create_admin_user_with_password(
  'admin@emiliobeaufort.com', 
  'SecureAdmin2025!', 
  'super_admin',
  'System',
  'Administrator',
  'IT'
);

SELECT create_admin_user_with_password(
  'hr@emiliobeaufort.com', 
  'SecureHR2025!', 
  'admin',
  'HR',
  'Manager',
  'Human Resources'
);

SELECT create_admin_user_with_password(
  'founder@emiliobeaufort.com', 
  'SecureFounder2025!', 
  'super_admin',
  'Founder',
  'Office',
  'Executive'
);

SELECT create_admin_user_with_password(
  'ketanthombare14@gmail.com', 
  'SecureKetan2025!', 
  'admin',
  'Ketan',
  'Thombare',
  'Development'
);

SELECT create_admin_user_with_password(
  'admin@gmail.com', 
  'SecureAdmin2025!', 
  'admin',
  'Admin',
  'User',
  'General'
);

SELECT create_admin_user_with_password(
  'founder.office@gmail.com', 
  'SecureFounder2025!', 
  'admin',
  'Founder',
  'Office',
  'Executive'
);

SELECT create_admin_user_with_password(
  'hr.emiliobeaufort@gmail.com', 
  'SecureHR2025!', 
  'admin',
  'HR',
  'Emilio',
  'Human Resources'
); 