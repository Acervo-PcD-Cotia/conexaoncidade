
-- =============================================
-- CORE ENGINE: Redirects Module
-- =============================================

CREATE TABLE public.core_redirects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_path TEXT NOT NULL,
  target_path TEXT NOT NULL,
  redirect_type SMALLINT NOT NULL DEFAULT 301,
  hits INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  tenant_id TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_core_redirects_source ON public.core_redirects (source_path) WHERE is_active = true;

ALTER TABLE public.core_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage redirects" ON public.core_redirects
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Public can read active redirects" ON public.core_redirects
  FOR SELECT USING (is_active = true);

-- 404 error log
CREATE TABLE public.core_404_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  hit_count INTEGER NOT NULL DEFAULT 1,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved BOOLEAN NOT NULL DEFAULT false,
  redirect_id UUID REFERENCES public.core_redirects(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX idx_core_404_path ON public.core_404_log (path) WHERE resolved = false;

ALTER TABLE public.core_404_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage 404 logs" ON public.core_404_log
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Anyone can insert 404 logs" ON public.core_404_log
  FOR INSERT WITH CHECK (true);

-- =============================================
-- CORE ENGINE: Analytics Pageviews
-- =============================================

CREATE TABLE public.core_analytics_pageviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  session_id TEXT,
  user_agent TEXT,
  referrer TEXT,
  device_type TEXT DEFAULT 'desktop',
  country TEXT,
  city TEXT,
  duration_ms INTEGER DEFAULT 0,
  news_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_pv_created ON public.core_analytics_pageviews (created_at DESC);
CREATE INDEX idx_analytics_pv_path ON public.core_analytics_pageviews (page_path);

ALTER TABLE public.core_analytics_pageviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert pageviews" ON public.core_analytics_pageviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read pageviews" ON public.core_analytics_pageviews
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- CORE ENGINE: SEO Scores
-- =============================================

CREATE TABLE public.core_seo_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL UNIQUE,
  seo_score INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  keyword TEXT,
  issues JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  last_analyzed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.core_seo_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editors can manage SEO scores" ON public.core_seo_scores
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- SEO settings
CREATE TABLE public.core_seo_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.core_seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SEO settings" ON public.core_seo_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Timestamp triggers
CREATE TRIGGER update_core_redirects_updated_at BEFORE UPDATE ON public.core_redirects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_core_seo_scores_updated_at BEFORE UPDATE ON public.core_seo_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
