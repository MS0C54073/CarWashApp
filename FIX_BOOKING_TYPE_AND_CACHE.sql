-- ============================================
-- FIX BOOKING_TYPE COLUMN AND REFRESH CACHE
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Add booking_type column if it doesn't exist
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'pickup_delivery' 
CHECK (booking_type IN ('pickup_delivery', 'drive_in'));

-- Step 2: Add other missing columns
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS queue_position INTEGER,
ADD COLUMN IF NOT EXISTS estimated_wait_time INTEGER;

-- Step 3: Update existing bookings to have default booking_type
UPDATE bookings 
SET booking_type = 'pickup_delivery' 
WHERE booking_type IS NULL;

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);

-- Step 5: Refresh the schema cache by querying the table structure
-- This forces Supabase to update its internal schema cache
DO $$
BEGIN
    PERFORM * FROM bookings LIMIT 1;
    RAISE NOTICE 'Schema cache refreshed';
END $$;

-- Step 6: Verify the column exists
SELECT 
    column_name, 
    data_type, 
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'booking_type';

-- Step 7: Show all bookings columns for verification
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;
