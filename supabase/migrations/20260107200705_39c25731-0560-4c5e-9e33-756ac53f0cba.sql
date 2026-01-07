-- =============================================
-- ENUMS
-- =============================================

-- Status de notícias
CREATE TYPE public.news_status AS ENUM ('draft', 'scheduled', 'published', 'archived', 'trash');

-- Tipos de destaque
CREATE TYPE public.highlight_type AS ENUM ('none', 'home', 'urgent', 'featured');

-- Papéis de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'editor', 'columnist', 'moderator');

-- Status de web stories
CREATE TYPE public.story_status AS ENUM ('draft', 'published', 'archived');

-- =============================================
-- TABLES
-- =============================================

-- Perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Papéis de usuário (separado por segurança)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#6B7280',
  icon TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tags
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notícias
CREATE TABLE public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  hat TEXT,
  content TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  og_image_url TEXT,
  card_image_url TEXT,
  image_alt TEXT,
  image_credit TEXT,
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT[],
  status public.news_status NOT NULL DEFAULT 'draft',
  highlight public.highlight_type NOT NULL DEFAULT 'none',
  view_count INTEGER NOT NULL DEFAULT 0,
  share_count INTEGER NOT NULL DEFAULT 0,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Relação N:N entre notícias e tags
CREATE TABLE public.news_tags (
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (news_id, tag_id)
);

-- Super Banners
CREATE TABLE public.super_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_target TEXT DEFAULT '_blank',
  title TEXT,
  alt_text TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Web Stories
CREATE TABLE public.web_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  status public.story_status NOT NULL DEFAULT 'draft',
  cover_image_url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Slides de Web Stories
CREATE TABLE public.web_story_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID NOT NULL REFERENCES public.web_stories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  background_image_url TEXT,
  background_color TEXT DEFAULT '#000000',
  content_html TEXT,
  cta_text TEXT,
  cta_url TEXT,
  animation_type TEXT DEFAULT 'fade',
  duration_seconds INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_news_status ON public.news(status);
CREATE INDEX idx_news_category ON public.news(category_id);
CREATE INDEX idx_news_author ON public.news(author_id);
CREATE INDEX idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX idx_news_slug ON public.news(slug);
CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_web_stories_slug ON public.web_stories(slug);
CREATE INDEX idx_web_story_slides_story ON public.web_story_slides(story_id);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Função para verificar papel do usuário (SECURITY DEFINER para evitar recursão RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Função para verificar se usuário é admin ou editor
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'editor')
  )
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  RETURN NEW;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_super_banners_updated_at
  BEFORE UPDATE ON public.super_banners
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_web_stories_updated_at
  BEFORE UPDATE ON public.web_stories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil em novos usuários
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.web_story_slides ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Perfis são visíveis publicamente"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Usuários podem editar próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- USER_ROLES POLICIES
CREATE POLICY "Apenas admins podem ver roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Apenas admins podem gerenciar roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CATEGORIES POLICIES
CREATE POLICY "Categorias ativas são públicas"
  ON public.categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem gerenciar categorias"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- TAGS POLICIES
CREATE POLICY "Tags são públicas"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Editores podem gerenciar tags"
  ON public.tags FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- NEWS POLICIES
CREATE POLICY "Notícias publicadas são públicas"
  ON public.news FOR SELECT
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Editores podem ver todas notícias"
  ON public.news FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Editores podem criar notícias"
  ON public.news FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Editores podem atualizar notícias"
  ON public.news FOR UPDATE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins podem deletar notícias"
  ON public.news FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- NEWS_TAGS POLICIES
CREATE POLICY "News tags são públicas para leitura"
  ON public.news_tags FOR SELECT
  USING (true);

CREATE POLICY "Editores podem gerenciar news tags"
  ON public.news_tags FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- SUPER_BANNERS POLICIES
CREATE POLICY "Banners ativos são públicos"
  ON public.super_banners FOR SELECT
  USING (is_active = true AND (starts_at IS NULL OR starts_at <= now()) AND (ends_at IS NULL OR ends_at >= now()));

CREATE POLICY "Admins podem gerenciar banners"
  ON public.super_banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- WEB_STORIES POLICIES
CREATE POLICY "Stories publicadas são públicas"
  ON public.web_stories FOR SELECT
  USING (status = 'published');

CREATE POLICY "Editores podem ver todas stories"
  ON public.web_stories FOR SELECT
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Editores podem gerenciar stories"
  ON public.web_stories FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- WEB_STORY_SLIDES POLICIES
CREATE POLICY "Slides de stories publicadas são públicos"
  ON public.web_story_slides FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.web_stories
      WHERE id = story_id AND status = 'published'
    )
  );

CREATE POLICY "Editores podem gerenciar slides"
  ON public.web_story_slides FOR ALL
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()))
  WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- SEED DATA: CATEGORIES
-- =============================================

INSERT INTO public.categories (name, slug, color, icon, sort_order) VALUES
  ('Política', 'politica', '#3B82F6', 'landmark', 1),
  ('Esportes', 'esportes', '#22C55E', 'trophy', 2),
  ('Cultura', 'cultura', '#A855F7', 'palette', 3),
  ('Economia', 'economia', '#EAB308', 'trending-up', 4),
  ('Polícia', 'policia', '#EF4444', 'shield-alert', 5),
  ('Saúde', 'saude', '#06B6D4', 'heart-pulse', 6),
  ('Educação', 'educacao', '#F97316', 'graduation-cap', 7),
  ('Tecnologia', 'tecnologia', '#6366F1', 'cpu', 8);