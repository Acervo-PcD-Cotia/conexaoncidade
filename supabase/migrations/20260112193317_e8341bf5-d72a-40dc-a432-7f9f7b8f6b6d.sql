-- Create storage bucket for banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public upload (authenticated users only)
CREATE POLICY "Allow authenticated uploads to banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- Policy for public viewing
CREATE POLICY "Allow public viewing of banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Policy for updates
CREATE POLICY "Allow authenticated updates to banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'banners');

-- Policy for deletes
CREATE POLICY "Allow authenticated deletes from banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banners');

-- Table to record each banner click for detailed analytics
CREATE TABLE public.banner_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  clicked_at timestamptz DEFAULT now(),
  user_agent text,
  referer text,
  session_id text
);

-- Indexes for efficient queries
CREATE INDEX idx_banner_clicks_date ON public.banner_clicks(clicked_at);
CREATE INDEX idx_banner_clicks_banner ON public.banner_clicks(banner_id);

-- RLS for banner_clicks
ALTER TABLE public.banner_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert of clicks"
ON public.banner_clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admin read of clicks"
ON public.banner_clicks FOR SELECT
USING (public.is_admin_or_editor(auth.uid()));

-- Table to record banner impressions for CTR calculation
CREATE TABLE public.banner_impressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_id uuid REFERENCES public.super_banners(id) ON DELETE CASCADE,
  viewed_at timestamptz DEFAULT now(),
  session_id text
);

-- Indexes for impressions
CREATE INDEX idx_banner_impressions_date ON public.banner_impressions(viewed_at);
CREATE INDEX idx_banner_impressions_banner ON public.banner_impressions(banner_id);

-- RLS for banner_impressions
ALTER TABLE public.banner_impressions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert of impressions"
ON public.banner_impressions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow admin read of impressions"
ON public.banner_impressions FOR SELECT
USING (public.is_admin_or_editor(auth.uid()));