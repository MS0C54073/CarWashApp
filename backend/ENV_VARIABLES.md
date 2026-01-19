# Environment Variables for OAuth & Phone Auth

## Required for Google OAuth

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
```

**How to get:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
6. Copy Client ID

## Optional for Phone SMS (Twilio)

```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_VERIFY_SERVICE_SID=your_twilio_verify_service_sid
```

**How to get:**
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token from dashboard
3. Create a Verify Service:
   - Go to Verify → Services → Create
   - Copy Service SID

**Note:** If Twilio is not configured, the system will use mock mode:
- Mock OTP code: `123456`
- Codes are stored in database for verification

## Frontend Environment Variables

**frontend/.env:**
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

## Complete .env Example

**backend/.env:**
```env
# Supabase
SUPABASE_URL=http://localhost:54325
SUPABASE_ANON_KEY=your_anon_key

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# Twilio (Optional)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret
```
