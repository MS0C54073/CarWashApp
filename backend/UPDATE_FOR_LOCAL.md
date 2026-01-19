# 🔄 Update Backend for Local Supabase

## ✅ Supabase is Running Locally!

Your local Supabase is now running. Here's how to connect your backend:

## 📋 Get Connection Details

Run this command to see all connection details:

```bash
npx supabase status
```

You'll see:
- **API URL**: http://localhost:54325
- **Studio URL**: http://localhost:54326  
- **DB URL**: postgresql://postgres:postgres@127.0.0.1:54323/postgres
- **Anon Key**: (shown in output)
- **Service Role Key**: (shown in output)

## ⚙️ Update backend/.env

Add or update these lines in `backend/.env`:

```env
# Local Supabase
SUPABASE_URL=http://localhost:54325
SUPABASE_ANON_KEY=your-anon-key-from-status-command

# Direct database connection (optional, for migrations)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54323/postgres
```

## ✅ Tables Are Already Created!

When Supabase started, it automatically:
- ✅ Ran the migration in `supabase/migrations/20240101000000_initial_schema.sql`
- ✅ Created all 5 tables (users, vehicles, services, bookings, payments)
- ✅ Set up indexes and triggers

## 🎯 Verify Tables

1. Open Supabase Studio: http://localhost:54326
2. Click **Table Editor** in the left sidebar
3. You should see all tables!

## 🚀 Start Backend

```bash
cd backend
npm run dev
```

The backend will connect to your local Supabase automatically!

## 📊 What's Running

- ✅ **Local PostgreSQL**: localhost:54323
- ✅ **Supabase API**: localhost:54325
- ✅ **Supabase Studio**: localhost:54326
- ✅ **All tables created**: Automatically via migration

---

**Your local Supabase is ready!** 🎉
