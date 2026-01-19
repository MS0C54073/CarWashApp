-- Migration: Remove services_name_check constraint to allow any service name
-- This allows car washes to add custom services beyond the predefined 5
-- Run this in your Supabase SQL Editor

-- Drop the existing constraint if it exists
ALTER TABLE services 
DROP CONSTRAINT IF EXISTS services_name_check;

-- Add a constraint to ensure name is not empty (if not already enforced by NOT NULL)
ALTER TABLE services 
DROP CONSTRAINT IF EXISTS services_name_not_empty;

ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);

-- Note: The NOT NULL constraint on the name column is still in place
-- This migration only removes the restriction to the 5 predefined service names
-- Car washes can now add any service name up to 20 services per car wash
