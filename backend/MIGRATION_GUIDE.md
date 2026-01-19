# Supabase Migration Guide

## 🚀 Automatic Table Creation

This guide shows you how to automatically create tables in Supabase.

## Method 1: Supabase Dashboard (Recommended for First Time)

**Easiest method - No code required**

1. Go to your Supabase project: https://lbtzrworenlwecbktlpq.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open `backend/supabase-schema.sql` in your editor
5. Copy the entire SQL content
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl+Enter)

✅ Tables will be created immediately!

## Method 2: Supabase CLI (Best for Development)

**Automated migrations with version control**

### Setup:
```bash
# Install Supabase CLI globally
npm install -g supabase

# Or use npx
npx supabase
```

### Usage:
```bash
# Login to Supabase
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref lbtzrworenlwecbktlpq

# Create migration file
supabase migration new create_initial_schema

# Copy SQL from supabase-schema.sql into the new migration file
# Location: supabase/migrations/XXXXXX_create_initial_schema.sql

# Push migrations to Supabase
supabase db push
```

## Method 3: REST API Migration Script

**Automated via code (requires service_role key)**

### Setup:
1. Get your **service_role** key:
   - Go to Supabase Dashboard
   - Settings → API
   - Copy **service_role** key (⚠️ Keep this secret!)

2. Add to `.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. Run migration:
```bash
npm run migrate:rest
```

## Method 4: Migration Helper Script

**Check status and get instructions**

```bash
npm run migrate
```

This will:
- ✅ Check which tables exist
- ✅ Verify Supabase connection
- ✅ Provide step-by-step instructions

## 📋 What Gets Created

The migration creates these tables:
- ✅ `users` - All user types (client, driver, carwash, admin)
- ✅ `vehicles` - Client vehicles
- ✅ `services` - Car wash services
- ✅ `bookings` - Booking records
- ✅ `payments` - Payment records

Plus:
- Indexes for performance
- Foreign key constraints
- Auto-update triggers for `updated_at` timestamps

## 🔍 Verify Tables Were Created

After running migration, verify in Supabase:

1. Go to **Table Editor** in Supabase Dashboard
2. You should see all 5 tables listed
3. Click on each table to see its structure

Or run the helper:
```bash
npm run migrate
```

## 🛠️ Troubleshooting

### "Table already exists"
- ✅ This is fine! Tables are already created
- Migration is idempotent (safe to run multiple times)

### "Permission denied"
- Make sure you're using the correct API key
- For REST API method, use **service_role** key (not anon key)

### "Connection failed"
- Check `SUPABASE_URL` in `.env`
- Verify your Supabase project is active
- Check internet connection

## 📝 Next Steps

After tables are created:

1. ✅ Restart your backend: `npm run dev`
2. ✅ Test API endpoints
3. ✅ Create your first user via registration API
4. ✅ Start using the system!

## 🔄 Re-running Migrations

Migrations are safe to run multiple times. The SQL uses `CREATE TABLE IF NOT EXISTS`, so:
- Existing tables won't be affected
- Missing tables will be created
- Data won't be lost

## 📚 Additional Resources

- [Supabase SQL Editor](https://supabase.com/dashboard/project/lbtzrworenlwecbktlpq/sql)
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
