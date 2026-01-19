-- SIMPLE FIX: Remove Services Name Constraint
-- Copy and paste this ENTIRE block into Supabase SQL Editor and run it

-- Drop the problematic constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check;

-- Verify it's gone (optional - you can run this separately to check)
-- SELECT conname, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'services'::regclass 
-- AND conname LIKE '%name%';

-- Add a simple constraint that only checks name is not empty
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_not_empty;
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 100);

-- Done! Now car washes can add any service name.
