-- ============================================
-- URGENT FIX: Remove Services Name Constraint
-- ============================================
-- Copy this ENTIRE file and paste into Supabase SQL Editor
-- Then click RUN

-- Step 1: Find and drop the problematic constraint
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find the constraint that restricts service names
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'services'::regclass
    AND contype = 'c'
    AND (
        pg_get_constraintdef(oid) LIKE '%Full Basic Wash%' OR
        pg_get_constraintdef(oid) LIKE '%Engine Wash%' OR
        pg_get_constraintdef(oid) LIKE '%name IN%' OR
        conname LIKE '%name_check%'
    )
    LIMIT 1;

    -- Drop it if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE services DROP CONSTRAINT ' || quote_ident(constraint_name);
        RAISE NOTICE 'Dropped constraint: %', constraint_name;
    ELSE
        RAISE NOTICE 'No restrictive constraint found. Trying direct drop...';
        -- Try direct drop as fallback
        BEGIN
            ALTER TABLE services DROP CONSTRAINT services_name_check;
            RAISE NOTICE 'Dropped services_name_check constraint';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Constraint services_name_check does not exist or already dropped';
        END;
    END IF;
END $$;

-- Step 2: Drop any other name-related constraints
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check1;
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check2;

-- Step 3: Add a simple, non-restrictive constraint
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_not_empty;
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 100);

-- Step 4: Verify - Show remaining constraints
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
AND contype = 'c'
ORDER BY conname;

-- Done! The constraint should now be fixed.
