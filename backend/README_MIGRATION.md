# 🚀 Quick Migration Guide

## Automatic Table Creation

Run this command to get step-by-step instructions:

```bash
npm run migrate
```

Or for automated migration (requires service_role key):

```bash
npm run migrate:auto
```

## ⚡ Fastest Method (30 seconds)

1. **Open Supabase Dashboard**: https://lbtzrworenlwecbktlpq.supabase.co
2. **Click**: SQL Editor (left sidebar)
3. **Click**: New Query
4. **Open**: `backend/supabase-schema.sql` in your code editor
5. **Copy**: All SQL content (Ctrl+A, Ctrl+C)
6. **Paste**: Into SQL Editor
7. **Click**: Run (or press Ctrl+Enter)

✅ **Done!** All tables are created.

## 🔑 For Automated Migration

If you want fully automated migration:

1. Get **service_role** key:
   - Supabase Dashboard → Settings → API
   - Copy **service_role** key

2. Add to `.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

3. Run:
```bash
npm run migrate:auto
```

## ✅ Verify Tables

After migration, verify in Supabase Dashboard:
- Go to **Table Editor**
- You should see: `users`, `vehicles`, `services`, `bookings`, `payments`

Or run:
```bash
npm run migrate
```

This will check which tables exist and show status.
