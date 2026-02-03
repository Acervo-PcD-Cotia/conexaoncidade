-- =====================================================
-- UNIFIED CAMPAIGN SYSTEM - Database Schema
-- =====================================================

-- 1. Create ENUM types for channels, assets, and events
CREATE TYPE campaign_channel_type AS ENUM ('ads', 'publidoor', 'webstories');
CREATE TYPE campaign_asset_type AS ENUM ('banner', 'publidoor', 'story_cover', 'story_slide', 'logo');
CREATE TYPE campaign_event_type AS ENUM ('impression', 'click', 'cta_click', 'story_open', 'story_complete', 'slide_view');

-- 2. Create campaigns_unified table (main entity)
CREATE TABLE campaigns_unified (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES sites(id) ON DELETE CASCADE,
  
  -- Identification
  name TEXT NOT NULL,
  advertiser TEXT NOT NULL,
  description TEXT,
  
  -- Status and scheduling
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'ended')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  
  -- Configuration
  priority INTEGER DEFAULT 0,
  cta_text TEXT,
  cta_url TEXT,
  frequency_cap_per_day INTEGER DEFAULT 0,
  
  -- Control
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create campaign_channels table (which channels are enabled)
CREATE TABLE campaign_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  channel_type campaign_channel_type NOT NULL,
  enabled BOOLEAN DEFAULT true,
  
  -- Channel-specific configuration (JSON)
  config JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(campaign_id, channel_type)
);

-- 4. Create campaign_assets table (reusable assets)
CREATE TABLE campaign_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  asset_type campaign_asset_type NOT NULL,
  
  file_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  alt_text TEXT,
  
  -- For which channel and format
  channel_type campaign_channel_type,
  format_key TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create campaign_events table (unified metrics)
CREATE TABLE campaign_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  channel_type campaign_channel_type NOT NULL,
  event_type campaign_event_type NOT NULL,
  
  -- Context
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Create indexes for performance
CREATE INDEX idx_campaigns_unified_status ON campaigns_unified(status);
CREATE INDEX idx_campaigns_unified_dates ON campaigns_unified(starts_at, ends_at);
CREATE INDEX idx_campaigns_unified_tenant ON campaigns_unified(tenant_id);
CREATE INDEX idx_campaign_channels_campaign ON campaign_channels(campaign_id);
CREATE INDEX idx_campaign_channels_type ON campaign_channels(channel_type);
CREATE INDEX idx_campaign_assets_campaign ON campaign_assets(campaign_id);
CREATE INDEX idx_campaign_events_campaign ON campaign_events(campaign_id, created_at);
CREATE INDEX idx_campaign_events_channel ON campaign_events(channel_type, created_at);
CREATE INDEX idx_campaign_events_type ON campaign_events(event_type, created_at);

-- 7. Create trigger for updated_at
CREATE TRIGGER update_campaigns_unified_updated_at
  BEFORE UPDATE ON campaigns_unified
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_channels_updated_at
  BEFORE UPDATE ON campaign_channels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable RLS
ALTER TABLE campaigns_unified ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies for campaigns_unified
-- Public can read active campaigns
CREATE POLICY "Public read active campaigns" ON campaigns_unified
  FOR SELECT
  USING (status = 'active');

-- Admin/Editor full access
CREATE POLICY "Admin full access campaigns" ON campaigns_unified
  FOR ALL TO authenticated
  USING (is_admin_or_editor(auth.uid()));

-- 10. RLS Policies for campaign_channels
CREATE POLICY "Public read enabled channels" ON campaign_channels
  FOR SELECT
  USING (
    enabled = true AND
    EXISTS (
      SELECT 1 FROM campaigns_unified c 
      WHERE c.id = campaign_id AND c.status = 'active'
    )
  );

CREATE POLICY "Admin full access channels" ON campaign_channels
  FOR ALL TO authenticated
  USING (is_admin_or_editor(auth.uid()));

-- 11. RLS Policies for campaign_assets
CREATE POLICY "Public read assets" ON campaign_assets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns_unified c 
      WHERE c.id = campaign_id AND c.status = 'active'
    )
  );

CREATE POLICY "Admin full access assets" ON campaign_assets
  FOR ALL TO authenticated
  USING (is_admin_or_editor(auth.uid()));

-- 12. RLS Policies for campaign_events
CREATE POLICY "Public insert events" ON campaign_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin read events" ON campaign_events
  FOR SELECT TO authenticated
  USING (is_admin_or_editor(auth.uid()));

-- 13. View for legacy ads compatibility
CREATE VIEW v_legacy_ads_campaigns AS
SELECT 
  id,
  name,
  advertiser,
  'ads' as source,
  slot_type,
  image_url,
  is_active,
  starts_at,
  ends_at
FROM ads;