-- Remover política antiga que só permite admin
DROP POLICY IF EXISTS "Admins podem deletar notícias" ON public.news;

-- Criar nova política que permite editores e admins excluírem notícias
CREATE POLICY "Editores podem deletar notícias"
  ON public.news FOR DELETE
  TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));