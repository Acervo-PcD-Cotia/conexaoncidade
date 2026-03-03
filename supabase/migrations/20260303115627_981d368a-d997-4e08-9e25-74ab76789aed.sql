
CREATE TABLE public.formula_conexao_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  negocio TEXT NOT NULL,
  cpf_cnpj TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  quiz_completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.formula_conexao_leads ENABLE ROW LEVEL SECURITY;

-- Public insert (quiz is public)
CREATE POLICY "Allow anonymous insert" ON public.formula_conexao_leads
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admin select
CREATE POLICY "Admins can view leads" ON public.formula_conexao_leads
  FOR SELECT TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));

-- Admin update
CREATE POLICY "Admins can update leads" ON public.formula_conexao_leads
  FOR UPDATE TO authenticated
  USING (public.is_admin_or_editor(auth.uid()));
