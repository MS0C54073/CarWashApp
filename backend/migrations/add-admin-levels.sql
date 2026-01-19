-- Migration: Add admin role levels and user suspension fields
-- Run this in Supabase SQL Editor

-- Add admin_level column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS admin_level VARCHAR(20) DEFAULT NULL 
CHECK (admin_level IN ('super_admin', 'admin', 'support') OR admin_level IS NULL);

-- Add suspension fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN DEFAULT false;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS suspension_reason TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES users(id);

-- Set existing admins to 'admin' level (can be upgraded to super_admin manually)
UPDATE users 
SET admin_level = 'admin' 
WHERE role = 'admin' AND admin_level IS NULL;

-- Create index for admin_level
CREATE INDEX IF NOT EXISTS idx_users_admin_level ON users(admin_level);

-- Create index for suspension status
CREATE INDEX IF NOT EXISTS idx_users_suspension ON users(is_suspended);
