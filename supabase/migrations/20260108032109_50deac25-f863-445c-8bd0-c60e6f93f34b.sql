-- =============================================
-- MÓDULO GERADOR DE LINKS - MIGRAÇÃO COMPLETA
-- =============================================

-- 1. Tabela SITES (Multi-tenant)
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  primary_domain TEXT UNIQUE NOT NULL,
  base_url TEXT NOT NULL,
  news_path_prefix TEXT DEFAULT '/noticia/',
  default_utm_source TEXT,
  default_utm_medium_map JSONB DEFAULT '{"facebook": "social", "instagram": "social", "whatsapp": "social", "x": "social", "telegram": "social", "email": "email", "copy": "referral", "qr": "qrcode"}'::jsonb,
  short_domain TEXT,
  share_enabled BOOLEAN DEFAULT true,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela CAMPAIGNS (Campanhas de Marketing)
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objective TEXT,
  start_date DATE,
  end_date DATE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela LINKS (Links Rastreáveis)
CREATE TABLE public.links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  destination_url TEXT NOT NULL,
  canonical_url TEXT,
  slug TEXT,
  short_url TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  final_url TEXT,
  entity_type TEXT DEFAULT 'custom',
  entity_id UUID,
  channel TEXT,
  unique_key TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  expires_at TIMESTAMPTZ,
  click_count INTEGER NOT NULL DEFAULT 0,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela QR_CODES
CREATE TABLE public.qr_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  size INTEGER DEFAULT 256,
  format TEXT DEFAULT 'png' CHECK (format IN ('png', 'svg')),
  storage_url TEXT,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela BIO_PAGES (Páginas Link-in-bio)
CREATE TABLE public.bio_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  background_color TEXT DEFAULT '#ffffff',
  text_color TEXT DEFAULT '#000000',
  is_active BOOLEAN DEFAULT true,
  owner_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabela BIO_BUTTONS (Botões da Bio Page)
CREATE TABLE public.bio_buttons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bio_page_id UUID NOT NULL REFERENCES public.bio_pages(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id) ON DELETE SET NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabela CLICK_EVENTS (Rastreamento de Cliques)
CREATE TABLE public.click_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  bio_button_id UUID REFERENCES public.bio_buttons(id) ON DELETE CASCADE,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  referer TEXT,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet')),
  browser TEXT,
  ip_hash TEXT,
  country TEXT,
  city TEXT
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_links_site_entity ON public.links(site_id, entity_type, entity_id, channel);
CREATE INDEX idx_links_slug ON public.links(slug) WHERE slug IS NOT NULL;
CREATE INDEX idx_links_status ON public.links(status);
CREATE INDEX idx_click_events_link_date ON public.click_events(link_id, clicked_at);
CREATE INDEX idx_click_events_button ON public.click_events(bio_button_id) WHERE bio_button_id IS NOT NULL;
CREATE INDEX idx_bio_pages_slug ON public.bio_pages(slug) WHERE is_active = true;
CREATE INDEX idx_campaigns_site ON public.campaigns(site_id, status);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_sites_updated_at
  BEFORE UPDATE ON public.sites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bio_pages_updated_at
  BEFORE UPDATE ON public.bio_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bio_buttons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;

-- SITES: Admin gerencia, Editor lê
CREATE POLICY "Admins podem gerenciar sites"
  ON public.sites FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Editores podem ver sites"
  ON public.sites FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- CAMPAIGNS: Editor+ pode gerenciar
CREATE POLICY "Editores podem gerenciar campanhas"
  ON public.campaigns FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

-- LINKS: Editor+ pode criar/gerenciar
CREATE POLICY "Editores podem gerenciar links"
  ON public.links FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Links ativos são públicos para leitura"
  ON public.links FOR SELECT
  USING (status = 'active');

-- QR_CODES: Editor+ pode gerenciar
CREATE POLICY "Editores podem gerenciar QR codes"
  ON public.qr_codes FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "QR codes são públicos para leitura"
  ON public.qr_codes FOR SELECT
  USING (true);

-- BIO_PAGES: Editor+ pode gerenciar
CREATE POLICY "Editores podem gerenciar bio pages"
  ON public.bio_pages FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Bio pages ativas são públicas"
  ON public.bio_pages FOR SELECT
  USING (is_active = true);

-- BIO_BUTTONS: Editor+ pode gerenciar
CREATE POLICY "Editores podem gerenciar bio buttons"
  ON public.bio_buttons FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Bio buttons ativos são públicos"
  ON public.bio_buttons FOR SELECT
  USING (is_active = true);

-- CLICK_EVENTS: Sistema insere, Admin lê
CREATE POLICY "Sistema pode inserir click events"
  ON public.click_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Editores podem ver click events"
  ON public.click_events FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- =============================================
-- FUNÇÃO PARA INCREMENTAR CLIQUES
-- =============================================

CREATE OR REPLACE FUNCTION public.increment_link_clicks(p_link_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.links
  SET click_count = click_count + 1
  WHERE id = p_link_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_button_clicks(p_button_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.bio_buttons
  SET click_count = click_count + 1
  WHERE id = p_button_id;
END;
$$;