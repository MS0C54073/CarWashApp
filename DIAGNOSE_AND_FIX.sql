-- ============================================
-- STEP 1: DIAGNOSE - See ALL constraints first
-- ============================================
-- Run this FIRST to see what constraints exist

SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
ORDER BY conname;

-- ============================================
-- STEP 2: FORCE REMOVE - Run this to fix
-- ============================================
-- After seeing the constraints above, run this block

-- Remove ALL check constraints on the services table
DO $$
DECLARE
    constraint_rec RECORD;
    dropped_count INTEGER := 0;
BEGIN
    -- Loop through ALL check constraints on services table
    FOR constraint_rec IN 
        SELECT conname, pg_get_constraintdef(oid) as def
        FROM pg_constraint
        WHERE conrelid = 'services'::regclass
        AND contype = 'c'  -- Only check constraints
    LOOP
        -- Check if this constraint restricts service names
        IF constraint_rec.def LIKE '%name%' AND (
            constraint_rec.def LIKE '%Full Basic Wash%' OR
            constraint_rec.def LIKE '%Engine Wash%' OR
            constraint_rec.def LIKE '%Exterior Wash%' OR
            constraint_rec.def LIKE '%Interior Wash%' OR
            constraint_rec.def LIKE '%Wax and Polishing%' OR
            constraint_rec.def LIKE '%name IN%' OR
            constraint_rec.conname LIKE '%name_check%'
        ) THEN
            BEGIN
                EXECUTE format('ALTER TABLE services DROP CONSTRAINT %I CASCADE', constraint_rec.conname);
                RAISE NOTICE '✅ Dropped restrictive constraint: %', constraint_rec.conname;
                dropped_count := dropped_count + 1;
            EXCEPTION WHEN OTHERS THEN
                RAISE NOTICE '⚠️  Could not drop %: %', constraint_rec.conname, SQLERRM;
            END;
        END IF;
    END LOOP;
    
    IF dropped_count = 0 THEN
        RAISE NOTICE 'ℹ️  No restrictive constraints found. Trying direct drop...';
        -- Try direct drops as fallback
        BEGIN
            ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check CASCADE;
            RAISE NOTICE '✅ Tried dropping services_name_check';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'ℹ️  services_name_check does not exist';
        END;
    ELSE
        RAISE NOTICE '✅ Successfully dropped % restrictive constraint(s)', dropped_count;
    END IF;
END $$;

-- Also try these direct drops (in case the loop missed something)
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check CASCADE;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check1 CASCADE;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check2 CASCADE;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check3 CASCADE;

-- Remove any existing non-restrictive constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_not_empty;

-- ============================================
-- STEP 3: ADD NEW CONSTRAINT
-- ============================================
-- Add a simple constraint that allows ANY service name

ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (name IS NOT NULL AND TRIM(name) != '' AND LENGTH(name) <= 100);

-- ============================================
-- STEP 4: VERIFY
-- ============================================
-- Check what constraints remain (should only see services_name_not_empty)

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
AND contype = 'c'
ORDER BY conname;

-- If you see ONLY "services_name_not_empty" and NO "services_name_check", you're done!
-- If you still see "services_name_check", the constraint might be in a different schema or have a different name
