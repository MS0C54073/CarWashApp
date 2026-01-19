-- ============================================
-- COPY THIS ENTIRE FILE AND RUN IN SUPABASE
-- ============================================

-- Remove ALL check constraints on services table (nuclear option)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'services'::regclass
        AND contype = 'c'
    LOOP
        EXECUTE format('ALTER TABLE services DROP CONSTRAINT %I CASCADE', r.conname);
        RAISE NOTICE '✅ Dropped: %', r.conname;
    END LOOP;
END $$;

-- Add simple constraint that allows ANY service name
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (name IS NOT NULL AND TRIM(name) != '' AND LENGTH(name) <= 100);

-- Verify - should only see services_name_not_empty
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'services'::regclass 
AND contype = 'c';
