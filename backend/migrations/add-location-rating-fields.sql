-- Add location coordinates and driver rating fields to users table
-- Run this in Supabase SQL Editor

-- Add location coordinates (JSONB) for car washes and drivers
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS location_coordinates JSONB;

-- Add driver rating and completed jobs
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS driver_rating DECIMAL(3, 2) DEFAULT 0.0 CHECK (driver_rating >= 0 AND driver_rating <= 5.0);

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS completed_jobs INTEGER DEFAULT 0 CHECK (completed_jobs >= 0);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_users_location_coordinates ON users USING GIN (location_coordinates);

-- Create index for driver ratings
CREATE INDEX IF NOT EXISTS idx_users_driver_rating ON users(driver_rating) WHERE role = 'driver';
