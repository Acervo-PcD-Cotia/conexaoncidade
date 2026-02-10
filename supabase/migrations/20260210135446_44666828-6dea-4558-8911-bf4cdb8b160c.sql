-- Add public SELECT policy on profiles so anonymous users can read author info
CREATE POLICY "Perfis publicos sao visiveis para todos"
  ON public.profiles
  FOR SELECT
  TO anon
  USING (true);