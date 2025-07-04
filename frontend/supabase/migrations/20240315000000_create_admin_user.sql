-- Create admin_user table
CREATE TABLE IF NOT EXISTS admin_user (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_user ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own record
CREATE POLICY "Users can view own record" ON admin_user
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = admin_user.email
  ));

-- Function to create admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void AS $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Check if admin user exists in auth.users
  SELECT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@emiliobeaufort.com'
  ) INTO admin_exists;

  -- If admin doesn't exist, create them
  IF NOT admin_exists THEN
    -- Insert into auth.users (this is handled by Supabase's auth.sign_up)
    -- You'll need to sign up the admin user through the Supabase dashboard or API
    
    -- Insert into admin_user table
    INSERT INTO admin_user (email)
    VALUES ('admin@emiliobeaufort.com')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_admin_user(); 