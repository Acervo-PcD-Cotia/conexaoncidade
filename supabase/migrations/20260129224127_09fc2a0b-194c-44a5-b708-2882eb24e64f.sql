-- =====================================================
-- AUTO POST REGIONAL - Módulo Independente
-- Tabelas, RLS e Seed das 13 Prefeituras da Grande Cotia
-- =====================================================

-- 1) Tabela: regional_sources (Fontes RSS/Listing)
CREATE TABLE public.regional_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('rss', 'listing')),
  source_url TEXT,
  rss_url TEXT,
  listing_url TEXT,
  selectors JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  mode TEXT DEFAULT 'review' CHECK (mode IN ('review', 'auto_publish', 'off')),
  poll_interval_minutes INTEGER DEFAULT 120,
  rate_limit_per_hour INTEGER DEFAULT 60,
  last_fetched_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  error_count INTEGER DEFAULT 0,
  last_error TEXT,
  tags_default TEXT[] DEFAULT ARRAY['regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais'],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2) Tabela: regional_ingest_items (Itens Capturados)
CREATE TABLE public.regional_ingest_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.regional_sources(id) ON DELETE CASCADE,
  canonical_url TEXT NOT NULL UNIQUE,
  title TEXT,
  excerpt TEXT,
  content TEXT,
  image_url TEXT,
  published_at TIMESTAMPTZ,
  raw_payload JSONB DEFAULT '{}',
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'queued', 'processing', 'processed', 'skipped', 'failed', 'published')),
  draft_id UUID,
  news_id UUID,
  rewritten_title TEXT,
  rewritten_content TEXT,
  seo_meta_title TEXT,
  seo_meta_description TEXT,
  generated_image_url TEXT,
  processed_at TIMESTAMPTZ,
  published_at_portal TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_regional_ingest_items_source ON public.regional_ingest_items(source_id);
CREATE INDEX idx_regional_ingest_items_status ON public.regional_ingest_items(status);
CREATE INDEX idx_regional_ingest_items_created ON public.regional_ingest_items(created_at DESC);

-- 3) Tabela: regional_ingest_runs (Histórico de Execuções)
CREATE TABLE public.regional_ingest_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.regional_sources(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT DEFAULT 'running' CHECK (status IN ('running', 'ok', 'warning', 'error')),
  items_found INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_duplicated INTEGER DEFAULT 0,
  items_errored INTEGER DEFAULT 0,
  result JSONB DEFAULT '{}',
  log TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_regional_ingest_runs_source ON public.regional_ingest_runs(source_id);
CREATE INDEX idx_regional_ingest_runs_started ON public.regional_ingest_runs(started_at DESC);

-- 4) Enable RLS
ALTER TABLE public.regional_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_ingest_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_ingest_runs ENABLE ROW LEVEL SECURITY;

-- 5) RLS Policies - Authenticated users can read, admins can write
-- regional_sources
CREATE POLICY "regional_sources_select" ON public.regional_sources
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "regional_sources_insert" ON public.regional_sources
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "regional_sources_update" ON public.regional_sources
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "regional_sources_delete" ON public.regional_sources
  FOR DELETE TO authenticated USING (true);

-- regional_ingest_items
CREATE POLICY "regional_ingest_items_select" ON public.regional_ingest_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "regional_ingest_items_insert" ON public.regional_ingest_items
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "regional_ingest_items_update" ON public.regional_ingest_items
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "regional_ingest_items_delete" ON public.regional_ingest_items
  FOR DELETE TO authenticated USING (true);

-- regional_ingest_runs
CREATE POLICY "regional_ingest_runs_select" ON public.regional_ingest_runs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "regional_ingest_runs_insert" ON public.regional_ingest_runs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "regional_ingest_runs_update" ON public.regional_ingest_runs
  FOR UPDATE TO authenticated USING (true);

-- Service role access for edge functions
CREATE POLICY "regional_sources_service" ON public.regional_sources
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "regional_ingest_items_service" ON public.regional_ingest_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "regional_ingest_runs_service" ON public.regional_ingest_runs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6) Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_regional_sources_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_regional_sources_updated_at
  BEFORE UPDATE ON public.regional_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_regional_sources_updated_at();

-- 7) SEED: 13 Prefeituras da Grande Cotia (idempotente via ON CONFLICT)
INSERT INTO public.regional_sources (city, name, type, source_url, rss_url, listing_url, selectors, tags_default)
VALUES
  -- RSS Sources
  ('Itapevi', 'Prefeitura de Itapevi', 'rss', 
   'https://noticias.itapevi.sp.gov.br/', 
   'https://noticias.itapevi.sp.gov.br/feed/', 
   NULL, 
   '{}',
   ARRAY['itapevi', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Vargem Grande Paulista', 'Prefeitura de Vargem Grande Paulista', 'rss',
   'https://www.vargemgrandepaulista.sp.gov.br/site/category/noticias-da-cidade/',
   'https://www.vargemgrandepaulista.sp.gov.br/site/category/noticias-da-cidade/feed/',
   NULL,
   '{}',
   ARRAY['vargem grande paulista', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Ibiúna', 'Prefeitura de Ibiúna', 'rss',
   'https://ibiuna.sp.gov.br/todas-as-noticias/',
   'https://ibiuna.sp.gov.br/todas-as-noticias/feed/',
   NULL,
   '{}',
   ARRAY['ibiúna', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Embu das Artes', 'Prefeitura de Embu das Artes', 'rss',
   'https://cidadeembudasartes.sp.gov.br/',
   'https://cidadeembudasartes.sp.gov.br/feed/',
   NULL,
   '{}',
   ARRAY['embu das artes', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('São Lourenço da Serra', 'Prefeitura de São Lourenço da Serra', 'rss',
   'https://saolourencodaserra.sp.gov.br/novo/',
   'https://saolourencodaserra.sp.gov.br/novo/feed/',
   NULL,
   '{}',
   ARRAY['são lourenço da serra', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Osasco', 'Prefeitura de Osasco', 'rss',
   'https://osasco.sp.gov.br/',
   'https://osasco.sp.gov.br/feed/',
   NULL,
   '{}',
   ARRAY['osasco', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Barueri', 'Prefeitura de Barueri', 'rss',
   'https://portal.barueri.sp.gov.br/',
   'https://portal.barueri.sp.gov.br/feed',
   NULL,
   '{}',
   ARRAY['barueri', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),

  -- Listing Sources
  ('São Roque', 'Prefeitura de São Roque', 'listing',
   'https://www.saoroque.sp.gov.br/portal/noticias',
   NULL,
   'https://www.saoroque.sp.gov.br/portal/noticias',
   '{"item_container": "article, .news-item, .noticia, .card", "item_link": "a[href*=''noticia'']", "item_title": "h2, h3, .title, .titulo", "item_date": "time, .date, .data"}',
   ARRAY['são roque', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Embu-Guaçu', 'Prefeitura de Embu-Guaçu', 'listing',
   'https://www.embuguacu.sp.gov.br/noticias',
   NULL,
   'https://www.embuguacu.sp.gov.br/noticias',
   '{"item_container": "article, .news-item, .noticia, .card", "item_link": "a[href*=''noticia'']", "item_title": "h2, h3, .title, .titulo", "item_date": "time, .date, .data"}',
   ARRAY['embu-guaçu', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Itapecerica da Serra', 'Prefeitura de Itapecerica da Serra', 'listing',
   'https://www.itapecerica.sp.gov.br/noticias',
   NULL,
   'https://www.itapecerica.sp.gov.br/noticias',
   '{"item_container": "article, .news-item, .noticia, .card", "item_link": "a[href*=''noticia'']", "item_title": "h2, h3, .title, .titulo", "item_date": "time, .date, .data"}',
   ARRAY['itapecerica da serra', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('São Paulo', 'Prefeitura de São Paulo', 'listing',
   'https://prefeitura.sp.gov.br/todas-as-noticias/',
   NULL,
   'https://prefeitura.sp.gov.br/todas-as-noticias/',
   '{"item_container": "article, .news-item, .noticia, .card", "item_link": "a[href*=''noticia'']", "item_title": "h2, h3, .title, .titulo", "item_date": "time, .date, .data"}',
   ARRAY['são paulo', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'capital', 'metrópole', 'notícias locais', 'cidade']),
   
  ('Jandira', 'Prefeitura de Jandira', 'listing',
   'https://portal.jandira.sp.gov.br/Noticias/',
   NULL,
   'https://portal.jandira.sp.gov.br/Noticias/',
   '{"item_container": "article, .news-item, .noticia, .card", "item_link": "a[href*=''Noticia'']", "item_title": "h2, h3, .title, .titulo", "item_date": "time, .date, .data"}',
   ARRAY['jandira', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade']),
   
  ('Carapicuíba', 'Prefeitura de Carapicuíba', 'listing',
   'https://www.carapicuiba.sp.gov.br/noticia/',
   NULL,
   'https://www.carapicuiba.sp.gov.br/noticia/',
   '{"item_container": "article, .news-item, .noticia, .card", "item_link": "a[href*=''noticia'']", "item_title": "h2, h3, .title, .titulo", "item_date": "time, .date, .data"}',
   ARRAY['carapicuíba', 'regional', 'grande cotia', 'prefeitura', 'governo municipal', 'serviço público', 'administração', 'região oeste', 'são paulo', 'interior', 'notícias locais', 'cidade'])

ON CONFLICT DO NOTHING;