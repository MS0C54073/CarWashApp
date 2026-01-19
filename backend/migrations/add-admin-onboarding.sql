-- Migration: Add admin onboarding tracking
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS admin_onboarding (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  completed_sections TEXT[], -- Array of completed section IDs
  skipped BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(admin_id)
);

CREATE INDEX IF NOT EXISTS idx_admin_onboarding_admin_id ON admin_onboarding(admin_id);

COMMENT ON TABLE admin_onboarding IS 'Tracks admin onboarding progress';
