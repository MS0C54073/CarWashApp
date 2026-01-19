-- ============================================
-- FORCE REMOVE ALL SERVICES NAME CONSTRAINTS
-- ============================================
-- This script will aggressively find and remove ALL constraints
-- that restrict service names. Run this in Supabase SQL Editor.

-- Step 1: Show all current constraints (for debugging)
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
ORDER BY conname;

-- Step 2: Drop ALL check constraints that mention 'name' and the restricted values
DO $$
DECLARE
    r RECORD;
    dropped_count INTEGER := 0;
BEGIN
    FOR r IN 
        SELECT conname, pg_get_constraintdef(oid) as def
        FROM pg_constraint
        WHERE conrelid = 'services'::regclass
        AND contype = 'c'
        AND (
            -- Check if constraint mentions name and restricted values
            (pg_get_constraintdef(oid) LIKE '%name%' AND (
                pg_get_constraintdef(oid) LIKE '%Full Basic Wash%' OR
                pg_get_constraintdef(oid) LIKE '%Engine Wash%' OR
                pg_get_constraintdef(oid) LIKE '%Exterior Wash%' OR
                pg_get_constraintdef(oid) LIKE '%Interior Wash%' OR
                pg_get_constraintdef(oid) LIKE '%Wax and Polishing%' OR
                pg_get_constraintdef(oid) LIKE '%name IN%'
            ))
            OR
            -- Or if constraint name suggests it's a name check
            conname LIKE '%name%check%'
        )
    LOOP
        BEGIN
            EXECUTE 'ALTER TABLE services DROP CONSTRAINT ' || quote_ident(r.conname);
            RAISE NOTICE '✅ Dropped constraint: %', r.conname;
            dropped_count := dropped_count + 1;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠️  Could not drop %: %', r.conname, SQLERRM;
        END;
    END LOOP;
    
    IF dropped_count = 0 THEN
        RAISE NOTICE 'ℹ️  No restrictive constraints found to drop.';
    ELSE
        RAISE NOTICE '✅ Successfully dropped % constraint(s)', dropped_count;
    END IF;
END $$;

-- Step 3: Try direct drops (in case the above didn't catch it)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check1;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check2;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check3;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check4;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check5;

-- Step 4: Remove any existing non-restrictive constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_not_empty;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_length_check;

-- Step 5: Add ONLY a simple constraint that checks name is not empty
-- This allows ANY service name, just ensures it's not blank
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (name IS NOT NULL AND LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 100);

-- Step 6: Verify the fix - show all remaining constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
AND contype = 'c'
ORDER BY conname;

-- You should now only see: services_name_not_empty
-- And it should allow ANY service name (not just the 5 predefined ones)
