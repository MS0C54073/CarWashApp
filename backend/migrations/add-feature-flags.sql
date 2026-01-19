-- Migration: Add feature flags table for feature management
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'limited')),
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  enabled_roles TEXT[], -- Array of roles that have access
  enabled_regions TEXT[], -- Array of regions (for future use)
  metadata JSONB, -- Additional configuration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_status ON feature_flags(status);
CREATE INDEX IF NOT EXISTS idx_feature_flags_name ON feature_flags(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_feature_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_feature_flags_updated_at();

-- Insert default feature flags (examples)
INSERT INTO feature_flags (name, description, status, rollout_percentage, enabled_roles) VALUES
  ('live_tracking', 'Real-time vehicle tracking for clients and drivers', 'active', 100, ARRAY['client', 'driver']),
  ('advanced_analytics', 'Enhanced analytics dashboard for admins', 'limited', 50, ARRAY['admin']),
  ('mobile_payments', 'Mobile money payment integration', 'inactive', 0, ARRAY[]::TEXT[])
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE feature_flags IS 'Feature flags for controlling system features without redeployment';
