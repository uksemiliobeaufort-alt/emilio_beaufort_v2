-- Migration to set up secure passwords for admin users
-- This runs after the main security migration

-- Create new secure admin users with strong passwords
SELECT create_admin_user_with_password('admin@emiliobeaufort.com', 'SecureAdmin2025!');
SELECT create_admin_user_with_password('hr@emiliobeaufort.com', 'SecureHR2025!');
SELECT create_admin_user_with_password('founder@emiliobeaufort.com', 'SecureFounder2025!');

-- Update existing users with secure passwords
SELECT change_admin_password('ketanthombare14@gmail.com', 'SecureKetan2025!');
SELECT change_admin_password('admin@gmail.com', 'SecureAdmin2025!');
SELECT change_admin_password('founder.office@gmail.com', 'SecureFounder2025!');
SELECT change_admin_password('hr.emiliobeaufort@gmail.com', 'SecureHR2025!'); 