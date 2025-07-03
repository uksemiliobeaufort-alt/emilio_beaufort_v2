-- Create admin_user table
CREATE TABLE IF NOT EXISTS admin_user (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE admin_user ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all records
CREATE POLICY "Allow authenticated read" ON admin_user
  FOR SELECT TO authenticated
  USING (true);

-- Insert default admin user (you should change this password immediately)
INSERT INTO admin_user (email, password)
VALUES ('admin@emiliobeaufort.com', 'admin123')
ON CONFLICT (email) DO NOTHING; 