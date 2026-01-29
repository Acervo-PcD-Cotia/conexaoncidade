-- 1. Adicionar coluna city às fontes
ALTER TABLE public.autopost_sources ADD COLUMN IF NOT EXISTS city TEXT;

-- 2. Adicionar coluna cities_mentioned aos posts reescritos
ALTER TABLE public.autopost_rewritten_posts ADD COLUMN IF NOT EXISTS cities_mentioned TEXT[];

-- 3. Criar tabela de cidades do cluster regional
CREATE TABLE IF NOT EXISTS public.autopost_cluster_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  is_central BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 1,
  seo_terms TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.autopost_cluster_cities ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Anyone can read cluster cities" ON public.autopost_cluster_cities
  FOR SELECT USING (true);

-- Política de escrita para admins usando has_role com auth.uid()
CREATE POLICY "Admins can manage cluster cities" ON public.autopost_cluster_cities
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::public.app_role) 
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- 4. Inserir os 14 municípios do cluster Grande Cotia
INSERT INTO public.autopost_cluster_cities (name, slug, is_central, priority, seo_terms) VALUES
('Cotia', 'cotia', true, 1, ARRAY['Cotia', 'Grande Cotia', 'região de Cotia']),
('Itapevi', 'itapevi', false, 2, ARRAY['Itapevi', 'região de Cotia']),
('Vargem Grande Paulista', 'vargem-grande-paulista', false, 2, ARRAY['Vargem Grande', 'VGP']),
('São Roque', 'sao-roque', false, 2, ARRAY['São Roque', 'terra do vinho']),
('Ibiúna', 'ibiuna', false, 2, ARRAY['Ibiúna']),
('Embu-Guaçu', 'embu-guacu', false, 2, ARRAY['Embu-Guaçu']),
('Embu das Artes', 'embu-das-artes', false, 2, ARRAY['Embu', 'Embu das Artes']),
('Itapecerica da Serra', 'itapecerica-da-serra', false, 2, ARRAY['Itapecerica']),
('São Lourenço da Serra', 'sao-lourenco-da-serra', false, 3, ARRAY['São Lourenço']),
('São Paulo', 'sao-paulo', false, 3, ARRAY['São Paulo', 'SP', 'capital']),
('Osasco', 'osasco', false, 3, ARRAY['Osasco']),
('Jandira', 'jandira', false, 3, ARRAY['Jandira']),
('Carapicuíba', 'carapicuiba', false, 3, ARRAY['Carapicuíba']),
('Barueri', 'barueri', false, 3, ARRAY['Barueri', 'Alphaville'])
ON CONFLICT (slug) DO NOTHING;

-- 5. Criar grupo regional "Grande Cotia & Região Oeste"
INSERT INTO public.autopost_source_groups (name, description, icon, sort_order)
VALUES (
  'Grande Cotia & Região Oeste',
  'Municípios da região de Cotia e Oeste da Grande SP',
  'MapPin',
  5
)
ON CONFLICT DO NOTHING;

-- 6. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_autopost_sources_city ON public.autopost_sources(city);
CREATE INDEX IF NOT EXISTS idx_autopost_rewritten_posts_cities ON public.autopost_rewritten_posts USING GIN(cities_mentioned);