-- Create Admin User for SuCAR
-- Run this in Supabase SQL Editor (http://127.0.0.1:54326)

-- First, check if user exists and delete if needed
DELETE FROM users WHERE email = 'admin@sucar.com';

-- Insert admin user
-- Password: password123 (hashed with bcrypt)
INSERT INTO users (
  name,
  email,
  password,
  phone,
  nrc,
  role,
  is_active
) VALUES (
  'Admin User',
  'admin@sucar.com',
  '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
  '1234567890',
  'ADMIN001',
  'admin',
  true
);

-- Verify the user was created
SELECT id, name, email, role, is_active FROM users WHERE email = 'admin@sucar.com';
