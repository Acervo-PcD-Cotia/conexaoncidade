-- Tabela de catálogo de celulares
CREATE TABLE public.phone_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  price_min INTEGER NOT NULL,
  price_max INTEGER NOT NULL,
  price_range TEXT NOT NULL CHECK (price_range IN ('budget', 'mid', 'premium', 'flagship')),
  image_url TEXT,
  ideal_for TEXT NOT NULL,
  strengths TEXT[] NOT NULL DEFAULT '{}',
  considerations TEXT[] NOT NULL DEFAULT '{}',
  use_cases TEXT[] NOT NULL DEFAULT '{}',
  gaming_score INTEGER NOT NULL DEFAULT 3 CHECK (gaming_score >= 1 AND gaming_score <= 5),
  camera_score INTEGER NOT NULL DEFAULT 3 CHECK (camera_score >= 1 AND camera_score <= 5),
  battery_score INTEGER NOT NULL DEFAULT 3 CHECK (battery_score >= 1 AND battery_score <= 5),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de histórico de recomendações
CREATE TABLE public.phone_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  answers JSONB NOT NULL,
  recommended_phone_id UUID REFERENCES public.phone_catalog(id) ON DELETE SET NULL,
  alternative_phones UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.phone_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_recommendations ENABLE ROW LEVEL SECURITY;

-- Políticas para phone_catalog
CREATE POLICY "Qualquer pessoa pode ver celulares ativos"
ON public.phone_catalog
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins podem ver todos os celulares"
ON public.phone_catalog
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins podem inserir celulares"
ON public.phone_catalog
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins podem atualizar celulares"
ON public.phone_catalog
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins podem deletar celulares"
ON public.phone_catalog
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

-- Políticas para phone_recommendations
CREATE POLICY "Usuários podem ver suas próprias recomendações"
ON public.phone_recommendations
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias recomendações"
ON public.phone_recommendations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_phone_catalog_updated_at
BEFORE UPDATE ON public.phone_catalog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais de celulares populares
INSERT INTO public.phone_catalog (name, brand, price_min, price_max, price_range, ideal_for, strengths, considerations, use_cases, gaming_score, camera_score, battery_score) VALUES
-- Budget
('Motorola Moto G84', 'Motorola', 800, 1200, 'budget', 'Quem busca bom custo-benefício para uso diário', ARRAY['Bateria que dura o dia todo', 'Tela grande e bonita', 'Carregamento rápido'], ARRAY['Jogos pesados podem travar', 'Câmera boa apenas com luz'], ARRAY['social', 'messaging', 'streaming'], 2, 3, 5),
('Xiaomi Redmi Note 13', 'Xiaomi', 900, 1300, 'budget', 'Quem quer muitos recursos por pouco dinheiro', ARRAY['Ótima tela AMOLED', 'Carregamento ultra-rápido', 'Muito espaço para fotos'], ARRAY['Sistema pode vir com propagandas', 'Atualizações podem demorar'], ARRAY['social', 'photography', 'streaming'], 3, 4, 4),
('Samsung Galaxy A15', 'Samsung', 700, 1000, 'budget', 'Quem prefere a confiabilidade Samsung sem gastar muito', ARRAY['Marca conhecida e confiável', 'Bom suporte de atualizações', 'Fácil de usar'], ARRAY['Performance básica', 'Câmera simples'], ARRAY['messaging', 'social', 'basic'], 2, 2, 4),

-- Mid-range
('Samsung Galaxy A54', 'Samsung', 1800, 2500, 'mid', 'Quem busca equilíbrio entre qualidade e preço', ARRAY['Câmera muito boa', 'Resistente à água', 'Atualizações por 4 anos'], ARRAY['Processador poderia ser mais rápido', 'Carregador não vem na caixa'], ARRAY['photography', 'social', 'work', 'streaming'], 3, 4, 4),
('Motorola Edge 40', 'Motorola', 2000, 2800, 'mid', 'Quem quer tela curva e design premium', ARRAY['Design elegante', 'Tela curva bonita', 'Android puro e rápido'], ARRAY['Bateria mediana', 'Menos acessórios disponíveis'], ARRAY['social', 'photography', 'work'], 3, 4, 3),
('Xiaomi Poco X6 Pro', 'Xiaomi', 1500, 2200, 'mid', 'Quem joga e quer performance sem gastar muito', ARRAY['Muito rápido para jogos', 'Tela de alta taxa de atualização', 'Ótimo preço pelo desempenho'], ARRAY['Câmera apenas razoável', 'Construção em plástico'], ARRAY['games', 'social', 'streaming'], 5, 3, 4),

-- Premium
('Samsung Galaxy S24', 'Samsung', 3500, 4500, 'premium', 'Quem quer o melhor da Samsung com inteligência artificial', ARRAY['Câmera profissional', 'Recursos de IA exclusivos', '7 anos de atualizações'], ARRAY['Preço elevado', 'Bateria poderia ser maior'], ARRAY['photography', 'work', 'social', 'games'], 4, 5, 3),
('iPhone 15', 'Apple', 4500, 5500, 'premium', 'Quem prefere o ecossistema Apple e quer qualidade garantida', ARRAY['Sistema super estável', 'Câmera excelente', 'Troca de dados fácil com outros Apple'], ARRAY['Preço alto', 'Menos personalização'], ARRAY['photography', 'work', 'social', 'streaming'], 4, 5, 4),

-- Flagship
('Samsung Galaxy S24 Ultra', 'Samsung', 6500, 8000, 'flagship', 'Quem quer o máximo em tecnologia e não se preocupa com preço', ARRAY['Melhor câmera do mercado', 'Caneta S Pen incluída', 'Tela gigante e linda'], ARRAY['Muito grande e pesado', 'Preço muito alto'], ARRAY['photography', 'work', 'games', 'productivity'], 5, 5, 4),
('iPhone 15 Pro Max', 'Apple', 8000, 10000, 'flagship', 'Quem quer o melhor iPhone possível', ARRAY['Desempenho imbatível', 'Melhor vídeo do mercado', 'Bateria excelente'], ARRAY['Preço muito elevado', 'Pesado'], ARRAY['photography', 'work', 'games', 'video'], 5, 5, 5);