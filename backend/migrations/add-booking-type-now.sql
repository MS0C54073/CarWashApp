-- Add booking_type column to bookings table
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Add booking_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' 
        AND column_name = 'booking_type'
    ) THEN
        ALTER TABLE bookings 
        ADD COLUMN booking_type VARCHAR(20) DEFAULT 'pickup_delivery' 
        CHECK (booking_type IN ('pickup_delivery', 'drive_in'));
        
        -- Update existing bookings to have default booking_type
        UPDATE bookings 
        SET booking_type = 'pickup_delivery' 
        WHERE booking_type IS NULL;
        
        -- Create index for better query performance
        CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);
        
        RAISE NOTICE 'booking_type column added successfully';
    ELSE
        RAISE NOTICE 'booking_type column already exists';
    END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'booking_type';
