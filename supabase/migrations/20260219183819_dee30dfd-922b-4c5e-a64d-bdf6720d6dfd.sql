-- Create storage bucket for site assets (logo, etc.)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('site-assets', 'site-assets', true, 5242880, ARRAY['image/png','image/jpeg','image/jpg','image/svg+xml','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Public read policy
CREATE POLICY "Public read site-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

-- Authenticated upload policy
CREATE POLICY "Authenticated upload site-assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND auth.role() = 'authenticated');

-- Authenticated update/delete policy
CREATE POLICY "Authenticated manage site-assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-assets' AND auth.role() = 'authenticated');
