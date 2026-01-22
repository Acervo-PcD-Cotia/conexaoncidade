-- =============================================
-- SISTEMA DE MODELOS WHITE-LABEL (TEMPLATES)
-- =============================================

-- Tabela de templates padrão do sistema
CREATE TABLE public.portal_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  preview_image TEXT,
  theme JSONB DEFAULT '{}',
  default_modules JSONB DEFAULT '[]',
  vocabulary JSONB DEFAULT '{}',
  initial_content JSONB DEFAULT '{}',
  language_style TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Configuração de template por site
CREATE TABLE public.site_template_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE UNIQUE,
  template_id UUID REFERENCES portal_templates(id),
  theme_overrides JSONB DEFAULT '{}',
  vocabulary_overrides JSONB DEFAULT '{}',
  modules_overrides JSONB DEFAULT '{}',
  branding JSONB DEFAULT '{}',
  radio_config JSONB DEFAULT '{}',
  tv_config JSONB DEFAULT '{}',
  applied_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Extensão da tabela sites
ALTER TABLE public.sites
ADD COLUMN IF NOT EXISTS current_template_id UUID REFERENCES portal_templates(id),
ADD COLUMN IF NOT EXISTS is_white_label BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'starter';

-- Índices
CREATE INDEX idx_portal_templates_key ON public.portal_templates(key);
CREATE INDEX idx_portal_templates_active ON public.portal_templates(is_active);
CREATE INDEX idx_site_template_config_site ON public.site_template_config(site_id);
CREATE INDEX idx_site_template_config_template ON public.site_template_config(template_id);

-- RLS para portal_templates
ALTER TABLE public.portal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Templates are viewable by everyone"
ON public.portal_templates FOR SELECT
USING (is_active = true);

CREATE POLICY "Only admins can manage templates"
ON public.portal_templates FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role IN ('super_admin', 'admin')
  )
);

-- RLS para site_template_config (usando site_users para permissões)
ALTER TABLE public.site_template_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site config viewable by site members"
ON public.site_template_config FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM site_users su
    WHERE su.user_id = auth.uid()
    AND su.site_id = site_template_config.site_id
    AND su.status = 'active'
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'super_admin'
  )
);

CREATE POLICY "Site config editable by site admins"
ON public.site_template_config FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM site_users su
    WHERE su.user_id = auth.uid()
    AND su.site_id = site_template_config.site_id
    AND su.role = 'admin'
    AND su.status = 'active'
  )
  OR
  EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'super_admin'
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_portal_templates_updated_at
BEFORE UPDATE ON public.portal_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_template_config_updated_at
BEFORE UPDATE ON public.site_template_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED: TEMPLATES PADRÃO
-- =============================================

INSERT INTO public.portal_templates (key, name, description, icon, language_style, sort_order, theme, default_modules, vocabulary)
VALUES 
(
  'journalist',
  'Portal Jornalístico',
  'Ideal para portais de notícias, jornalistas independentes e veículos de comunicação.',
  'Newspaper',
  'journalistic',
  1,
  '{"primary": "25 95% 53%", "secondary": "220 20% 20%", "layout": "news-grid", "heroStyle": "headline-focus", "typography": "editorial"}'::jsonb,
  '["news_cms", "lives", "scheduling", "podcast", "audio_article", "headline_banner", "web_radio", "web_tv", "stories", "push"]'::jsonb,
  '{"home": "Início", "news": "Notícias", "radio": "Rádio", "tv": "WebTV", "lives": "Ao Vivo", "programs": "Programas", "schedule": "Agenda", "podcast": "Podcast", "about": "Sobre", "contact": "Contato", "search": "Buscar", "latest": "Últimas", "featured": "Destaque", "breaking": "Urgente"}'::jsonb
),
(
  'church',
  'Portal Religioso',
  'Perfeito para igrejas, ministérios e comunidades religiosas.',
  'Church',
  'pastoral',
  2,
  '{"primary": "240 60% 50%", "secondary": "220 30% 95%", "layout": "worship-centered", "heroStyle": "video-focus", "typography": "warm"}'::jsonb,
  '["news_cms", "lives", "web_radio", "web_tv", "schedule", "donations", "vod", "members", "push"]'::jsonb,
  '{"home": "Início", "news": "Mensagens", "radio": "Louvor 24h", "tv": "TV Igreja", "lives": "Cultos", "programs": "Programação", "schedule": "Escala", "donate": "Contribua", "members": "Membros", "about": "Quem Somos", "contact": "Fale Conosco", "search": "Buscar", "latest": "Recentes", "featured": "Em Destaque"}'::jsonb
),
(
  'influencer',
  'Hub do Criador',
  'Para influenciadores, criadores de conteúdo e artistas.',
  'Star',
  'direct',
  3,
  '{"primary": "280 80% 60%", "secondary": "260 20% 10%", "layout": "creator-hub", "heroStyle": "profile-focus", "typography": "modern"}'::jsonb,
  '["lives", "chat", "members", "exclusive_content", "monetization", "web_radio", "web_tv", "stories", "vod", "push"]'::jsonb,
  '{"home": "Início", "news": "Posts", "radio": "Minha Rádio", "tv": "Meu Canal", "lives": "Lives", "programs": "Conteúdo", "members": "Membros VIP", "exclusive": "Exclusivo", "about": "Sobre Mim", "contact": "Contato", "search": "Buscar", "latest": "Novidades", "featured": "Destaque"}'::jsonb
),
(
  'corporate',
  'Portal Corporativo',
  'Para empresas e instituições.',
  'Building2',
  'professional',
  4,
  '{"primary": "210 80% 40%", "secondary": "210 20% 95%", "layout": "corporate-clean", "heroStyle": "banner-focus", "typography": "professional"}'::jsonb,
  '["news_cms", "lives", "web_tv", "webinars", "internal_content", "reports", "vod", "schedule", "push"]'::jsonb,
  '{"home": "Início", "news": "Comunicados", "radio": "Rádio Interna", "tv": "TV Corporativa", "lives": "Eventos", "programs": "Webinars", "internal": "Conteúdo Interno", "about": "Institucional", "contact": "Contato", "search": "Buscar", "latest": "Recentes", "featured": "Em Destaque"}'::jsonb
);