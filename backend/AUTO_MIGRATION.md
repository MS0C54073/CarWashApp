# 🚀 Automatic Table Creation

## ✅ Automatic Migration on Startup

The backend will **automatically create tables** when it starts if:
1. `DATABASE_URL` is set in `.env` file
2. Tables don't exist yet

## 📋 Setup

### Option 1: Add DATABASE_URL (Recommended)

Add this to `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.lbtzrworenlwecbktlpq.supabase.co:5432/postgres
```

**To get your password:**
1. Go to Supabase Dashboard → Settings → Database
2. Find "Connection string" section
3. Copy the password from the connection string

### Option 2: Manual Migration

If you don't want to use DATABASE_URL, you can still create tables manually:

```bash
npm run migrate:create
```

This will show you the SQL to run in Supabase SQL Editor.

## 🎯 How It Works

1. **Backend starts** → Connects to Supabase
2. **Checks tables** → Verifies if tables exist
3. **Auto-creates** → If tables are missing and DATABASE_URL is set, creates them automatically
4. **Ready to use** → Backend is ready!

## ✅ Verify

After backend starts, you should see:
```
✅ All tables exist - database ready
```

Or if tables were created:
```
✅ Tables created successfully!
🎉 Database initialization complete!
```

## 🔄 Manual Migration Command

You can also run migration manually anytime:

```bash
npm run migrate:create
```

This will:
- ✅ Check if DATABASE_URL is set
- ✅ Create tables automatically if possible
- ✅ Or show SQL to run manually

---

**That's it!** Tables will be created automatically when you start the backend! 🎉
