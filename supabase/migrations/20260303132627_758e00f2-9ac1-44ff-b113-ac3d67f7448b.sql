
CREATE TABLE IF NOT EXISTS public.formula_access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT UNIQUE NOT NULL,
  nome_negocio TEXT NOT NULL,
  nicho TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT,
  whatsapp TEXT,
  nome TEXT,
  generated_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT now() + INTERVAL '36 hours',
  status TEXT DEFAULT 'pendente',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.formula_access_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read own code" ON public.formula_access_codes FOR SELECT TO public USING (true);
CREATE POLICY "Public can insert" ON public.formula_access_codes FOR INSERT TO public WITH CHECK (true);

ALTER TABLE public.formula_conexao_leads ADD COLUMN IF NOT EXISTS nicho TEXT;
