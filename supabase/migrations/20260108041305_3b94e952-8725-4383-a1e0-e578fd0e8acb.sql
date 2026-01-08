-- =============================================
-- FASE 0: MULTI-TENANT + FEATURE FLAGS
-- =============================================

-- 1. Expandir app_role com novos perfis
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'commercial';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'financial';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support';

-- 2. Tabela de Feature Flags por Tenant
CREATE TABLE public.tenant_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  plan_tier TEXT DEFAULT 'starter',
  enabled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, feature_key)
);

-- Índices para tenant_features
CREATE INDEX idx_tenant_features_tenant ON public.tenant_features(tenant_id);
CREATE INDEX idx_tenant_features_key ON public.tenant_features(feature_key);

-- RLS para tenant_features
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar feature flags"
  ON public.tenant_features FOR ALL
  USING (is_site_admin(auth.uid(), tenant_id))
  WITH CHECK (is_site_admin(auth.uid(), tenant_id));

CREATE POLICY "Membros podem ver feature flags do tenant"
  ON public.tenant_features FOR SELECT
  USING (is_site_member(auth.uid(), tenant_id));

-- Trigger updated_at
CREATE TRIGGER update_tenant_features_updated_at
  BEFORE UPDATE ON public.tenant_features
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FASE 6: MARKETPLACE DE SOLUÇÕES
-- =============================================

-- 3. Catálogo de Soluções (global)
CREATE TABLE public.solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  benefits TEXT[],
  who_should_use TEXT,
  icon TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_plan TEXT DEFAULT 'starter',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para solutions (público para leitura)
ALTER TABLE public.solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Soluções são públicas para leitura"
  ON public.solutions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Super admins podem gerenciar soluções"
  ON public.solutions FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- 4. Soluções contratadas por Tenant
CREATE TABLE public.tenant_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  solution_id UUID NOT NULL REFERENCES public.solutions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  payment_status TEXT DEFAULT 'pending',
  billing_cycle TEXT DEFAULT 'monthly',
  next_billing_date DATE,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, solution_id)
);

-- Índices
CREATE INDEX idx_tenant_solutions_tenant ON public.tenant_solutions(tenant_id);
CREATE INDEX idx_tenant_solutions_status ON public.tenant_solutions(status);

-- RLS para tenant_solutions
ALTER TABLE public.tenant_solutions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar soluções do tenant"
  ON public.tenant_solutions FOR ALL
  USING (is_site_admin(auth.uid(), tenant_id))
  WITH CHECK (is_site_admin(auth.uid(), tenant_id));

CREATE POLICY "Membros podem ver soluções do tenant"
  ON public.tenant_solutions FOR SELECT
  USING (is_site_member(auth.uid(), tenant_id));

-- Trigger updated_at
CREATE TRIGGER update_tenant_solutions_updated_at
  BEFORE UPDATE ON public.tenant_solutions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNÇÃO HELPER: Verificar se tenant tem solução ativa
-- =============================================

CREATE OR REPLACE FUNCTION public.tenant_has_solution(_tenant_id UUID, _solution_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_solutions ts
    JOIN public.solutions s ON s.id = ts.solution_id
    WHERE ts.tenant_id = _tenant_id
      AND s.key = _solution_key
      AND ts.status = 'active'
      AND (ts.expires_at IS NULL OR ts.expires_at > now())
  )
$$;

-- =============================================
-- FUNÇÃO HELPER: Verificar se feature está ativa
-- =============================================

CREATE OR REPLACE FUNCTION public.tenant_has_feature(_tenant_id UUID, _feature_key TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.tenant_features
    WHERE tenant_id = _tenant_id
      AND feature_key = _feature_key
      AND is_enabled = true
      AND (expires_at IS NULL OR expires_at > now())
  )
$$;

-- =============================================
-- SEED: Catálogo inicial de soluções
-- =============================================

INSERT INTO public.solutions (key, name, description, benefits, who_should_use, icon, price_monthly, price_yearly, sort_order) VALUES
('news_cms', 'Notícias & CMS', 'Sistema completo de gestão de conteúdo para portais de notícias.', 
  ARRAY['Publicação ilimitada', 'SEO otimizado', 'Agendamento', 'Histórico de versões'], 
  'Todos os portais de notícias', 'Newspaper', 0, 0, 1),

('syndication', 'Sindicação de Conteúdo', 'Compartilhe e receba conteúdo de portais parceiros da rede.', 
  ARRAY['Importação automática', 'Reescrita por IA', 'Filtros inteligentes', 'Créditos automáticos'], 
  'Portais que querem expandir cobertura', 'Share2', 99, 990, 2),

('journalist_style', 'Estilo do Jornalista', 'IA aprende o estilo de escrita de cada jornalista.', 
  ARRAY['Perfil personalizado', 'Reescrita no estilo', 'Até 10 referências', 'Múltiplos jornalistas'], 
  'Redações com identidade editorial', 'Sparkles', 79, 790, 3),

('custom_domain', 'Domínio Personalizado', 'Use seu próprio domínio no portal.', 
  ARRAY['Domínio próprio', 'Verificação DNS', 'Redirecionamentos', 'Email configurável'], 
  'Portais que querem marca própria', 'Globe', 49, 490, 4),

('ssl_premium', 'Certificado SSL Premium', 'Certificado SSL de alta confiança para seu domínio.', 
  ARRAY['SSL EV/OV', 'Renovação automática', 'Suporte prioritário', 'Selo de segurança'], 
  'Portais com transações financeiras', 'Shield', 29, 290, 5),

('scheduler', 'Sistema de Agendamentos', 'Permita que leitores agendem serviços e consultas.', 
  ARRAY['Agenda visual', 'Confirmação automática', 'Lembretes', 'Pagamento integrado'], 
  'Jornalistas consultores e especialistas', 'Calendar', 79, 790, 6),

('events', 'Criador de Eventos', 'Crie e gerencie eventos com venda de ingressos.', 
  ARRAY['Página do evento', 'Ingressos e lotes', 'Check-in por QR', 'Relatórios'], 
  'Portais que promovem eventos', 'CalendarDays', 149, 1490, 7),

('ads_suite', 'Campanhas & Publis', 'Sistema completo de gestão de anúncios e publieditoriais.', 
  ARRAY['Gestão de anunciantes', 'Múltiplos formatos', 'Métricas detalhadas', 'Relatórios exportáveis'], 
  'Portais que monetizam com publicidade', 'Megaphone', 199, 1990, 8),

('analytics_pro', 'Analytics Avançado', 'Métricas detalhadas de audiência e performance.', 
  ARRAY['Dashboards personalizados', 'Métricas em tempo real', 'Exportação de dados', 'Integração GA4'], 
  'Portais focados em crescimento', 'BarChart3', 99, 990, 9),

('fiscal_center', 'Centro Fiscal', 'Gestão fiscal completa com emissão de notas.', 
  ARRAY['Cadastro fiscal', 'Controle de recebíveis', 'Emissão de NF', 'Relatórios contábeis'], 
  'Jornalistas e portais com faturamento', 'Receipt', 149, 1490, 10),

('digital_edition', 'Edição Digital', 'Crie edições digitais organizadas do seu portal.', 
  ARRAY['Editor visual', 'Seções personalizadas', 'Página pública', 'Métricas por edição'], 
  'Portais com edições periódicas', 'BookOpen', 79, 790, 11),

('training', 'Treinamento Premium', 'Acesso completo à Universidade Conexão.', 
  ARRAY['Trilhas por perfil', 'Certificados', 'Suporte prioritário', 'Mentoria mensal'], 
  'Equipes em formação', 'GraduationCap', 49, 490, 12);

-- =============================================
-- ADICIONAR tenant_id às tabelas existentes (onde falta)
-- =============================================

-- Adicionar tenant_id à tabela news (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'news' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.news ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela categories (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.categories ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela tags (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tags' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.tags ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela web_stories (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'web_stories' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.web_stories ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela quick_notes (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quick_notes' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.quick_notes ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela ads (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ads' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.ads ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela super_banners (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'super_banners' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.super_banners ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela social_accounts (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_accounts' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.social_accounts ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;

-- Adicionar tenant_id à tabela social_posts (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'social_posts' AND column_name = 'tenant_id') THEN
    ALTER TABLE public.social_posts ADD COLUMN tenant_id UUID REFERENCES public.sites(id);
  END IF;
END $$;