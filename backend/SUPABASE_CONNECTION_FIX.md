# 🔧 Supabase Connection Fix Guide

## Error: "TypeError: fetch failed"

This error usually means one of the following:

### 1. Missing or Incorrect Environment Variables

**Check your `.env` file in the `backend` directory:**

```env
SUPABASE_URL=https://lbtzrworenlwecbktlpq.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
```

**To get these values:**
1. Go to: https://lbtzrworenlwecbktlpq.supabase.co
2. Click: **Settings** → **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

### 2. Network Connection Issue

**Verify your connection:**
- Check your internet connection
- Try accessing the Supabase URL in your browser
- Check if your firewall/proxy is blocking the connection

### 3. Supabase Project Status

**Verify the project is active:**
- Go to Supabase Dashboard
- Check if the project is paused or inactive
- Ensure you have access to the project

### 4. URL Format

**Ensure the URL is correct:**
- Should start with `https://`
- Should not have a trailing slash
- Example: `https://lbtzrworenlwecbktlpq.supabase.co`

## Quick Fix Steps

1. **Verify `.env` file exists** in `backend/` directory
2. **Check environment variables are set:**
   ```powershell
   cd backend
   Get-Content .env | Select-String "SUPABASE"
   ```
3. **Restart the server:**
   ```powershell
   npm run dev
   ```
4. **Look for detailed error messages** - the improved error handling will show exactly what's wrong

## Expected Output

When connection is successful, you should see:
```
🔄 Testing Supabase connection...
📍 URL: https://lbtzrworenlwecbktlpq.supabase.co
✅ Supabase connected successfully
📍 Connected to: https://lbtzrworenlwecbktlpq.supabase.co
```

## Still Having Issues?

1. **Check the console output** - it now provides detailed diagnostics
2. **Verify Supabase project is accessible** in browser
3. **Check network/firewall settings**
4. **Ensure environment variables are loaded** (restart terminal/IDE after creating `.env`)
