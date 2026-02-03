-- Fase 4: Adicionar campos de integração 360 nas tabelas legadas

-- Adicionar campos de integração 360 na tabela ads
ALTER TABLE ads 
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS managed_by_campaign BOOLEAN DEFAULT false;

-- Adicionar campos de integração 360 na tabela super_banners
ALTER TABLE super_banners 
  ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES campaigns_unified(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS managed_by_campaign BOOLEAN DEFAULT false;

-- Adicionar cycle_id em campaign_events se não existir
ALTER TABLE campaign_events 
  ADD COLUMN IF NOT EXISTS cycle_id UUID REFERENCES campaign_cycles(id) ON DELETE SET NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_ads_campaign_id ON ads(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_super_banners_campaign_id ON super_banners(campaign_id) WHERE campaign_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_campaign_events_cycle_id ON campaign_events(cycle_id) WHERE cycle_id IS NOT NULL;