# 🚀 Automatic Database Setup

## Step 1: Get Your Database Password

1. Go to: https://lbtzrworenlwecbktlpq.supabase.co
2. Click: **Settings** → **Database**
3. Scroll to: **Connection string** section
4. Find the connection string that looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.lbtzrworenlwecbktlpq.supabase.co:5432/postgres
   ```
5. **Copy the password** (the part between `postgres:` and `@`)

## Step 2: Add to .env File

Open `backend/.env` and add this line (replace `YOUR_ACTUAL_PASSWORD`):

```env
DATABASE_URL=postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.lbtzrworenlwecbktlpq.supabase.co:5432/postgres
```

**Example:**
```env
DATABASE_URL=postgresql://postgres:MySecurePassword123@db.lbtzrworenlwecbktlpq.supabase.co:5432/postgres
```

## Step 3: Run Automatic Migration

```bash
cd backend
npm run migrate:create
```

This will:
- ✅ Connect to your Supabase database
- ✅ Create all tables automatically
- ✅ Create indexes and triggers
- ✅ Verify everything was created

## ✅ Verify Tables Were Created

After running the migration:

1. Go to Supabase Dashboard
2. Click **Table Editor**
3. You should see:
   - `users`
   - `vehicles`
   - `services`
   - `bookings`
   - `payments`

Or run:
```bash
npm run migrate
```

## 🎉 Done!

Your database is now set up and ready to use!

---

## 🔒 Security Note

⚠️ **Never commit your `.env` file to git!** It contains your database password.

The `.env` file is already in `.gitignore` to protect your credentials.
