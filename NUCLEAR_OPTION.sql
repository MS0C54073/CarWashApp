-- ============================================
-- NUCLEAR OPTION: Remove ALL check constraints
-- ============================================
-- Use this if the other scripts don't work
-- This removes ALL check constraints, then adds back only the simple one

-- Step 1: Drop ALL check constraints on services table
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'services'::regclass
        AND contype = 'c'  -- All check constraints
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE services DROP CONSTRAINT %I CASCADE', constraint_rec.conname);
            RAISE NOTICE 'Dropped: %', constraint_rec.conname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error dropping %: %', constraint_rec.conname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Step 2: Add back only the simple constraint
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (name IS NOT NULL AND TRIM(name) != '' AND LENGTH(name) <= 100);

-- Step 3: Verify
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
AND contype = 'c';

-- Done! Now any service name is allowed (as long as it's not empty and <= 100 chars)
