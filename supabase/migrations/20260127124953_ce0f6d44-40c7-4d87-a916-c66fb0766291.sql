-- =============================================
-- PUBLIDOOR MODULE - Complete Database Schema
-- =============================================

-- 1. ENUMS
CREATE TYPE publidoor_item_type AS ENUM ('narrativo', 'contextual', 'geografico', 'editorial', 'impacto_total');
CREATE TYPE publidoor_item_status AS ENUM ('draft', 'review', 'approved', 'published');
CREATE TYPE publidoor_campaign_status AS ENUM ('draft', 'active', 'paused', 'ended');

-- 2. ADVERTISERS TABLE
CREATE TABLE public.publidoor_advertisers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  neighborhood TEXT,
  city TEXT,
  category TEXT,
  whatsapp TEXT,
  website TEXT,
  google_maps_url TEXT,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TEMPLATES TABLE
CREATE TABLE public.publidoor_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  font_family TEXT DEFAULT 'Inter',
  font_size TEXT DEFAULT 'base',
  color_palette JSONB DEFAULT '{"primary": "#000000", "secondary": "#ffffff", "accent": "#3b82f6"}',
  has_animations BOOLEAN DEFAULT true,
  preview_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. LOCATIONS TABLE
CREATE TABLE public.publidoor_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  max_items INTEGER DEFAULT 1,
  allows_rotation BOOLEAN DEFAULT false,
  device_target TEXT DEFAULT 'all' CHECK (device_target IN ('all', 'desktop', 'mobile')),
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- 5. CAMPAIGNS TABLE
CREATE TABLE public.publidoor_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  theme TEXT,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  is_exclusive BOOLEAN DEFAULT false,
  status publidoor_campaign_status DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. ITEMS TABLE (Main table)
CREATE TABLE public.publidoor_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  internal_name TEXT NOT NULL,
  type publidoor_item_type NOT NULL DEFAULT 'narrativo',
  advertiser_id UUID REFERENCES public.publidoor_advertisers(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  phrase_1 TEXT NOT NULL,
  phrase_2 TEXT,
  phrase_3 TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  logo_url TEXT,
  cta_text TEXT DEFAULT 'Saiba mais',
  cta_link TEXT,
  status publidoor_item_status DEFAULT 'draft',
  campaign_id UUID REFERENCES public.publidoor_campaigns(id) ON DELETE SET NULL,
  template_id UUID REFERENCES public.publidoor_templates(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. LOCATION ASSIGNMENTS TABLE
CREATE TABLE public.publidoor_location_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publidoor_id UUID NOT NULL REFERENCES public.publidoor_items(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.publidoor_locations(id) ON DELETE CASCADE,
  is_exclusive BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(publidoor_id, location_id)
);

-- 8. SCHEDULES TABLE
CREATE TABLE public.publidoor_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publidoor_id UUID NOT NULL REFERENCES public.publidoor_items(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('specific_dates', 'weekdays', 'time_range', 'business_hours', 'weekends', 'holidays')),
  days_of_week INTEGER[] DEFAULT '{}',
  time_start TIME,
  time_end TIME,
  specific_dates DATE[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. METRICS TABLE
CREATE TABLE public.publidoor_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publidoor_id UUID NOT NULL REFERENCES public.publidoor_items(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  device TEXT CHECK (device IN ('desktop', 'mobile', 'tablet')),
  avg_time_on_screen NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. APPROVALS TABLE
CREATE TABLE public.publidoor_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  publidoor_id UUID NOT NULL REFERENCES public.publidoor_items(id) ON DELETE CASCADE,
  reviewer_id UUID,
  action TEXT NOT NULL CHECK (action IN ('submitted', 'approved', 'rejected', 'revision_requested')),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. SETTINGS TABLE
CREATE TABLE public.publidoor_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, key)
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_publidoor_items_status ON public.publidoor_items(status);
CREATE INDEX idx_publidoor_items_tenant ON public.publidoor_items(tenant_id);
CREATE INDEX idx_publidoor_items_campaign ON public.publidoor_items(campaign_id);
CREATE INDEX idx_publidoor_metrics_date ON public.publidoor_metrics(date);
CREATE INDEX idx_publidoor_metrics_publidoor ON public.publidoor_metrics(publidoor_id);
CREATE INDEX idx_publidoor_campaigns_status ON public.publidoor_campaigns(status);
CREATE INDEX idx_publidoor_advertisers_status ON public.publidoor_advertisers(status);

-- =============================================
-- ENABLE RLS
-- =============================================
ALTER TABLE public.publidoor_advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_location_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publidoor_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Advertisers: Authenticated can read, admins can write
CREATE POLICY "Authenticated users can view advertisers" ON public.publidoor_advertisers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage advertisers" ON public.publidoor_advertisers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Templates: Public read for active, admins write
CREATE POLICY "Anyone can view active templates" ON public.publidoor_templates FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage templates" ON public.publidoor_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Locations: Public read for active, admins write
CREATE POLICY "Anyone can view active locations" ON public.publidoor_locations FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can manage locations" ON public.publidoor_locations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Campaigns: Authenticated access
CREATE POLICY "Authenticated users can view campaigns" ON public.publidoor_campaigns FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage campaigns" ON public.publidoor_campaigns FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Items: Public read published, authenticated full access
CREATE POLICY "Public can view published publidoors" ON public.publidoor_items FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated users can view all publidoors" ON public.publidoor_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage publidoors" ON public.publidoor_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update publidoors" ON public.publidoor_items FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete publidoors" ON public.publidoor_items FOR DELETE TO authenticated USING (true);

-- Location Assignments: Authenticated access
CREATE POLICY "Authenticated users can view assignments" ON public.publidoor_location_assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage assignments" ON public.publidoor_location_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Schedules: Authenticated access
CREATE POLICY "Authenticated users can view schedules" ON public.publidoor_schedules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage schedules" ON public.publidoor_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Metrics: Public insert (tracking), authenticated read
CREATE POLICY "Public can insert metrics" ON public.publidoor_metrics FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can view metrics" ON public.publidoor_metrics FOR SELECT TO authenticated USING (true);

-- Approvals: Authenticated access
CREATE POLICY "Authenticated users can view approvals" ON public.publidoor_approvals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage approvals" ON public.publidoor_approvals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Settings: Authenticated access
CREATE POLICY "Authenticated users can view settings" ON public.publidoor_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage settings" ON public.publidoor_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- SEED DATA: Default Templates
-- =============================================
INSERT INTO public.publidoor_templates (name, slug, description, font_family, color_palette, has_animations) VALUES
  ('Outdoor Urbano', 'outdoor_urbano', 'Visual de outdoor tradicional com impacto urbano', 'Inter', '{"primary": "#1a1a1a", "secondary": "#ffffff", "accent": "#ef4444"}', true),
  ('Manchete Editorial', 'manchete_editorial', 'Estilo de manchete de jornal, elegante e autoritativo', 'Merriweather', '{"primary": "#0f172a", "secondary": "#f8fafc", "accent": "#0ea5e9"}', false),
  ('Minimal Premium', 'minimal_premium', 'Design limpo e sofisticado com espaço em branco', 'Plus Jakarta Sans', '{"primary": "#18181b", "secondary": "#fafafa", "accent": "#a855f7"}', true),
  ('Impacto Total', 'impacto_total', 'Máxima ocupação visual para campanhas de alto impacto', 'Inter', '{"primary": "#000000", "secondary": "#fbbf24", "accent": "#dc2626"}', true),
  ('Bairro / Localidade', 'bairro_local', 'Foco em identidade local e proximidade com a comunidade', 'Inter', '{"primary": "#166534", "secondary": "#f0fdf4", "accent": "#22c55e"}', false);

-- =============================================
-- SEED DATA: Default Locations
-- =============================================
INSERT INTO public.publidoor_locations (name, slug, description, max_items, allows_rotation, device_target, is_premium) VALUES
  ('Topo da Home', 'home_top', 'Posição premium no topo da página inicial', 1, false, 'all', true),
  ('Entre Blocos de Notícias', 'news_between', 'Inserido entre seções de notícias', 3, true, 'all', false),
  ('Dentro da Notícia', 'news_inside', 'Exibido dentro do conteúdo da notícia', 1, false, 'all', true),
  ('Página de Categoria', 'category_page', 'Exibido em páginas de categorias específicas', 2, true, 'all', false),
  ('Página de Bairro', 'neighborhood_page', 'Exibido em páginas de bairros/localidades', 2, true, 'all', false),
  ('Mobile Exclusivo', 'mobile_only', 'Exibido apenas em dispositivos móveis', 1, false, 'mobile', false),
  ('Desktop Exclusivo', 'desktop_only', 'Exibido apenas em desktop', 1, false, 'desktop', false);

-- =============================================
-- SEED DATA: Default Settings
-- =============================================
INSERT INTO public.publidoor_settings (key, value, description) VALUES
  ('max_per_page', '3', 'Máximo de Publidoors por página'),
  ('min_display_time', '5', 'Tempo mínimo de exibição em segundos'),
  ('exclusivity_enabled', 'true', 'Habilita controle de exclusividade'),
  ('require_brand_badge', 'true', 'Exige badge "Conteúdo de Marca"'),
  ('brand_badge_text', '"Conteúdo de Marca"', 'Texto do badge de identificação'),
  ('analytics_enabled', 'true', 'Habilita coleta de métricas'),
  ('whatsapp_integration', 'true', 'Habilita integração com WhatsApp');

-- =============================================
-- TRIGGER: Update updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_publidoor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_publidoor_items_updated_at
  BEFORE UPDATE ON public.publidoor_items
  FOR EACH ROW EXECUTE FUNCTION public.update_publidoor_updated_at();

CREATE TRIGGER update_publidoor_campaigns_updated_at
  BEFORE UPDATE ON public.publidoor_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_publidoor_updated_at();

CREATE TRIGGER update_publidoor_advertisers_updated_at
  BEFORE UPDATE ON public.publidoor_advertisers
  FOR EACH ROW EXECUTE FUNCTION public.update_publidoor_updated_at();

CREATE TRIGGER update_publidoor_settings_updated_at
  BEFORE UPDATE ON public.publidoor_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_publidoor_updated_at();