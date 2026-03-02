
-- 1. Permitir usuarios autenticados verem noticias publicadas
CREATE POLICY "Usuarios autenticados podem ver noticias publicadas"
  ON public.news FOR SELECT
  TO authenticated
  USING (status = 'published' AND deleted_at IS NULL);

-- 2. Sites visiveis publicamente (necessario para TenantContext)
CREATE POLICY "Sites sao visiveis publicamente"
  ON public.sites FOR SELECT
  TO public
  USING (true);

-- 3. Usuarios podem ver suas proprias associacoes em site_users
CREATE POLICY "Usuarios podem ver suas proprias associacoes"
  ON public.site_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
