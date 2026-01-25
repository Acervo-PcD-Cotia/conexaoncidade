-- Create external_streaming_configs table for multi-tenant streaming configuration
CREATE TABLE public.external_streaming_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('radio', 'tv')),
  is_active BOOLEAN DEFAULT true,
  
  -- API Externa (VoxHD, VoxTV, etc)
  api_json_url TEXT,
  api_xml_url TEXT,
  
  -- Embed (player incorporado)
  embed_mode TEXT DEFAULT 'iframe' CHECK (embed_mode IN ('iframe', 'html', 'url')),
  embed_code TEXT,
  player_url TEXT,
  public_page_path TEXT DEFAULT '/radio',
  
  -- Painel externo (atalho)
  external_panel_url TEXT,
  notes TEXT,
  
  -- Cache/Estado
  last_snapshot JSONB,
  last_fetched_at TIMESTAMPTZ,
  error_count INT DEFAULT 0,
  last_error TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(tenant_id, kind)
);

-- Enable RLS
ALTER TABLE public.external_streaming_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Tenant members can read their configs
CREATE POLICY "Tenant members can view streaming configs"
ON public.external_streaming_configs FOR SELECT
USING (
  tenant_id IN (
    SELECT site_id FROM site_users 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- RLS Policy: Tenant admins can manage configs
CREATE POLICY "Tenant admins can manage streaming configs"
ON public.external_streaming_configs FOR ALL
USING (
  tenant_id IN (
    SELECT site_id FROM site_users 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'editor')
    AND status = 'active'
  )
  OR EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  )
);

-- Public read policy for embed rendering on public pages
CREATE POLICY "Public can read active streaming configs for embed"
ON public.external_streaming_configs FOR SELECT
USING (is_active = true);

-- Trigger updated_at
CREATE TRIGGER update_streaming_configs_updated_at
  BEFORE UPDATE ON public.external_streaming_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_streaming_configs_tenant_kind ON public.external_streaming_configs(tenant_id, kind);
CREATE INDEX idx_streaming_configs_active ON public.external_streaming_configs(is_active) WHERE is_active = true;