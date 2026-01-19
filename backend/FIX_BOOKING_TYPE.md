# Fix: Missing booking_type Column

## Error
```
Could not find the 'booking_type' column of 'bookings' in the schema cache
```

## Solution

The `booking_type` column is missing from your `bookings` table. Here's how to fix it:

### Option 1: Using Supabase Studio (Recommended)

1. **Start Supabase** (if not already running):
   ```powershell
   supabase start
   ```

2. **Open Supabase Studio**:
   - Go to: http://localhost:54326
   - Or run: `supabase studio`

3. **Open SQL Editor**:
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

4. **Run the migration**:
   - Copy the contents of `backend/migrations/add-booking-type-now.sql`
   - Paste into the SQL Editor
   - Click "Run" or press `Ctrl+Enter`

### Option 2: Using Supabase CLI

```powershell
# Make sure Supabase is running
supabase start

# Run the migration
supabase db execute -f backend/migrations/add-booking-type-now.sql
```

### Option 3: Direct SQL Execution

If you have direct database access:

```sql
-- Add booking_type column
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS booking_type VARCHAR(20) DEFAULT 'pickup_delivery' 
CHECK (booking_type IN ('pickup_delivery', 'drive_in'));

-- Update existing bookings
UPDATE bookings 
SET booking_type = 'pickup_delivery' 
WHERE booking_type IS NULL;

-- Create index
CREATE INDEX IF NOT EXISTS idx_bookings_booking_type ON bookings(booking_type);
```

### Verify the Fix

After running the migration, verify the column exists:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name = 'booking_type';
```

You should see:
```
column_name   | data_type | column_default
--------------|-----------|------------------
booking_type  | character varying(20) | 'pickup_delivery'::character varying
```

### Restart Backend

After adding the column, restart your backend server:

```powershell
cd backend
npm run dev
```

The error should now be resolved!

## Why This Happened

The `booking_type` column was added to the schema later, but the migration wasn't run on your local database. This migration adds the column safely using `IF NOT EXISTS` checks.
