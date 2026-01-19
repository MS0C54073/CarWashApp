# Supabase Setup Guide

## ✅ Configuration Complete

Your backend is now configured to use Supabase instead of MongoDB.

## 📋 Setup Steps

### 1. Create Tables in Supabase

1. Go to your Supabase project: https://lbtzrworenlwecbktlpq.supabase.co
2. Navigate to **SQL Editor**
3. Copy the contents of `backend/supabase-schema.sql`
4. Paste and run the SQL script
5. This will create all necessary tables:
   - `users`
   - `vehicles`
   - `services`
   - `bookings`
   - `payments`

### 2. Environment Variables

Your `.env` file has been updated with:
```
SUPABASE_URL=https://lbtzrworenlwecbktlpq.supabase.co
SUPABASE_ANON_KEY=sb_publishable_MVGl7Zx-2ifRl52CQGc1-w_RQntd-7H
```

### 3. Restart Backend

```bash
cd backend
npm run dev
```

## 🔄 Migration from MongoDB to Supabase

### Key Changes:

1. **Database**: MongoDB → PostgreSQL (Supabase)
2. **ORM**: Mongoose → Supabase Client
3. **Models**: Need to be updated to use Supabase service layer

### Next Steps:

The current models still use Mongoose. You have two options:

**Option 1: Update Controllers to use SupabaseService**
- Replace Mongoose queries with `SupabaseService` methods
- Update all controllers to use the new service layer

**Option 2: Keep Mongoose Models (Hybrid)**
- Use Supabase for storage
- Keep Mongoose for validation (requires additional setup)

## 📝 Important Notes

- Supabase uses PostgreSQL (relational database)
- Tables use UUIDs instead of MongoDB ObjectIds
- Foreign key relationships are enforced at database level
- Row Level Security (RLS) can be enabled for additional security

## 🔐 Security

Consider enabling Row Level Security (RLS) in Supabase:
1. Go to **Authentication** → **Policies**
2. Create policies for each table
3. This ensures users can only access their own data

## ✅ Verification

Test the connection:
```bash
# The backend will test the connection on startup
npm run dev
```

You should see: `✅ Supabase connected successfully`
