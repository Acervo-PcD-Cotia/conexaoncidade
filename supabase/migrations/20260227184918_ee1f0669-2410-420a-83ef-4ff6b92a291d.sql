-- Allow public (anonymous) read access to site_template_config
-- so that module toggles work for non-authenticated users
CREATE POLICY "Public can read site config"
  ON public.site_template_config
  FOR SELECT
  USING (true);
