# Fix Services Name Constraint Issue

## Problem
Car washes are getting an error when trying to add more than 2 services:
```
new row for relation "services" violates check constraint "services_name_check"
```

This is because the database has a CHECK constraint that only allows 5 predefined service names.

## Solution

### Step 1: Run the Migration SQL

1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Remove the restrictive name constraint
ALTER TABLE services 
DROP CONSTRAINT IF EXISTS services_name_check;

-- Add a simple constraint to ensure name is not empty
ALTER TABLE services 
DROP CONSTRAINT IF EXISTS services_name_not_empty;

ALTER TABLE services 
ADD CONSTRAINT services_name_not_empty CHECK (LENGTH(TRIM(name)) > 0);
```

4. Click **Run** to execute the migration

### Step 2: Verify the Fix

After running the migration:
- Car washes can now add **any service name** (not just the 5 predefined ones)
- Each car wash can add up to **20 services** (enforced by backend validation)
- The constraint now only ensures the service name is not empty

### What Changed

1. **Database**: Removed the restrictive CHECK constraint that limited service names to only 5 predefined values
2. **Backend**: Added validation to limit each car wash to 20 services
3. **Frontend**: Added UI indicators showing service count and limit warnings

### Testing

Try adding a new service with a custom name - it should work now!
