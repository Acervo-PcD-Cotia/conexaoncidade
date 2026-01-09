-- =====================================================
-- AUTO POST PRO - Complete Database Schema
-- =====================================================

-- Enable extensions needed
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- =====================================================
-- 1. ENUMS
-- =====================================================

CREATE TYPE autopost_source_type AS ENUM ('rss', 'sitemap', 'html_crawler', 'api', 'manual_url');
CREATE TYPE autopost_source_status AS ENUM ('active', 'paused', 'error');
CREATE TYPE autopost_import_mode AS ENUM ('auto_publish', 'queue_review', 'capture_only');
CREATE TYPE autopost_job_status AS ENUM ('running', 'success', 'failed', 'partial');
CREATE TYPE autopost_item_status AS ENUM ('captured', 'processed', 'queued', 'approved', 'scheduled', 'published', 'rejected', 'duplicate');
CREATE TYPE autopost_publish_status AS ENUM ('draft', 'ready', 'scheduled', 'published', 'rejected');

-- =====================================================
-- 2. TABLES
-- =====================================================

-- 2.1 Source Groups (Grupos/Regiões)
CREATE TABLE public.autopost_source_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.autopost_source_groups(id) ON DELETE SET NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.2 Sources (Fontes/Parceiros)
CREATE TABLE public.autopost_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  source_type autopost_source_type DEFAULT 'rss',
  feed_url TEXT,
  crawler_entry_url TEXT,
  crawler_selectors JSONB DEFAULT '{}',
  status autopost_source_status DEFAULT 'paused',
  group_id UUID REFERENCES public.autopost_source_groups(id) ON DELETE SET NULL,
  region TEXT DEFAULT 'São Paulo',
  default_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  default_tags TEXT[] DEFAULT '{}',
  default_author TEXT,
  credit_template TEXT DEFAULT 'Fonte: {name} ({site_url})',
  require_credit BOOLEAN DEFAULT true,
  require_review BOOLEAN DEFAULT true,
  import_mode autopost_import_mode DEFAULT 'queue_review',
  schedule_frequency_minutes INTEGER DEFAULT 60,
  allowed_hours_start INTEGER DEFAULT 6,
  allowed_hours_end INTEGER DEFAULT 23,
  daily_limit INTEGER DEFAULT 30,
  per_run_limit INTEGER DEFAULT 5,
  language TEXT DEFAULT 'pt-BR',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  health_score INTEGER DEFAULT 100,
  error_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  total_items_captured INTEGER DEFAULT 0,
  total_items_published INTEGER DEFAULT 0,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.3 Rules (Regras de Roteamento)
CREATE TABLE public.autopost_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 100,
  match_source_ids UUID[] DEFAULT '{}',
  match_group_ids UUID[] DEFAULT '{}',
  match_keywords TEXT[] DEFAULT '{}',
  match_exclude_keywords TEXT[] DEFAULT '{}',
  match_regex TEXT,
  match_category_hint TEXT,
  action_set_category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  action_add_tags TEXT[] DEFAULT '{}',
  action_set_author TEXT,
  action_require_review BOOLEAN,
  action_block_publish BOOLEAN DEFAULT false,
  action_rewrite_enabled BOOLEAN DEFAULT true,
  action_generate_seo BOOLEAN DEFAULT true,
  action_internal_links BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.4 Ingest Jobs (Execuções de Captura)
CREATE TABLE public.autopost_ingest_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.autopost_sources(id) ON DELETE CASCADE NOT NULL,
  status autopost_job_status DEFAULT 'running',
  trigger_type TEXT DEFAULT 'scheduled',
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ,
  items_found INTEGER DEFAULT 0,
  items_new INTEGER DEFAULT 0,
  items_duplicated INTEGER DEFAULT 0,
  items_processed INTEGER DEFAULT 0,
  items_errored INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.5 Ingest Items (Itens Capturados)
CREATE TABLE public.autopost_ingest_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES public.autopost_sources(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.autopost_ingest_jobs(id) ON DELETE SET NULL,
  original_url TEXT NOT NULL,
  canonical_url TEXT,
  original_title TEXT NOT NULL,
  original_excerpt TEXT,
  original_content TEXT,
  original_content_clean TEXT,
  original_published_at TIMESTAMPTZ,
  original_author TEXT,
  original_image_url TEXT,
  original_images TEXT[] DEFAULT '{}',
  content_hash TEXT NOT NULL,
  title_fingerprint TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  similarity_score REAL,
  similarity_group TEXT,
  status autopost_item_status DEFAULT 'captured',
  duplicate_of UUID REFERENCES public.autopost_ingest_items(id) ON DELETE SET NULL,
  duplicate_reason TEXT,
  applied_rule_ids UUID[] DEFAULT '{}',
  processing_notes TEXT,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.6 Rewritten Posts (Versão Final)
CREATE TABLE public.autopost_rewritten_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingest_item_id UUID REFERENCES public.autopost_ingest_items(id) ON DELETE CASCADE NOT NULL,
  final_title TEXT NOT NULL,
  slug TEXT NOT NULL,
  summary TEXT NOT NULL,
  content_html TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  author_name TEXT,
  source_credit TEXT NOT NULL,
  source_url TEXT,
  hero_image_url TEXT,
  og_image_url TEXT,
  card_image_url TEXT,
  gallery_urls TEXT[] DEFAULT '{}',
  alt_text TEXT,
  image_credit TEXT,
  seo_meta_title TEXT NOT NULL,
  seo_meta_description TEXT NOT NULL,
  internal_links_added INTEGER DEFAULT 0,
  publish_status autopost_publish_status DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_news_id UUID REFERENCES public.news(id) ON DELETE SET NULL,
  quality_score INTEGER DEFAULT 0,
  seo_score INTEGER DEFAULT 0,
  readability_score INTEGER DEFAULT 0,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_by UUID,
  rejected_at TIMESTAMPTZ,
  rejection_reason TEXT,
  revision_count INTEGER DEFAULT 0,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2.7 Media Assets (Imagens)
CREATE TABLE public.autopost_media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ingest_item_id UUID REFERENCES public.autopost_ingest_items(id) ON DELETE CASCADE,
  rewritten_post_id UUID REFERENCES public.autopost_rewritten_posts(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  local_path TEXT,
  local_url TEXT,
  file_name TEXT,
  mime_type TEXT,
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  aspect_ratio TEXT,
  is_valid BOOLEAN DEFAULT true,
  is_hero BOOLEAN DEFAULT false,
  validation_error TEXT,
  credit TEXT,
  alt_text TEXT,
  processing_status TEXT DEFAULT 'pending',
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.8 Settings (Configurações Globais)
CREATE TABLE public.autopost_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key, tenant_id)
);

-- 2.9 Audit Logs (Logs Específicos)
CREATE TABLE public.autopost_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  action_category TEXT,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  entity_name TEXT,
  old_data JSONB,
  new_data JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2.10 Scheduled Publishes (Agendamentos)
CREATE TABLE public.autopost_scheduled_publishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rewritten_post_id UUID REFERENCES public.autopost_rewritten_posts(id) ON DELETE CASCADE NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  executed_at TIMESTAMPTZ,
  error_message TEXT,
  created_by UUID,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 3. INDEXES
-- =====================================================

-- Sources
CREATE INDEX idx_autopost_sources_status ON public.autopost_sources(status);
CREATE INDEX idx_autopost_sources_group ON public.autopost_sources(group_id);
CREATE INDEX idx_autopost_sources_tenant ON public.autopost_sources(tenant_id);
CREATE INDEX idx_autopost_sources_next_run ON public.autopost_sources(next_run_at) WHERE status = 'active';

-- Ingest Items
CREATE UNIQUE INDEX idx_autopost_items_url ON public.autopost_ingest_items(original_url);
CREATE INDEX idx_autopost_items_hash ON public.autopost_ingest_items(content_hash);
CREATE INDEX idx_autopost_items_fingerprint ON public.autopost_ingest_items USING gin(title_fingerprint gin_trgm_ops);
CREATE INDEX idx_autopost_items_status ON public.autopost_ingest_items(status);
CREATE INDEX idx_autopost_items_source ON public.autopost_ingest_items(source_id);
CREATE INDEX idx_autopost_items_tenant ON public.autopost_ingest_items(tenant_id);
CREATE INDEX idx_autopost_items_created ON public.autopost_ingest_items(created_at DESC);

-- Rewritten Posts
CREATE INDEX idx_autopost_posts_status ON public.autopost_rewritten_posts(publish_status);
CREATE INDEX idx_autopost_posts_scheduled ON public.autopost_rewritten_posts(scheduled_at) WHERE publish_status = 'scheduled';
CREATE INDEX idx_autopost_posts_tenant ON public.autopost_rewritten_posts(tenant_id);

-- Jobs
CREATE INDEX idx_autopost_jobs_source ON public.autopost_ingest_jobs(source_id);
CREATE INDEX idx_autopost_jobs_status ON public.autopost_ingest_jobs(status);
CREATE INDEX idx_autopost_jobs_tenant ON public.autopost_ingest_jobs(tenant_id);

-- Rules
CREATE INDEX idx_autopost_rules_priority ON public.autopost_rules(priority) WHERE enabled = true;
CREATE INDEX idx_autopost_rules_tenant ON public.autopost_rules(tenant_id);

-- Audit Logs
CREATE INDEX idx_autopost_logs_entity ON public.autopost_audit_logs(entity_type, entity_id);
CREATE INDEX idx_autopost_logs_action ON public.autopost_audit_logs(action);
CREATE INDEX idx_autopost_logs_date ON public.autopost_audit_logs(created_at DESC);
CREATE INDEX idx_autopost_logs_tenant ON public.autopost_audit_logs(tenant_id);

-- Media Assets
CREATE INDEX idx_autopost_media_item ON public.autopost_media_assets(ingest_item_id);
CREATE INDEX idx_autopost_media_post ON public.autopost_media_assets(rewritten_post_id);

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- 4.1 Normalize title for fingerprint
CREATE OR REPLACE FUNCTION public.normalize_title_fingerprint(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      unaccent(coalesce(title, '')),
      '[^a-z0-9]', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4.2 Generate content hash
CREATE OR REPLACE FUNCTION public.generate_content_hash(content TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(sha256(convert_to(coalesce(content, ''), 'UTF8')), 'hex');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4.3 Check for duplicates
CREATE OR REPLACE FUNCTION public.check_autopost_duplicate(
  p_tenant_id UUID,
  p_original_url TEXT,
  p_content_hash TEXT,
  p_title_fingerprint TEXT,
  p_window_days INTEGER DEFAULT 7
)
RETURNS TABLE(
  is_duplicate BOOLEAN,
  existing_id UUID,
  match_type TEXT,
  similarity_score REAL
) AS $$
DECLARE
  v_threshold REAL := 0.85;
BEGIN
  -- Check exact URL match
  RETURN QUERY
  SELECT true, ai.id, 'url'::TEXT, 1.0::REAL
  FROM public.autopost_ingest_items ai
  WHERE ai.tenant_id = p_tenant_id
    AND ai.original_url = p_original_url
  LIMIT 1;
  
  IF FOUND THEN RETURN; END IF;
  
  -- Check content hash match within window
  RETURN QUERY
  SELECT true, ai.id, 'content_hash'::TEXT, 1.0::REAL
  FROM public.autopost_ingest_items ai
  WHERE ai.tenant_id = p_tenant_id
    AND ai.content_hash = p_content_hash
    AND ai.created_at > now() - (p_window_days || ' days')::INTERVAL
  LIMIT 1;
  
  IF FOUND THEN RETURN; END IF;
  
  -- Check title similarity
  RETURN QUERY
  SELECT true, ai.id, 'title_similarity'::TEXT, similarity(ai.title_fingerprint, p_title_fingerprint)
  FROM public.autopost_ingest_items ai
  WHERE ai.tenant_id = p_tenant_id
    AND similarity(ai.title_fingerprint, p_title_fingerprint) > v_threshold
    AND ai.created_at > now() - (p_window_days || ' days')::INTERVAL
  ORDER BY similarity(ai.title_fingerprint, p_title_fingerprint) DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, 0.0::REAL;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.4 Update source health score
CREATE OR REPLACE FUNCTION public.update_autopost_source_health(p_source_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_recent_jobs INTEGER;
  v_successful_jobs INTEGER;
  v_health_score INTEGER;
BEGIN
  SELECT COUNT(*), COUNT(*) FILTER (WHERE status = 'success')
  INTO v_recent_jobs, v_successful_jobs
  FROM public.autopost_ingest_jobs
  WHERE source_id = p_source_id
    AND created_at > now() - INTERVAL '7 days';
  
  IF v_recent_jobs = 0 THEN
    v_health_score := 100;
  ELSE
    v_health_score := (v_successful_jobs::REAL / v_recent_jobs::REAL * 100)::INTEGER;
  END IF;
  
  UPDATE public.autopost_sources
  SET health_score = v_health_score,
      updated_at = now()
  WHERE id = p_source_id;
  
  RETURN v_health_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4.5 Calculate next run time
CREATE OR REPLACE FUNCTION public.calculate_next_run_time(
  p_frequency_minutes INTEGER,
  p_hours_start INTEGER,
  p_hours_end INTEGER
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
  v_hour INTEGER;
BEGIN
  v_next_run := now() + (p_frequency_minutes || ' minutes')::INTERVAL;
  v_hour := EXTRACT(HOUR FROM v_next_run);
  
  -- If outside allowed hours, move to next allowed window
  IF v_hour < p_hours_start THEN
    v_next_run := date_trunc('day', v_next_run) + (p_hours_start || ' hours')::INTERVAL;
  ELSIF v_hour >= p_hours_end THEN
    v_next_run := date_trunc('day', v_next_run) + INTERVAL '1 day' + (p_hours_start || ' hours')::INTERVAL;
  END IF;
  
  RETURN v_next_run;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 4.6 Get autopost stats
CREATE OR REPLACE FUNCTION public.get_autopost_stats(p_tenant_id UUID, p_days INTEGER DEFAULT 7)
RETURNS TABLE(
  captured_today BIGINT,
  published_today BIGINT,
  in_queue BIGINT,
  duplicates_blocked BIGINT,
  sources_with_errors BIGINT,
  avg_processing_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.autopost_ingest_items WHERE tenant_id = p_tenant_id AND created_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM public.autopost_rewritten_posts WHERE tenant_id = p_tenant_id AND published_at >= CURRENT_DATE),
    (SELECT COUNT(*) FROM public.autopost_ingest_items WHERE tenant_id = p_tenant_id AND status IN ('queued', 'processed', 'approved')),
    (SELECT COUNT(*) FROM public.autopost_ingest_items WHERE tenant_id = p_tenant_id AND status = 'duplicate' AND created_at > now() - (p_days || ' days')::INTERVAL),
    (SELECT COUNT(*) FROM public.autopost_sources WHERE tenant_id = p_tenant_id AND status = 'error'),
    (SELECT AVG(ended_at - started_at) FROM public.autopost_ingest_jobs WHERE tenant_id = p_tenant_id AND status = 'success' AND created_at > now() - (p_days || ' days')::INTERVAL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. TRIGGERS
-- =====================================================

-- 5.1 Auto-generate fingerprint and hash on insert
CREATE OR REPLACE FUNCTION public.autopost_item_before_insert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.title_fingerprint IS NULL OR NEW.title_fingerprint = '' THEN
    NEW.title_fingerprint := public.normalize_title_fingerprint(NEW.original_title);
  END IF;
  
  IF NEW.content_hash IS NULL OR NEW.content_hash = '' THEN
    NEW.content_hash := public.generate_content_hash(COALESCE(NEW.original_content_clean, NEW.original_content, NEW.original_title));
  END IF;
  
  IF NEW.word_count IS NULL OR NEW.word_count = 0 THEN
    NEW.word_count := array_length(regexp_split_to_array(COALESCE(NEW.original_content_clean, ''), '\s+'), 1);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_autopost_item_before_insert
  BEFORE INSERT ON public.autopost_ingest_items
  FOR EACH ROW EXECUTE FUNCTION public.autopost_item_before_insert();

-- 5.2 Update source stats after job completes
CREATE OR REPLACE FUNCTION public.autopost_job_after_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('success', 'failed', 'partial') AND OLD.status = 'running' THEN
    UPDATE public.autopost_sources
    SET 
      last_run_at = NEW.ended_at,
      next_run_at = public.calculate_next_run_time(
        schedule_frequency_minutes,
        allowed_hours_start,
        allowed_hours_end
      ),
      error_count = CASE WHEN NEW.status = 'failed' THEN error_count + 1 ELSE error_count END,
      success_count = CASE WHEN NEW.status = 'success' THEN success_count + 1 ELSE success_count END,
      total_items_captured = total_items_captured + NEW.items_new,
      status = CASE 
        WHEN NEW.status = 'failed' AND error_count >= 3 THEN 'error'::autopost_source_status
        ELSE status 
      END,
      updated_at = now()
    WHERE id = NEW.source_id;
    
    PERFORM public.update_autopost_source_health(NEW.source_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_autopost_job_after_update
  AFTER UPDATE ON public.autopost_ingest_jobs
  FOR EACH ROW EXECUTE FUNCTION public.autopost_job_after_update();

-- 5.3 Update timestamps
CREATE OR REPLACE FUNCTION public.autopost_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_autopost_sources_updated
  BEFORE UPDATE ON public.autopost_sources
  FOR EACH ROW EXECUTE FUNCTION public.autopost_update_timestamp();

CREATE TRIGGER trg_autopost_items_updated
  BEFORE UPDATE ON public.autopost_ingest_items
  FOR EACH ROW EXECUTE FUNCTION public.autopost_update_timestamp();

CREATE TRIGGER trg_autopost_posts_updated
  BEFORE UPDATE ON public.autopost_rewritten_posts
  FOR EACH ROW EXECUTE FUNCTION public.autopost_update_timestamp();

CREATE TRIGGER trg_autopost_rules_updated
  BEFORE UPDATE ON public.autopost_rules
  FOR EACH ROW EXECUTE FUNCTION public.autopost_update_timestamp();

CREATE TRIGGER trg_autopost_settings_updated
  BEFORE UPDATE ON public.autopost_settings
  FOR EACH ROW EXECUTE FUNCTION public.autopost_update_timestamp();

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.autopost_source_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_ingest_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_ingest_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_rewritten_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.autopost_scheduled_publishes ENABLE ROW LEVEL SECURITY;

-- Source Groups Policies
CREATE POLICY "autopost_groups_select" ON public.autopost_source_groups
  FOR SELECT USING (true);

CREATE POLICY "autopost_groups_insert" ON public.autopost_source_groups
  FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_groups_update" ON public.autopost_source_groups
  FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_groups_delete" ON public.autopost_source_groups
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Sources Policies
CREATE POLICY "autopost_sources_select" ON public.autopost_sources
  FOR SELECT USING (true);

CREATE POLICY "autopost_sources_insert" ON public.autopost_sources
  FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_sources_update" ON public.autopost_sources
  FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_sources_delete" ON public.autopost_sources
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Rules Policies
CREATE POLICY "autopost_rules_select" ON public.autopost_rules
  FOR SELECT USING (true);

CREATE POLICY "autopost_rules_insert" ON public.autopost_rules
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "autopost_rules_update" ON public.autopost_rules
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "autopost_rules_delete" ON public.autopost_rules
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Ingest Jobs Policies
CREATE POLICY "autopost_jobs_select" ON public.autopost_ingest_jobs
  FOR SELECT USING (true);

CREATE POLICY "autopost_jobs_insert" ON public.autopost_ingest_jobs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "autopost_jobs_update" ON public.autopost_ingest_jobs
  FOR UPDATE USING (true);

-- Ingest Items Policies
CREATE POLICY "autopost_items_select" ON public.autopost_ingest_items
  FOR SELECT USING (true);

CREATE POLICY "autopost_items_insert" ON public.autopost_ingest_items
  FOR INSERT WITH CHECK (true);

CREATE POLICY "autopost_items_update" ON public.autopost_ingest_items
  FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

-- Rewritten Posts Policies
CREATE POLICY "autopost_posts_select" ON public.autopost_rewritten_posts
  FOR SELECT USING (true);

CREATE POLICY "autopost_posts_insert" ON public.autopost_rewritten_posts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "autopost_posts_update" ON public.autopost_rewritten_posts
  FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_posts_delete" ON public.autopost_rewritten_posts
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Media Assets Policies
CREATE POLICY "autopost_media_select" ON public.autopost_media_assets
  FOR SELECT USING (true);

CREATE POLICY "autopost_media_insert" ON public.autopost_media_assets
  FOR INSERT WITH CHECK (true);

CREATE POLICY "autopost_media_update" ON public.autopost_media_assets
  FOR UPDATE USING (true);

CREATE POLICY "autopost_media_delete" ON public.autopost_media_assets
  FOR DELETE USING (public.is_admin_or_editor(auth.uid()));

-- Settings Policies
CREATE POLICY "autopost_settings_select" ON public.autopost_settings
  FOR SELECT USING (true);

CREATE POLICY "autopost_settings_insert" ON public.autopost_settings
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "autopost_settings_update" ON public.autopost_settings
  FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "autopost_settings_delete" ON public.autopost_settings
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Audit Logs Policies
CREATE POLICY "autopost_logs_select" ON public.autopost_audit_logs
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_logs_insert" ON public.autopost_audit_logs
  FOR INSERT WITH CHECK (true);

-- Scheduled Publishes Policies
CREATE POLICY "autopost_scheduled_select" ON public.autopost_scheduled_publishes
  FOR SELECT USING (true);

CREATE POLICY "autopost_scheduled_insert" ON public.autopost_scheduled_publishes
  FOR INSERT WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_scheduled_update" ON public.autopost_scheduled_publishes
  FOR UPDATE USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "autopost_scheduled_delete" ON public.autopost_scheduled_publishes
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- 7. SEED DATA
-- =====================================================

-- Insert São Paulo group and subgroups
DO $$
DECLARE
  v_sp_id UUID;
BEGIN
  -- Main São Paulo group
  INSERT INTO public.autopost_source_groups (name, description, icon, sort_order)
  VALUES ('São Paulo', 'Fontes do estado de São Paulo', 'MapPin', 1)
  RETURNING id INTO v_sp_id;
  
  -- Subgroups
  INSERT INTO public.autopost_source_groups (name, parent_id, description, icon, sort_order) VALUES
    ('Governo', v_sp_id, 'Fontes governamentais estaduais', 'Building2', 1),
    ('Prefeituras', v_sp_id, 'Prefeituras municipais', 'Landmark', 2),
    ('Câmaras', v_sp_id, 'Câmaras municipais e Alesp', 'Users', 3),
    ('Parceiros Privados', v_sp_id, 'Empresas e veículos parceiros', 'Briefcase', 4),
    ('ONGs', v_sp_id, 'Organizações não-governamentais', 'Heart', 5);
END $$;

-- Default settings
INSERT INTO public.autopost_settings (key, value, description, category) VALUES
  ('seo_limits', '{"meta_title_max": 60, "meta_description_max": 160, "summary_max": 160}', 'Limites de caracteres para SEO', 'seo'),
  ('tags_config', '{"required_count": 12, "min_count": 5, "max_count": 15}', 'Configuração de tags', 'editorial'),
  ('image_requirements', '{"min_width": 1200, "min_height": 630, "allowed_formats": ["jpg", "jpeg", "png", "webp"], "max_file_size_mb": 5}', 'Requisitos de imagem', 'media'),
  ('duplicate_detection', '{"window_days": 7, "title_similarity_threshold": 0.85, "content_hash_enabled": true}', 'Configuração de detecção de duplicatas', 'processing'),
  ('default_import_mode', '"queue_review"', 'Modo padrão para novas fontes', 'general'),
  ('default_frequency_minutes', '60', 'Frequência padrão de captura em minutos', 'general'),
  ('hourly_publish_limit', '10', 'Limite de publicações por hora', 'publishing'),
  ('editorial_template', '{"use_blockquotes": true, "min_paragraphs": 3, "max_h2_count": 4, "add_related_news": true}', 'Template editorial padrão', 'editorial'),
  ('rewrite_config', '{"preserve_quotes": true, "add_internal_links": true, "generate_summary": true}', 'Configuração de reescrita', 'processing')
ON CONFLICT (key, tenant_id) DO NOTHING;