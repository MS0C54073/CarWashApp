-- Comprehensive Fix for Services Name Constraint
-- This script will remove ALL possible name-related constraints on the services table
-- Run this in your Supabase SQL Editor

-- Step 1: Check what constraints exist (for reference)
-- Uncomment the line below to see all constraints on services table
-- SELECT conname, contype, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'services'::regclass;

-- Step 2: Drop ALL possible name-related constraints
-- Try to drop the constraint with the exact name first
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check;

-- Also try alternative constraint names that might exist
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check1;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check2;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check3;

-- Drop any constraint that checks name against the enum values
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname, conrelid::regclass
        FROM pg_constraint
        WHERE conrelid = 'services'::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%name%'
        AND (
            pg_get_constraintdef(oid) LIKE '%Full Basic Wash%' OR
            pg_get_constraintdef(oid) LIKE '%Engine Wash%' OR
            pg_get_constraintdef(oid) LIKE '%Exterior Wash%' OR
            pg_get_constraintdef(oid) LIKE '%Interior Wash%' OR
            pg_get_constraintdef(oid) LIKE '%Wax and Polishing%'
        )
    LOOP
        EXECUTE 'ALTER TABLE services DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
        RAISE NOTICE 'Dropped constraint: %', r.conname;
    END LOOP;
END $$;

-- Step 3: Ensure we have a proper constraint (name must not be empty)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_not_empty;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_length_check;

-- Add a simple, non-restrictive constraint
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 100);

-- Step 4: Verify the fix
-- Uncomment to verify constraints after fix
-- SELECT conname, contype, pg_get_constraintdef(oid) 
-- FROM pg_constraint 
-- WHERE conrelid = 'services'::regclass;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Services name constraint fix completed successfully!';
    RAISE NOTICE 'Car washes can now add any service name (up to 100 characters).';
END $$;
