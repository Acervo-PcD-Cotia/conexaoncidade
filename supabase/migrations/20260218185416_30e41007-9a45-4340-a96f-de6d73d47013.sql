
-- Fix RLS policy to allow super_admin to manage banners
DROP POLICY IF EXISTS "Admins podem gerenciar banners" ON public.super_banners;

CREATE POLICY "Admins podem gerenciar banners"
ON public.super_banners
FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)
);
