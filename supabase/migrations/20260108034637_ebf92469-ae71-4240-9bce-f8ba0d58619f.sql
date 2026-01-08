
-- =====================================================
-- MÓDULO SAAS: REDE DE PARCEIROS + ESTILOS DE ESCRITA
-- =====================================================

-- 1. ENUMS
CREATE TYPE public.site_user_role AS ENUM ('admin', 'editor', 'journalist', 'reviewer');
CREATE TYPE public.site_user_status AS ENUM ('active', 'pending', 'suspended');
CREATE TYPE public.article_kind AS ENUM ('original', 'imported', 'rewritten', 'edited');
CREATE TYPE public.partnership_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE public.delivery_mode AS ENUM ('teaser', 'full', 'rewrite');
CREATE TYPE public.import_mode AS ENUM ('manual', 'auto', 'auto_with_approval');
CREATE TYPE public.distribution_status AS ENUM ('queued', 'processing', 'needs_approval', 'published', 'failed', 'blocked');
CREATE TYPE public.imported_article_status AS ENUM ('inbox', 'published', 'rejected');
CREATE TYPE public.pitch_status AS ENUM ('sent', 'approved', 'rejected', 'needs_info');
CREATE TYPE public.style_profile_type AS ENUM ('journalist', 'site_default');
CREATE TYPE public.style_ref_kind AS ENUM ('link', 'txt', 'pdf');
CREATE TYPE public.style_ref_status AS ENUM ('uploaded', 'ingested', 'failed');

-- 2. SITE_USERS (Relacionamento usuário-site multi-tenant)
CREATE TABLE public.site_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role site_user_role NOT NULL DEFAULT 'journalist',
  status site_user_status NOT NULL DEFAULT 'pending',
  invited_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(site_id, user_id)
);

-- 3. ARTICLES (Abstração de conteúdo para parceiros)
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  news_id uuid REFERENCES public.news(id) ON DELETE SET NULL,
  title text NOT NULL,
  slug text NOT NULL,
  summary text,
  content_html text,
  author_name text,
  category text,
  tags jsonb DEFAULT '[]'::jsonb,
  hero_image_url text,
  published_at timestamptz,
  status text NOT NULL DEFAULT 'draft',
  canonical_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. ARTICLE_VERSIONS (Versionamento e auditoria)
CREATE TABLE public.article_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  kind article_kind NOT NULL DEFAULT 'original',
  content_html text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  style_profile_id uuid,
  style_version_id uuid,
  rewrite_engine text,
  rewrite_prompt_hash text
);

-- 5. PARTNER_RELATIONSHIPS (Parcerias entre sites)
CREATE TABLE public.partner_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  target_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  status partnership_status NOT NULL DEFAULT 'pending',
  allow_full_content boolean NOT NULL DEFAULT false,
  allow_rewrite boolean NOT NULL DEFAULT false,
  default_mode delivery_mode NOT NULL DEFAULT 'teaser',
  require_approval boolean NOT NULL DEFAULT true,
  rate_limit_day int DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(source_site_id, target_site_id),
  CHECK (source_site_id != target_site_id)
);

-- 6. IMPORT_SUBSCRIPTIONS (Inscrições de importação)
CREATE TABLE public.import_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  source_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  import_mode import_mode NOT NULL DEFAULT 'manual',
  delivery_mode delivery_mode NOT NULL DEFAULT 'teaser',
  category_map jsonb DEFAULT '{}'::jsonb,
  include_keywords text[] DEFAULT '{}',
  exclude_keywords text[] DEFAULT '{}',
  include_categories text[] DEFAULT '{}',
  exclude_categories text[] DEFAULT '{}',
  max_per_day int DEFAULT 10,
  allowed_hours jsonb DEFAULT '{"start": 0, "end": 24}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(target_site_id, source_site_id)
);

-- 7. DISTRIBUTION_JOBS (Fila de distribuição)
CREATE TABLE public.distribution_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  source_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  target_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  requested_mode delivery_mode NOT NULL DEFAULT 'teaser',
  effective_mode delivery_mode,
  status distribution_status NOT NULL DEFAULT 'queued',
  scheduled_for timestamptz,
  error_message text,
  attempts int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);

-- 8. IMPORTED_ARTICLES (Artigos importados)
CREATE TABLE public.imported_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  distribution_job_id uuid REFERENCES public.distribution_jobs(id) ON DELETE SET NULL,
  target_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  source_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  source_article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  target_article_id uuid REFERENCES public.articles(id) ON DELETE SET NULL,
  canonical_url text,
  credited_text text,
  status imported_article_status NOT NULL DEFAULT 'inbox',
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz
);

-- 9. PITCH_REQUESTS (Sugestões de pauta)
CREATE TABLE public.pitch_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  to_site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  suggested_sources jsonb DEFAULT '[]'::jsonb,
  status pitch_status NOT NULL DEFAULT 'sent',
  response_message text,
  responded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz
);

-- 10. JOURNALIST_STYLE_PROFILES (Perfis de estilo)
CREATE TABLE public.journalist_style_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid NOT NULL REFERENCES public.sites(id) ON DELETE CASCADE,
  user_id uuid,
  profile_type style_profile_type NOT NULL DEFAULT 'journalist',
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  max_refs int NOT NULL DEFAULT 10,
  max_total_size_mb int NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_journalist_profile UNIQUE (site_id, user_id, profile_type),
  CONSTRAINT valid_profile_type CHECK (
    (profile_type = 'site_default' AND user_id IS NULL) OR
    (profile_type = 'journalist' AND user_id IS NOT NULL)
  )
);

-- 11. JOURNALIST_STYLE_REFS (Referências de estilo)
CREATE TABLE public.journalist_style_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  style_profile_id uuid NOT NULL REFERENCES public.journalist_style_profiles(id) ON DELETE CASCADE,
  kind style_ref_kind NOT NULL,
  title text NOT NULL,
  url text,
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  mime_type text,
  extracted_text text,
  status style_ref_status NOT NULL DEFAULT 'uploaded',
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 12. JOURNALIST_STYLE_VERSIONS (Versões do guia de estilo)
CREATE TABLE public.journalist_style_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  style_profile_id uuid NOT NULL REFERENCES public.journalist_style_profiles(id) ON DELETE CASCADE,
  version_number int NOT NULL DEFAULT 1,
  style_guide_text text NOT NULL,
  generated_from_refs boolean NOT NULL DEFAULT false,
  generated_at timestamptz,
  created_by uuid,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_site_users_site ON public.site_users(site_id);
CREATE INDEX idx_site_users_user ON public.site_users(user_id);
CREATE INDEX idx_articles_site ON public.articles(site_id);
CREATE INDEX idx_articles_news ON public.articles(news_id);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_article_versions_article ON public.article_versions(article_id);
CREATE INDEX idx_partner_relationships_source ON public.partner_relationships(source_site_id);
CREATE INDEX idx_partner_relationships_target ON public.partner_relationships(target_site_id);
CREATE INDEX idx_import_subscriptions_target ON public.import_subscriptions(target_site_id);
CREATE INDEX idx_distribution_jobs_status ON public.distribution_jobs(status);
CREATE INDEX idx_distribution_jobs_article ON public.distribution_jobs(article_id);
CREATE INDEX idx_imported_articles_target ON public.imported_articles(target_site_id);
CREATE INDEX idx_imported_articles_status ON public.imported_articles(status);
CREATE INDEX idx_pitch_requests_to ON public.pitch_requests(to_site_id);
CREATE INDEX idx_style_profiles_site ON public.journalist_style_profiles(site_id);
CREATE INDEX idx_style_profiles_user ON public.journalist_style_profiles(user_id);
CREATE INDEX idx_style_refs_profile ON public.journalist_style_refs(style_profile_id);
CREATE INDEX idx_style_versions_profile ON public.journalist_style_versions(style_profile_id);
CREATE INDEX idx_style_versions_current ON public.journalist_style_versions(style_profile_id, is_current) WHERE is_current = true;

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Check if user is site admin
CREATE OR REPLACE FUNCTION public.is_site_admin(_user_id uuid, _site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_users
    WHERE user_id = _user_id
      AND site_id = _site_id
      AND role = 'admin'
      AND status = 'active'
  ) OR has_role(_user_id, 'admin')
$$;

-- Check if user belongs to site
CREATE OR REPLACE FUNCTION public.is_site_member(_user_id uuid, _site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_users
    WHERE user_id = _user_id
      AND site_id = _site_id
      AND status = 'active'
  ) OR has_role(_user_id, 'admin')
$$;

-- Check if user is site editor or above
CREATE OR REPLACE FUNCTION public.is_site_editor(_user_id uuid, _site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.site_users
    WHERE user_id = _user_id
      AND site_id = _site_id
      AND role IN ('admin', 'editor')
      AND status = 'active'
  ) OR has_role(_user_id, 'admin')
$$;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- SITE_USERS
ALTER TABLE public.site_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar site_users" ON public.site_users
  FOR ALL USING (is_site_admin(auth.uid(), site_id))
  WITH CHECK (is_site_admin(auth.uid(), site_id));

CREATE POLICY "Membros podem ver site_users do próprio site" ON public.site_users
  FOR SELECT USING (is_site_member(auth.uid(), site_id));

-- ARTICLES
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editores podem gerenciar articles" ON public.articles
  FOR ALL USING (is_site_editor(auth.uid(), site_id))
  WITH CHECK (is_site_editor(auth.uid(), site_id));

CREATE POLICY "Articles publicados são públicos" ON public.articles
  FOR SELECT USING (status = 'published');

-- ARTICLE_VERSIONS
ALTER TABLE public.article_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editores podem gerenciar article_versions" ON public.article_versions
  FOR ALL USING (is_site_editor(auth.uid(), site_id))
  WITH CHECK (is_site_editor(auth.uid(), site_id));

CREATE POLICY "Membros podem ver article_versions" ON public.article_versions
  FOR SELECT USING (is_site_member(auth.uid(), site_id));

-- PARTNER_RELATIONSHIPS
ALTER TABLE public.partner_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar parcerias do próprio site" ON public.partner_relationships
  FOR ALL USING (
    is_site_admin(auth.uid(), source_site_id) OR 
    is_site_admin(auth.uid(), target_site_id)
  )
  WITH CHECK (
    is_site_admin(auth.uid(), source_site_id) OR 
    is_site_admin(auth.uid(), target_site_id)
  );

CREATE POLICY "Membros podem ver parcerias do próprio site" ON public.partner_relationships
  FOR SELECT USING (
    is_site_member(auth.uid(), source_site_id) OR 
    is_site_member(auth.uid(), target_site_id)
  );

-- IMPORT_SUBSCRIPTIONS
ALTER TABLE public.import_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar subscriptions" ON public.import_subscriptions
  FOR ALL USING (is_site_admin(auth.uid(), target_site_id))
  WITH CHECK (is_site_admin(auth.uid(), target_site_id));

CREATE POLICY "Membros podem ver subscriptions" ON public.import_subscriptions
  FOR SELECT USING (is_site_member(auth.uid(), target_site_id));

-- DISTRIBUTION_JOBS
ALTER TABLE public.distribution_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editores podem gerenciar distribution_jobs" ON public.distribution_jobs
  FOR ALL USING (
    is_site_editor(auth.uid(), source_site_id) OR 
    is_site_editor(auth.uid(), target_site_id)
  )
  WITH CHECK (is_site_editor(auth.uid(), source_site_id));

CREATE POLICY "Membros podem ver distribution_jobs" ON public.distribution_jobs
  FOR SELECT USING (
    is_site_member(auth.uid(), source_site_id) OR 
    is_site_member(auth.uid(), target_site_id)
  );

-- IMPORTED_ARTICLES
ALTER TABLE public.imported_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editores podem gerenciar imported_articles" ON public.imported_articles
  FOR ALL USING (is_site_editor(auth.uid(), target_site_id))
  WITH CHECK (is_site_editor(auth.uid(), target_site_id));

CREATE POLICY "Membros podem ver imported_articles" ON public.imported_articles
  FOR SELECT USING (is_site_member(auth.uid(), target_site_id));

-- PITCH_REQUESTS
ALTER TABLE public.pitch_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editores podem gerenciar pitch_requests" ON public.pitch_requests
  FOR ALL USING (
    is_site_editor(auth.uid(), from_site_id) OR 
    is_site_editor(auth.uid(), to_site_id)
  )
  WITH CHECK (is_site_editor(auth.uid(), from_site_id));

CREATE POLICY "Membros podem ver pitch_requests do próprio site" ON public.pitch_requests
  FOR SELECT USING (
    is_site_member(auth.uid(), from_site_id) OR 
    is_site_member(auth.uid(), to_site_id)
  );

-- JOURNALIST_STYLE_PROFILES
ALTER TABLE public.journalist_style_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar site_default profiles" ON public.journalist_style_profiles
  FOR ALL USING (
    profile_type = 'site_default' AND is_site_admin(auth.uid(), site_id)
  )
  WITH CHECK (
    profile_type = 'site_default' AND is_site_admin(auth.uid(), site_id)
  );

CREATE POLICY "Jornalistas podem gerenciar próprio profile" ON public.journalist_style_profiles
  FOR ALL USING (
    profile_type = 'journalist' AND user_id = auth.uid() AND is_site_member(auth.uid(), site_id)
  )
  WITH CHECK (
    profile_type = 'journalist' AND user_id = auth.uid() AND is_site_member(auth.uid(), site_id)
  );

CREATE POLICY "Membros podem ver profiles do site" ON public.journalist_style_profiles
  FOR SELECT USING (is_site_member(auth.uid(), site_id));

-- JOURNALIST_STYLE_REFS
ALTER TABLE public.journalist_style_refs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donos do profile podem gerenciar refs" ON public.journalist_style_refs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.journalist_style_profiles p
      WHERE p.id = style_profile_id
      AND (
        (p.profile_type = 'site_default' AND is_site_admin(auth.uid(), p.site_id)) OR
        (p.profile_type = 'journalist' AND p.user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journalist_style_profiles p
      WHERE p.id = style_profile_id
      AND (
        (p.profile_type = 'site_default' AND is_site_admin(auth.uid(), p.site_id)) OR
        (p.profile_type = 'journalist' AND p.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Membros podem ver refs do site" ON public.journalist_style_refs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journalist_style_profiles p
      WHERE p.id = style_profile_id
      AND is_site_member(auth.uid(), p.site_id)
    )
  );

-- JOURNALIST_STYLE_VERSIONS
ALTER TABLE public.journalist_style_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Donos do profile podem gerenciar versions" ON public.journalist_style_versions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.journalist_style_profiles p
      WHERE p.id = style_profile_id
      AND (
        (p.profile_type = 'site_default' AND is_site_admin(auth.uid(), p.site_id)) OR
        (p.profile_type = 'journalist' AND p.user_id = auth.uid())
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.journalist_style_profiles p
      WHERE p.id = style_profile_id
      AND (
        (p.profile_type = 'site_default' AND is_site_admin(auth.uid(), p.site_id)) OR
        (p.profile_type = 'journalist' AND p.user_id = auth.uid())
      )
    )
  );

CREATE POLICY "Membros podem ver versions do site" ON public.journalist_style_versions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.journalist_style_profiles p
      WHERE p.id = style_profile_id
      AND is_site_member(auth.uid(), p.site_id)
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update updated_at triggers
CREATE TRIGGER update_site_users_updated_at
  BEFORE UPDATE ON public.site_users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partner_relationships_updated_at
  BEFORE UPDATE ON public.partner_relationships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_import_subscriptions_updated_at
  BEFORE UPDATE ON public.import_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_journalist_style_profiles_updated_at
  BEFORE UPDATE ON public.journalist_style_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ONBOARDING: Auto-create site_default style on new site
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_site_default_style()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id uuid;
BEGIN
  -- Create site_default style profile
  INSERT INTO public.journalist_style_profiles (
    site_id, user_id, profile_type, name, is_active
  ) VALUES (
    NEW.id, NULL, 'site_default', 'Estilo Padrão do Site', true
  ) RETURNING id INTO v_profile_id;
  
  -- Create initial style version
  INSERT INTO public.journalist_style_versions (
    style_profile_id, version_number, style_guide_text, is_current
  ) VALUES (
    v_profile_id, 1, 
    'GUIA DE ESTILO PADRÃO

LINGUAGEM:
- Use linguagem clara, direta e objetiva
- Evite jargões e termos técnicos desnecessários
- Prefira voz ativa sobre voz passiva

ESTRUTURA:
- Primeiro parágrafo: responda O QUÊ, QUEM, QUANDO, ONDE
- Parágrafos curtos (2-4 frases)
- Use subtítulos para dividir seções longas

FORMATAÇÃO:
- Aspas para citações diretas
- Números por extenso de zero a dez

EVITAR:
- Adjetivação excessiva
- Opiniões pessoais
- Sensacionalismo',
    true
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_site_created_create_default_style
  AFTER INSERT ON public.sites
  FOR EACH ROW EXECUTE FUNCTION public.create_site_default_style();

-- =====================================================
-- FUNCTION: Ensure only one current version per profile
-- =====================================================
CREATE OR REPLACE FUNCTION public.ensure_single_current_version()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE public.journalist_style_versions
    SET is_current = false
    WHERE style_profile_id = NEW.style_profile_id
      AND id != NEW.id
      AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ensure_single_current_style_version
  BEFORE INSERT OR UPDATE ON public.journalist_style_versions
  FOR EACH ROW
  WHEN (NEW.is_current = true)
  EXECUTE FUNCTION public.ensure_single_current_version();
