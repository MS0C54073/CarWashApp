-- Migration: Add car wash picture URL to users table
-- Run this in Supabase SQL Editor

-- Add car_wash_picture_url column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS car_wash_picture_url TEXT;

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'car_wash_picture_url';
