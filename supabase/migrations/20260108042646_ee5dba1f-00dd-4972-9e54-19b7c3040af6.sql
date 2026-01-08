-- =============================================
-- SPRINT 2: Events, Digital Editions, Financial, Training
-- =============================================

-- =============================================
-- FASE 2: MÓDULO DE EVENTOS (Estilo Sympla)
-- =============================================

-- Eventos
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  content_html TEXT,
  location TEXT,
  location_type TEXT DEFAULT 'presencial', -- presencial, online, hibrido
  online_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  hero_image_url TEXT,
  is_public BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT true,
  max_attendees INTEGER,
  status TEXT DEFAULT 'draft', -- draft, published, cancelled, finished
  seo_title TEXT,
  seo_description TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for events
CREATE POLICY "Eventos publicados são públicos"
  ON public.events FOR SELECT
  USING (status = 'published' AND is_public = true);

CREATE POLICY "Editores podem gerenciar eventos"
  ON public.events FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ingressos de Eventos
CREATE TABLE public.event_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  quantity INTEGER NOT NULL,
  sold_count INTEGER DEFAULT 0,
  sales_start TIMESTAMPTZ,
  sales_end TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingressos de eventos publicados são públicos"
  ON public.event_tickets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.events e 
    WHERE e.id = event_tickets.event_id 
    AND e.status = 'published'
  ));

CREATE POLICY "Editores podem gerenciar ingressos"
  ON public.event_tickets FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE TRIGGER update_event_tickets_updated_at
  BEFORE UPDATE ON public.event_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Participantes de Eventos
CREATE TABLE public.event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.event_tickets(id),
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  ticket_code TEXT UNIQUE,
  qr_code_url TEXT,
  status TEXT DEFAULT 'confirmed', -- pending, confirmed, cancelled, refunded
  payment_status TEXT DEFAULT 'paid', -- pending, paid, refunded
  payment_method TEXT,
  payment_amount DECIMAL(10,2),
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver própria inscrição"
  ON public.event_attendees FOR SELECT
  USING (auth.uid() = user_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Sistema pode inserir participantes"
  ON public.event_attendees FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Editores podem gerenciar participantes"
  ON public.event_attendees FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE TRIGGER update_event_attendees_updated_at
  BEFORE UPDATE ON public.event_attendees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Check-ins de Eventos
CREATE TABLE public.event_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id UUID NOT NULL REFERENCES public.event_attendees(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_in_by UUID,
  location TEXT,
  notes TEXT
);

ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editores podem gerenciar checkins"
  ON public.event_checkins FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

-- Cupons de Eventos
CREATE TABLE public.event_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  discount_type TEXT DEFAULT 'percent', -- percent, fixed
  discount_value DECIMAL(10,2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(event_id, code)
);

ALTER TABLE public.event_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editores podem gerenciar cupons"
  ON public.event_coupons FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

-- =============================================
-- FASE 3: MÓDULO DE EDIÇÃO DIGITAL
-- =============================================

-- Edições Digitais
CREATE TABLE public.digital_editions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  published_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, published, archived
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

ALTER TABLE public.digital_editions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Edições publicadas são públicas"
  ON public.digital_editions FOR SELECT
  USING (status = 'published' AND is_public = true);

CREATE POLICY "Editores podem gerenciar edições"
  ON public.digital_editions FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE TRIGGER update_digital_editions_updated_at
  BEFORE UPDATE ON public.digital_editions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Itens da Edição Digital
CREATE TABLE public.digital_edition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES public.digital_editions(id) ON DELETE CASCADE,
  news_id UUID REFERENCES public.news(id) ON DELETE SET NULL,
  section TEXT DEFAULT 'principal',
  headline_override TEXT,
  summary_override TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.digital_edition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Itens de edições publicadas são públicos"
  ON public.digital_edition_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.digital_editions e 
    WHERE e.id = digital_edition_items.edition_id 
    AND e.status = 'published'
  ));

CREATE POLICY "Editores podem gerenciar itens de edição"
  ON public.digital_edition_items FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

-- Visualizações de Edições
CREATE TABLE public.digital_edition_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  edition_id UUID NOT NULL REFERENCES public.digital_editions(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT now(),
  session_id TEXT,
  referrer TEXT,
  user_agent TEXT
);

ALTER TABLE public.digital_edition_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sistema pode inserir views"
  ON public.digital_edition_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Editores podem ver views"
  ON public.digital_edition_views FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- =============================================
-- FASE 4: MÓDULO FINANCEIRO
-- =============================================

-- Perfis Fiscais
CREATE TABLE public.fiscal_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id UUID,
  document_type TEXT NOT NULL, -- cpf, cnpj
  document_number TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  email TEXT,
  phone TEXT,
  address_json JSONB DEFAULT '{}'::jsonb,
  bank_info_json JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.fiscal_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprio perfil fiscal"
  ON public.fiscal_profiles FOR SELECT
  USING (auth.uid() = user_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Usuários podem criar próprio perfil fiscal"
  ON public.fiscal_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Usuários podem atualizar próprio perfil fiscal"
  ON public.fiscal_profiles FOR UPDATE
  USING (auth.uid() = user_id OR is_admin_or_editor(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins podem deletar perfis fiscais"
  ON public.fiscal_profiles FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_fiscal_profiles_updated_at
  BEFORE UPDATE ON public.fiscal_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Recebíveis
CREATE TABLE public.receivables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  fiscal_profile_id UUID REFERENCES public.fiscal_profiles(id),
  source_type TEXT NOT NULL, -- campaign, event, subscription, ads
  source_id UUID,
  description TEXT,
  gross_amount DECIMAL(10,2) NOT NULL,
  net_amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  tax_amount DECIMAL(10,2),
  status TEXT DEFAULT 'pending', -- pending, approved, paid, cancelled
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprios recebíveis"
  ON public.receivables FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.fiscal_profiles fp 
    WHERE fp.id = receivables.fiscal_profile_id 
    AND (fp.user_id = auth.uid() OR is_admin_or_editor(auth.uid()))
  ));

CREATE POLICY "Editores podem gerenciar recebíveis"
  ON public.receivables FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE TRIGGER update_receivables_updated_at
  BEFORE UPDATE ON public.receivables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Notas Fiscais / Recibos
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  receivable_id UUID REFERENCES public.receivables(id),
  invoice_number TEXT,
  invoice_type TEXT DEFAULT 'receipt', -- nfse, receipt
  issued_at TIMESTAMPTZ,
  pdf_url TEXT,
  provider_response JSONB,
  status TEXT DEFAULT 'pending', -- pending, issued, cancelled, error
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprias notas"
  ON public.invoices FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.receivables r 
    JOIN public.fiscal_profiles fp ON fp.id = r.fiscal_profile_id
    WHERE r.id = invoices.receivable_id 
    AND (fp.user_id = auth.uid() OR is_admin_or_editor(auth.uid()))
  ));

CREATE POLICY "Editores podem gerenciar notas"
  ON public.invoices FOR ALL
  USING (is_admin_or_editor(auth.uid()))
  WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FASE 5: MÓDULO DE TREINAMENTO
-- =============================================

-- Módulos de Treinamento
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  target_roles TEXT[] DEFAULT '{}', -- roles que devem ver
  category TEXT DEFAULT 'getting_started', -- getting_started, by_module, by_profile
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Módulos publicados são públicos"
  ON public.training_modules FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins podem gerenciar módulos"
  ON public.training_modules FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_training_modules_updated_at
  BEFORE UPDATE ON public.training_modules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Passos de Treinamento
CREATE TABLE public.training_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_html TEXT,
  video_url TEXT,
  action_url TEXT, -- link para a funcionalidade
  action_label TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.training_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Steps de módulos publicados são públicos"
  ON public.training_steps FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.training_modules m 
    WHERE m.id = training_steps.module_id 
    AND m.is_published = true
  ));

CREATE POLICY "Admins podem gerenciar steps"
  ON public.training_steps FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Progresso de Treinamento
CREATE TABLE public.training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  step_id UUID NOT NULL REFERENCES public.training_steps(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, step_id)
);

ALTER TABLE public.training_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprio progresso"
  ON public.training_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem registrar próprio progresso"
  ON public.training_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio progresso"
  ON public.training_progress FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =============================================
-- SEED: Módulos de Treinamento Iniciais
-- =============================================

INSERT INTO public.training_modules (key, title, description, icon, category, sort_order) VALUES
  ('getting_started', 'Começar Agora', 'Aprenda os primeiros passos no Portal Conexão', 'Rocket', 'getting_started', 1),
  ('publishing', 'Como Publicar', 'Domine a criação e publicação de conteúdo', 'FileText', 'getting_started', 2),
  ('monetization', 'Como Monetizar', 'Transforme seu conteúdo em receita', 'DollarSign', 'getting_started', 3),
  ('growth', 'Como Crescer', 'Estratégias para expandir sua audiência', 'TrendingUp', 'getting_started', 4),
  ('news_module', 'Módulo Notícias', 'Guia completo do CMS de notícias', 'Newspaper', 'by_module', 10),
  ('events_module', 'Módulo Eventos', 'Como criar e gerenciar eventos', 'Calendar', 'by_module', 11),
  ('syndication_module', 'Sindicação', 'Rede de parceiros e conteúdo compartilhado', 'Share2', 'by_module', 12),
  ('journalist_track', 'Trilha Jornalista', 'Tudo que um jornalista precisa saber', 'User', 'by_profile', 20),
  ('editor_track', 'Trilha Editor', 'Gestão editorial avançada', 'Edit', 'by_profile', 21),
  ('commercial_track', 'Trilha Comercial', 'Vendas e monetização', 'Briefcase', 'by_profile', 22)
ON CONFLICT (key) DO NOTHING;