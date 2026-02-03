-- =============================================
-- FASE 1: Sistema de Campanhas 360
-- =============================================

-- 1.1 Expandir ENUMs para novos canais
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'push';
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'newsletter';
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'exit_intent';
ALTER TYPE campaign_channel_type ADD VALUE IF NOT EXISTS 'login_panel';

-- 1.2 Expandir ENUMs para novos eventos
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'push_sent';
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'push_delivered';
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'newsletter_sent';
ALTER TYPE campaign_event_type ADD VALUE IF NOT EXISTS 'newsletter_open';

-- 1.3 Criar tabela campaign_cycles
CREATE TABLE IF NOT EXISTS campaign_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns_unified(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  active_channels JSONB DEFAULT '["ads"]'::jsonb,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
  requires_confirmation BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 1.4 Expandir campaign_assets para derivados
ALTER TABLE campaign_assets 
  ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS derived_from UUID REFERENCES campaign_assets(id),
  ADD COLUMN IF NOT EXISTS upscale_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS auto_corrected BOOLEAN DEFAULT false;

-- 1.5 Criar bucket campaign-assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'campaign-assets',
  'campaign-assets',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- 1.6 Indices para performance
CREATE INDEX IF NOT EXISTS idx_campaign_cycles_campaign ON campaign_cycles(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_cycles_status ON campaign_cycles(status);
CREATE INDEX IF NOT EXISTS idx_campaign_cycles_dates ON campaign_cycles(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_campaign_assets_derived ON campaign_assets(derived_from) WHERE derived_from IS NOT NULL;

-- 1.7 Trigger para updated_at em campaign_cycles
CREATE OR REPLACE FUNCTION update_campaign_cycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS tr_campaign_cycles_updated_at ON campaign_cycles;
CREATE TRIGGER tr_campaign_cycles_updated_at
  BEFORE UPDATE ON campaign_cycles
  FOR EACH ROW
  EXECUTE FUNCTION update_campaign_cycles_updated_at();

-- 1.8 RLS para campaign_cycles
ALTER TABLE campaign_cycles ENABLE ROW LEVEL SECURITY;

-- Leitura publica para ciclos de campanhas ativas
CREATE POLICY "Public read cycles of active campaigns" ON campaign_cycles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM campaigns_unified c 
      WHERE c.id = campaign_cycles.campaign_id 
      AND c.status = 'active'
    )
  );

-- Admin full access
CREATE POLICY "Admin full access cycles" ON campaign_cycles
  FOR ALL TO authenticated
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

-- 1.9 Storage policies para campaign-assets
CREATE POLICY "Public read campaign assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'campaign-assets');

CREATE POLICY "Admin upload campaign assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'campaign-assets' AND is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin update campaign assets" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'campaign-assets' AND is_admin_or_editor(auth.uid()));

CREATE POLICY "Admin delete campaign assets" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'campaign-assets' AND is_admin_or_editor(auth.uid()));