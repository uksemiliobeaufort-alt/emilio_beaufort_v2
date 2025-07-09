-- Add password column to admin_user table
ALTER TABLE admin_user 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_admin_user_updated_at 
    BEFORE UPDATE ON admin_user 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to hash passwords (using pgcrypto extension)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Function to create admin user with hashed password
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

-- Function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password(
  user_email TEXT,
  user_password TEXT
)
RETURNS boolean AS $$
DECLARE
  stored_hash TEXT;
BEGIN
  SELECT password_hash INTO stored_hash
  FROM admin_user
  WHERE email = LOWER(TRIM(user_email)) AND is_active = true;
  
  IF stored_hash IS NULL THEN
    RETURN false;
  END IF;
  
  RETURN (stored_hash = crypt(user_password, stored_hash));
END;
$$ LANGUAGE plpgsql;

-- Create default admin users
SELECT create_admin_user_with_password('admin@emiliobeaufort.com', 'admin123');
SELECT create_admin_user_with_password('admin@example.com', 'password123');

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own record" ON admin_user;

CREATE POLICY "Authenticated users can view admin records" ON admin_user
  FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can update own record" ON admin_user
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = admin_user.email
  ));

-- Grant necessary permissions
GRANT SELECT, UPDATE ON admin_user TO authenticated;
GRANT EXECUTE ON FUNCTION verify_admin_password(TEXT, TEXT) TO anon, authenticated; 