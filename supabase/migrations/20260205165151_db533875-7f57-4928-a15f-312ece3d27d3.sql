-- Fase 1: Correções Críticas de Segurança RLS

-- 1. Restringir acesso à tabela profiles para autenticados apenas
DROP POLICY IF EXISTS "Perfis são visíveis publicamente" ON public.profiles;

CREATE POLICY "Perfis são visíveis para usuários autenticados"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Corrigir políticas excessivamente permissivas nas tabelas autopost mais críticas

-- autopost_sources: restringir a admins/editores
DROP POLICY IF EXISTS "Authenticated users can view autopost sources" ON public.autopost_sources;
DROP POLICY IF EXISTS "Authenticated users can insert autopost sources" ON public.autopost_sources;
DROP POLICY IF EXISTS "Authenticated users can update autopost sources" ON public.autopost_sources;

CREATE POLICY "Admins can view autopost sources"
ON public.autopost_sources
FOR SELECT
TO authenticated
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can insert autopost sources"
ON public.autopost_sources
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can update autopost sources"
ON public.autopost_sources
FOR UPDATE
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- autopost_ingest_items: restringir a admins/editores
DROP POLICY IF EXISTS "Authenticated users can view ingest items" ON public.autopost_ingest_items;
DROP POLICY IF EXISTS "Authenticated users can insert ingest items" ON public.autopost_ingest_items;
DROP POLICY IF EXISTS "Authenticated users can update ingest items" ON public.autopost_ingest_items;

CREATE POLICY "Admins can view ingest items"
ON public.autopost_ingest_items
FOR SELECT
TO authenticated
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can insert ingest items"
ON public.autopost_ingest_items
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can update ingest items"
ON public.autopost_ingest_items
FOR UPDATE
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- autopost_rewritten_posts: restringir a admins/editores
DROP POLICY IF EXISTS "Authenticated users can view rewritten posts" ON public.autopost_rewritten_posts;
DROP POLICY IF EXISTS "Authenticated users can insert rewritten posts" ON public.autopost_rewritten_posts;
DROP POLICY IF EXISTS "Authenticated users can update rewritten posts" ON public.autopost_rewritten_posts;

CREATE POLICY "Admins can view rewritten posts"
ON public.autopost_rewritten_posts
FOR SELECT
TO authenticated
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can insert rewritten posts"
ON public.autopost_rewritten_posts
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can update rewritten posts"
ON public.autopost_rewritten_posts
FOR UPDATE
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- autopost_rules: restringir a admins
DROP POLICY IF EXISTS "Authenticated users can view autopost rules" ON public.autopost_rules;
DROP POLICY IF EXISTS "Authenticated users can manage autopost rules" ON public.autopost_rules;

CREATE POLICY "Admins can view autopost rules"
ON public.autopost_rules
FOR SELECT
TO authenticated
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can insert autopost rules"
ON public.autopost_rules
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can update autopost rules"
ON public.autopost_rules
FOR UPDATE
TO authenticated
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can delete autopost rules"
ON public.autopost_rules
FOR DELETE
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- autopost_settings: restringir a admins
DROP POLICY IF EXISTS "Authenticated users can view autopost settings" ON public.autopost_settings;
DROP POLICY IF EXISTS "Authenticated users can manage autopost settings" ON public.autopost_settings;

CREATE POLICY "Admins can view autopost settings"
ON public.autopost_settings
FOR SELECT
TO authenticated
USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can insert autopost settings"
ON public.autopost_settings
FOR INSERT
TO authenticated
WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can update autopost settings"
ON public.autopost_settings
FOR UPDATE
TO authenticated
USING (is_admin_or_editor(auth.uid()));

-- 3. Corrigir audit_logs para permitir apenas insert de usuários autenticados
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON public.audit_logs;

CREATE POLICY "Authenticated users can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());