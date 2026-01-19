-- Add booking_type column to bookings table
-- This migration adds support for pickup_delivery and drive_in booking types

ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'pickup_delivery' 
CHECK (booking_type IN ('pickup_delivery', 'drive_in'));

-- Add queue_position and estimated_wait_time to bookings
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS queue_position INTEGER,
ADD COLUMN IF NOT EXISTS estimated_wait_time INTEGER; -- in minutes

-- Update existing bookings to have default booking_type
UPDATE bookings 
SET booking_type = 'pickup_delivery' 
WHERE booking_type IS NULL;

-- Create index for booking_type for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);
