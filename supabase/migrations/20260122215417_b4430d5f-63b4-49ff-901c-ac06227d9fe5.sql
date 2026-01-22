-- =============================================
-- FASE 1: Parceiros & Sindicação - Tabelas
-- =============================================

-- Fontes de sindicação externa (feeds RSS de parceiros)
CREATE TABLE IF NOT EXISTS public.syndication_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  feed_url TEXT NOT NULL,
  feed_type TEXT DEFAULT 'rss' CHECK (feed_type IN ('rss', 'atom', 'json')),
  is_active BOOLEAN DEFAULT true,
  auto_import BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT true,
  category_mapping JSONB DEFAULT '{}',
  default_category_id UUID REFERENCES public.categories(id),
  last_fetched_at TIMESTAMPTZ,
  last_item_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, feed_url)
);

-- Inbox de artigos importados via RSS
CREATE TABLE IF NOT EXISTS public.syndication_inbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.syndication_sources(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_html TEXT,
  featured_image_url TEXT,
  author_name TEXT,
  original_url TEXT NOT NULL,
  pub_date TIMESTAMPTZ,
  status TEXT DEFAULT 'inbox' CHECK (status IN ('inbox', 'approved', 'rejected', 'published')),
  target_news_id UUID REFERENCES public.news(id),
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(source_id, external_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_syndication_sources_tenant ON public.syndication_sources(tenant_id);
CREATE INDEX IF NOT EXISTS idx_syndication_sources_active ON public.syndication_sources(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_syndication_inbox_status ON public.syndication_inbox(status);
CREATE INDEX IF NOT EXISTS idx_syndication_inbox_source ON public.syndication_inbox(source_id);

-- RLS para syndication_sources
ALTER TABLE public.syndication_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage syndication sources"
ON public.syndication_sources
FOR ALL
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- RLS para syndication_inbox
ALTER TABLE public.syndication_inbox ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage syndication inbox"
ON public.syndication_inbox
FOR ALL
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- FASE 2: Storage bucket para Branding
-- =============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('studio-branding', 'studio-branding', true)
ON CONFLICT (id) DO NOTHING;

-- RLS para bucket (usando DROP IF EXISTS para evitar conflitos)
DROP POLICY IF EXISTS "Authenticated users can upload branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete branding assets" ON storage.objects;
DROP POLICY IF EXISTS "Public can view branding assets" ON storage.objects;

CREATE POLICY "Authenticated users can upload branding assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'studio-branding');

CREATE POLICY "Authenticated users can update branding assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'studio-branding');

CREATE POLICY "Authenticated users can delete branding assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'studio-branding');

CREATE POLICY "Public can view branding assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'studio-branding');

-- =============================================
-- FASE 3: Expandir podcast_feeds para metadados
-- =============================================

-- Adicionar colunas de metadados iTunes se não existirem
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_feeds' AND column_name = 'itunes_category') THEN
    ALTER TABLE public.podcast_feeds ADD COLUMN itunes_category TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_feeds' AND column_name = 'itunes_subcategory') THEN
    ALTER TABLE public.podcast_feeds ADD COLUMN itunes_subcategory TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_feeds' AND column_name = 'itunes_explicit') THEN
    ALTER TABLE public.podcast_feeds ADD COLUMN itunes_explicit BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_feeds' AND column_name = 'owner_name') THEN
    ALTER TABLE public.podcast_feeds ADD COLUMN owner_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_feeds' AND column_name = 'owner_email') THEN
    ALTER TABLE public.podcast_feeds ADD COLUMN owner_email TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_feeds' AND column_name = 'language') THEN
    ALTER TABLE public.podcast_feeds ADD COLUMN language TEXT DEFAULT 'pt-BR';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'podcast_feeds' AND column_name = 'copyright') THEN
    ALTER TABLE public.podcast_feeds ADD COLUMN copyright TEXT;
  END IF;
END $$;

-- =============================================
-- FASE 4: Tabela para episódios manuais de podcast
-- =============================================

CREATE TABLE IF NOT EXISTS public.podcast_manual_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_id UUID NOT NULL REFERENCES public.podcast_feeds(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  published_at TIMESTAMPTZ DEFAULT now(),
  is_published BOOLEAN DEFAULT true,
  episode_number INTEGER,
  season_number INTEGER,
  episode_type TEXT DEFAULT 'full' CHECK (episode_type IN ('full', 'trailer', 'bonus')),
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_podcast_manual_episodes_feed ON public.podcast_manual_episodes(feed_id);
CREATE INDEX IF NOT EXISTS idx_podcast_manual_episodes_published ON public.podcast_manual_episodes(is_published, published_at DESC);

-- RLS
ALTER TABLE public.podcast_manual_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage podcast episodes"
ON public.podcast_manual_episodes
FOR ALL
USING (public.is_admin_or_editor(auth.uid()))
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Public can view published episodes"
ON public.podcast_manual_episodes
FOR SELECT
TO public
USING (is_published = true);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_syndication_sources_updated_at ON public.syndication_sources;
CREATE TRIGGER update_syndication_sources_updated_at
  BEFORE UPDATE ON public.syndication_sources
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_podcast_manual_episodes_updated_at ON public.podcast_manual_episodes;
CREATE TRIGGER update_podcast_manual_episodes_updated_at
  BEFORE UPDATE ON public.podcast_manual_episodes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();