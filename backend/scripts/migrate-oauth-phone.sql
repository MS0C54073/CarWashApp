-- Migration: Add OAuth and Phone Authentication Support
-- Description: Adds columns for Google OAuth and phone number verification

-- Add OAuth provider columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(50) DEFAULT 'local';

-- Add phone verification columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_code VARCHAR(6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verification_expires TIMESTAMP;

-- Add password as nullable (for OAuth-only users)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_auth_provider ON users(auth_provider);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Comments
COMMENT ON COLUMN users.google_id IS 'Google OAuth unique identifier';
COMMENT ON COLUMN users.auth_provider IS 'Authentication provider: local, google, phone';
COMMENT ON COLUMN users.phone_verified IS 'Whether phone number has been verified via SMS';
COMMENT ON COLUMN users.phone_verification_code IS 'Temporary SMS verification code';
COMMENT ON COLUMN users.phone_verification_expires IS 'Expiry time for verification code';
