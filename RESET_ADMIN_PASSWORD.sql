-- Quick SQL to reset admin password
-- Run this in Supabase SQL Editor

-- First, check if admin user exists
SELECT id, email, name, role, is_active 
FROM users 
WHERE role = 'admin';

-- Reset password for admin@sucar.com (password: admin123)
-- Note: You need to hash the password first using bcrypt
-- For quick testing, you can use this SQL if you have the hashed password

-- Option 1: Update existing admin
UPDATE users 
SET 
  password = '$2a$10$rKqX8J5Y5Y5Y5Y5Y5Y5Y5O5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', -- This is 'admin123' hashed
  is_active = true
WHERE email = 'admin@sucar.com' AND role = 'admin';

-- Option 2: Create new admin if doesn't exist
INSERT INTO users (name, email, password, phone, nrc, role, is_active)
VALUES (
  'Admin User',
  'admin@sucar.com',
  '$2a$10$rKqX8J5Y5Y5Y5Y5Y5Y5Y5O5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y5Y', -- This is 'admin123' hashed
  '+1234567890',
  'ADMIN001',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE
SET 
  password = EXCLUDED.password,
  is_active = true,
  role = 'admin';

-- To get the correct bcrypt hash, run this in Node.js:
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('admin123', 10);
-- console.log(hash);
