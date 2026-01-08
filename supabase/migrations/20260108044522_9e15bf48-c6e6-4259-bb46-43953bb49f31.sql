-- =============================================
-- NOTÍCIAS AI MODULE: Audio & Summary Infrastructure
-- =============================================

-- 1. Add audio and AI summary columns to news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS audio_type TEXT DEFAULT 'full',
ADD COLUMN IF NOT EXISTS audio_voice_id TEXT,
ADD COLUMN IF NOT EXISTS audio_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS audio_status TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS ai_summary_bullets TEXT[],
ADD COLUMN IF NOT EXISTS ai_summary_generated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS show_audio_player BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_summary_button BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS distribute_audio BOOLEAN DEFAULT false;

-- 2. News Audio Settings (per tenant configuration)
CREATE TABLE IF NOT EXISTS public.news_audio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  auto_generate_audio BOOLEAN DEFAULT false,
  auto_generate_summary BOOLEAN DEFAULT false,
  auto_distribute BOOLEAN DEFAULT false,
  default_voice_id TEXT DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  default_voice_gender TEXT DEFAULT 'male',
  default_audio_type TEXT DEFAULT 'full',
  max_audio_duration_seconds INTEGER DEFAULT 600,
  monthly_audio_limit INTEGER DEFAULT 100,
  monthly_distribution_limit INTEGER DEFAULT 50,
  excluded_categories UUID[],
  excluded_authors UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id)
);

-- 3. News Audio Analytics (tracking listens)
CREATE TABLE IF NOT EXISTS public.news_audio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  listened_at TIMESTAMPTZ DEFAULT now(),
  duration_listened_seconds INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  platform TEXT DEFAULT 'web',
  user_fingerprint TEXT,
  referrer TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT
);

-- 4. Podcast Feeds (RSS feeds for distribution)
CREATE TABLE IF NOT EXISTS public.podcast_feeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  feed_type TEXT NOT NULL DEFAULT 'portal',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  author_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  language TEXT DEFAULT 'pt-BR',
  explicit BOOLEAN DEFAULT false,
  feed_url TEXT,
  spotify_url TEXT,
  apple_url TEXT,
  google_url TEXT,
  amazon_url TEXT,
  deezer_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Audio Generation Queue
CREATE TABLE IF NOT EXISTS public.audio_generation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  audio_type TEXT DEFAULT 'full',
  voice_id TEXT DEFAULT 'JBFqnCBsd6RMkjVDRZzb',
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  created_by UUID
);

-- 6. Create storage bucket for audio files
INSERT INTO storage.buckets (id, name, public)
VALUES ('news-audio', 'news-audio', true)
ON CONFLICT (id) DO NOTHING;

-- 7. Enable RLS on all new tables
ALTER TABLE public.news_audio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_audio_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcast_feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_generation_queue ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies for news_audio_settings
CREATE POLICY "Admins can manage audio settings"
ON public.news_audio_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Authenticated users can view audio settings"
ON public.news_audio_settings FOR SELECT
USING (auth.role() = 'authenticated');

-- 9. RLS Policies for news_audio_analytics (public insert for tracking)
CREATE POLICY "Anyone can insert audio analytics"
ON public.news_audio_analytics FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can view analytics"
ON public.news_audio_analytics FOR SELECT
USING (auth.role() = 'authenticated');

-- 10. RLS Policies for podcast_feeds
CREATE POLICY "Admins can manage podcast feeds"
ON public.podcast_feeds FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Anyone can view active podcast feeds"
ON public.podcast_feeds FOR SELECT
USING (is_active = true);

-- 11. RLS Policies for audio_generation_queue
CREATE POLICY "Admins can manage audio queue"
ON public.audio_generation_queue FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'editor_chief', 'editor')
  )
);

-- 12. Storage policies for news-audio bucket
CREATE POLICY "Anyone can view news audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-audio');

CREATE POLICY "Authenticated users can upload news audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news-audio' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can delete news audio"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'news-audio' AND 
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin')
  )
);

-- 13. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_news_audio_status ON public.news(audio_status) WHERE audio_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_news_audio_analytics_news ON public.news_audio_analytics(news_id);
CREATE INDEX IF NOT EXISTS idx_news_audio_analytics_date ON public.news_audio_analytics(listened_at);
CREATE INDEX IF NOT EXISTS idx_audio_queue_status ON public.audio_generation_queue(status) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_podcast_feeds_tenant ON public.podcast_feeds(tenant_id);

-- 14. Triggers for updated_at
CREATE TRIGGER update_news_audio_settings_updated_at
BEFORE UPDATE ON public.news_audio_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_podcast_feeds_updated_at
BEFORE UPDATE ON public.podcast_feeds
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();