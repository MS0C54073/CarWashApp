-- Add user approval workflow fields
-- Run this in Supabase SQL Editor

-- Add approval status and workflow fields
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved' 
  CHECK (approval_status IN ('pending', 'approved', 'rejected'));

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_notes TEXT;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approval_requested_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for pending approvals
CREATE INDEX IF NOT EXISTS idx_users_approval_status ON users(approval_status) WHERE approval_status = 'pending';

-- Create index for created_by
CREATE INDEX IF NOT EXISTS idx_users_created_by ON users(created_by);

-- Update existing users to be approved
UPDATE users SET approval_status = 'approved' WHERE approval_status IS NULL;
