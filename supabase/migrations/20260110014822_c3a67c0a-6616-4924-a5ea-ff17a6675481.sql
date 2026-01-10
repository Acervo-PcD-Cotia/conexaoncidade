-- Add podcast fields to news table
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS podcast_status TEXT DEFAULT 'not_generated';
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS podcast_audio_url TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS podcast_generated_at TIMESTAMPTZ;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS auto_generate_podcast BOOLEAN DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS auto_publish_podcast BOOLEAN DEFAULT false;

-- Create podcast_logs table
CREATE TABLE IF NOT EXISTS public.podcast_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  tenant_id UUID REFERENCES public.sites(id)
);

-- Enable RLS on podcast_logs
ALTER TABLE public.podcast_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for podcast_logs
CREATE POLICY "Authenticated users can view podcast logs"
  ON public.podcast_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Editors can insert podcast logs"
  ON public.podcast_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor_chief', 'editor')
    )
  );

-- Create podcast-audio storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('podcast-audio', 'podcast-audio', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for podcast-audio bucket
CREATE POLICY "Public can read podcast audio"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'podcast-audio');

CREATE POLICY "Editors can upload podcast audio"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'podcast-audio' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor_chief', 'editor')
    )
  );

CREATE POLICY "Editors can delete podcast audio"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'podcast-audio' AND
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'editor_chief', 'editor')
    )
  );