-- Migration: Add car wash picture URL to users table
-- Description: Adds a separate picture field for car wash businesses

-- Add car_wash_picture_url column if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='users' 
        AND column_name='car_wash_picture_url'
    ) THEN
        ALTER TABLE users ADD COLUMN car_wash_picture_url TEXT;
        RAISE NOTICE 'car_wash_picture_url column added successfully';
    ELSE
        RAISE NOTICE 'car_wash_picture_url column already exists';
    END IF;
END $$;

-- Add comment
COMMENT ON COLUMN users.car_wash_picture_url IS 'Business picture URL for car wash operators (separate from profile picture)';

-- Verify the column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'car_wash_picture_url';
