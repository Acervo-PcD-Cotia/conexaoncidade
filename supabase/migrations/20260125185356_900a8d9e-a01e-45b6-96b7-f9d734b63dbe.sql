-- 1. Atualizar política de SELECT para sites (incluir super_admin)
DROP POLICY IF EXISTS "Editores podem ver sites" ON public.sites;
DROP POLICY IF EXISTS "Admins e super_admins podem ver sites" ON public.sites;

CREATE POLICY "Admins e super_admins podem ver sites"
ON public.sites FOR SELECT
USING (
  public.is_admin_or_editor(auth.uid()) 
  OR public.is_super_admin(auth.uid())
);

-- 2. Atualizar política de gerenciamento para sites
DROP POLICY IF EXISTS "Admins podem gerenciar sites" ON public.sites;
DROP POLICY IF EXISTS "Admins e super_admins podem gerenciar sites" ON public.sites;

CREATE POLICY "Admins e super_admins podem gerenciar sites"
ON public.sites FOR ALL
USING (
  public.has_role(auth.uid(), 'admin')
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin')
  OR public.is_super_admin(auth.uid())
);

-- 3. Atualizar políticas de external_streaming_configs para super_admin
DROP POLICY IF EXISTS "Admins podem gerenciar configs de streaming" ON public.external_streaming_configs;
DROP POLICY IF EXISTS "Admins e super_admins podem gerenciar configs de streaming" ON public.external_streaming_configs;

CREATE POLICY "Admins e super_admins podem gerenciar configs de streaming"
ON public.external_streaming_configs FOR ALL
USING (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin')
    AND tenant_id IN (
      SELECT site_id FROM site_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
)
WITH CHECK (
  public.is_super_admin(auth.uid())
  OR (
    public.has_role(auth.uid(), 'admin')
    AND tenant_id IN (
      SELECT site_id FROM site_users 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  )
);

-- 4. Política de SELECT para external_streaming_configs
DROP POLICY IF EXISTS "Admins podem ver configs de streaming" ON public.external_streaming_configs;
DROP POLICY IF EXISTS "Admins e super_admins podem ver configs de streaming" ON public.external_streaming_configs;

CREATE POLICY "Admins e super_admins podem ver configs de streaming"
ON public.external_streaming_configs FOR SELECT
USING (
  public.is_super_admin(auth.uid())
  OR public.is_admin_or_editor(auth.uid())
);