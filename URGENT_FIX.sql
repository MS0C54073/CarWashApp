-- ============================================
-- URGENT: Remove Services Name Constraint
-- ============================================
-- Copy ALL of this and paste into Supabase SQL Editor, then RUN

-- First, let's see what constraints exist
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
AND contype = 'c';

-- Now remove ALL name-related check constraints
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'services'::regclass
        AND contype = 'c'
        AND (
            pg_get_constraintdef(oid) LIKE '%name%' OR
            conname LIKE '%name%'
        )
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE services DROP CONSTRAINT %I', constraint_rec.conname);
            RAISE NOTICE 'Dropped: %', constraint_rec.conname;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error dropping %: %', constraint_rec.conname, SQLERRM;
        END;
    END LOOP;
END $$;

-- Force drop the specific constraint name
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check CASCADE;

-- Add a simple constraint that only checks name is not empty
ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_not_empty;
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (name IS NOT NULL AND TRIM(name) != '' AND LENGTH(name) <= 100);

-- Verify it worked
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'services'::regclass
AND contype = 'c';

-- If you see "services_name_not_empty" and NO "services_name_check", you're good!
