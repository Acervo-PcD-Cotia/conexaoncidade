-- Remove old policy
DROP POLICY IF EXISTS "Admins podem gerenciar categorias" ON public.categories;

-- Create new policy that includes super_admin
CREATE POLICY "Admins podem gerenciar categorias" ON public.categories
  FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
  )
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'super_admin'::app_role)
  );