-- Add RLS policies for campaign-assets storage bucket
-- Public read access for all campaign assets
CREATE POLICY "Public read access for campaign-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'campaign-assets');

-- Admins can upload to campaign-assets
CREATE POLICY "Admins can upload campaign-assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'campaign-assets' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'commercial')
  )
);

-- Admins can update campaign-assets
CREATE POLICY "Admins can update campaign-assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'campaign-assets' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'commercial')
  )
);

-- Admins can delete campaign-assets
CREATE POLICY "Admins can delete campaign-assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'campaign-assets' 
  AND EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('super_admin', 'admin', 'commercial')
  )
);

-- Add column for push_subscription tracking if not exists
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);

-- Enable RLS for push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can manage their own subscriptions
CREATE POLICY "Users manage own push subscriptions"
ON push_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add index for faster cycle queries
CREATE INDEX IF NOT EXISTS idx_campaign_cycles_status ON campaign_cycles(status);
CREATE INDEX IF NOT EXISTS idx_campaign_cycles_dates ON campaign_cycles(starts_at, ends_at);

-- Add metrics_summary JSONB column to campaign_cycles for aggregated metrics
ALTER TABLE campaign_cycles ADD COLUMN IF NOT EXISTS metrics_summary JSONB DEFAULT '{}'::jsonb;