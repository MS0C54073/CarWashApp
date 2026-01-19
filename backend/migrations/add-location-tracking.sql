-- Add location tracking table for real-time driver and booking locations
-- Run this in Supabase SQL Editor

-- Location tracking table for drivers
CREATE TABLE IF NOT EXISTS location_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  coordinates JSONB NOT NULL, -- {lat: number, lng: number}
  accuracy DECIMAL(10, 2), -- GPS accuracy in meters
  heading DECIMAL(5, 2), -- Direction in degrees (0-360)
  speed DECIMAL(5, 2), -- Speed in km/h
  status VARCHAR(50) NOT NULL, -- 'idle', 'en_route', 'at_pickup', 'at_wash', 'at_dropoff'
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_location_tracking_user_id ON location_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_booking_id ON location_tracking(booking_id);
CREATE INDEX IF NOT EXISTS idx_location_tracking_timestamp ON location_tracking(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_location_tracking_status ON location_tracking(status);

-- Index for spatial queries (using GIN for JSONB)
CREATE INDEX IF NOT EXISTS idx_location_tracking_coordinates ON location_tracking USING GIN (coordinates);

-- Add last_location_update timestamp to users table for driver location freshness
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS last_location_update TIMESTAMP WITH TIME ZONE;

-- Add current_booking_id to users table for drivers (tracks active booking)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_last_location_update ON users(last_location_update) WHERE role = 'driver';
CREATE INDEX IF NOT EXISTS idx_users_current_booking ON users(current_booking_id) WHERE role = 'driver';

-- Add car wash location coordinates if not exists (for car wash locations)
-- This is already in the schema, but ensure it's indexed
CREATE INDEX IF NOT EXISTS idx_users_location_coordinates ON users USING GIN (location_coordinates) WHERE location_coordinates IS NOT NULL;
