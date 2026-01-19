-- ============================================
-- SIMPLE FIX - Copy and Run This
-- ============================================

-- Drop ALL check constraints
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN SELECT conname FROM pg_constraint
    WHERE conrelid = 'services'::regclass AND contype = 'c'
    LOOP
        EXECUTE format('ALTER TABLE services DROP CONSTRAINT %I CASCADE', r.conname);
    END LOOP;
END $$;

-- Add simple constraint
ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty 
CHECK (name IS NOT NULL AND TRIM(name) != '' AND LENGTH(name) <= 100);
