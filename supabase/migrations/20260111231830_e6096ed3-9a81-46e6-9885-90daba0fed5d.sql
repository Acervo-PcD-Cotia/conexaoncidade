-- Tabela principal de leads da campanha
CREATE TABLE IF NOT EXISTS public.campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  
  -- BLOCO A: Identificação do Negócio
  business_name TEXT NOT NULL,
  business_category TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Cotia',
  state TEXT DEFAULT 'SP',
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- BLOCO B: Situação no Google Maps
  has_google_maps TEXT CHECK (has_google_maps IN ('yes', 'no', 'unknown')),
  google_maps_link TEXT,
  has_photos TEXT CHECK (has_photos IN ('yes', 'few', 'no')),
  responds_reviews TEXT CHECK (responds_reviews IN ('always', 'sometimes', 'never')),
  correct_hours TEXT CHECK (correct_hours IN ('yes', 'no', 'unknown')),
  
  -- Respostas do Quiz
  quiz_responses JSONB DEFAULT '{}'::jsonb,
  quiz_score INTEGER DEFAULT 0,
  
  -- BLOCO C: Autorizações
  authorized_review BOOLEAN DEFAULT false,
  authorized_photos BOOLEAN DEFAULT false,
  authorized_corrections BOOLEAN DEFAULT false,
  authorized_local_guide BOOLEAN DEFAULT false,
  
  -- BLOCO D: Conteúdo
  business_description TEXT,
  
  -- BLOCO E: Consentimentos
  consent_google_maps BOOLEAN DEFAULT false,
  consent_portal BOOLEAN DEFAULT false,
  consent_community BOOLEAN DEFAULT false,
  wants_community TEXT CHECK (wants_community IN ('yes', 'yes_support', 'only_free')),
  
  -- Lógica Interna (invisível ao usuário)
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  estimated_points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'in_progress', 'completed', 'rejected')),
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  processed_at TIMESTAMPTZ,
  processed_by UUID,
  notes TEXT
);

-- Tabela de fotos dos leads
CREATE TABLE IF NOT EXISTS public.campaign_lead_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.campaign_leads(id) ON DELETE CASCADE NOT NULL,
  photo_url TEXT NOT NULL,
  photo_type TEXT CHECK (photo_type IN ('facade', 'interior', 'products', 'team', 'other')),
  file_name TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_campaign_leads_tenant ON public.campaign_leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_status ON public.campaign_leads(status);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_priority ON public.campaign_leads(priority);
CREATE INDEX IF NOT EXISTS idx_campaign_leads_created ON public.campaign_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaign_lead_photos_lead ON public.campaign_lead_photos(lead_id);

-- Função para calcular pontuação e prioridade automaticamente
CREATE OR REPLACE FUNCTION public.calculate_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.estimated_points := 0;
  
  -- Avaliação descritiva autorizada: 20 pontos
  IF NEW.authorized_review THEN
    NEW.estimated_points := NEW.estimated_points + 20;
  END IF;
  
  -- Fotos autorizadas: 10 pontos
  IF NEW.authorized_photos THEN
    NEW.estimated_points := NEW.estimated_points + 10;
  END IF;
  
  -- Correções aprovadas: 5 pontos
  IF NEW.authorized_corrections THEN
    NEW.estimated_points := NEW.estimated_points + 5;
  END IF;
  
  -- Inclusão no Guia Local: 10 pontos
  IF NEW.authorized_local_guide THEN
    NEW.estimated_points := NEW.estimated_points + 10;
  END IF;
  
  -- Novo local (sem Google Maps): 15 pontos
  IF NEW.has_google_maps = 'no' THEN
    NEW.estimated_points := NEW.estimated_points + 15;
  END IF;
  
  -- Quer comunidade com suporte: 5 pontos
  IF NEW.wants_community = 'yes_support' THEN
    NEW.estimated_points := NEW.estimated_points + 5;
  END IF;
  
  -- Determinar prioridade baseada na pontuação
  IF NEW.estimated_points >= 35 THEN
    NEW.priority := 'high';
  ELSIF NEW.estimated_points >= 20 THEN
    NEW.priority := 'medium';
  ELSE
    NEW.priority := 'low';
  END IF;
  
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular pontuação em insert/update
DROP TRIGGER IF EXISTS trigger_calculate_lead_score ON public.campaign_leads;
CREATE TRIGGER trigger_calculate_lead_score
  BEFORE INSERT OR UPDATE ON public.campaign_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_lead_score();

-- Storage bucket para imagens de negócios
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'business-images',
  'business-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- RLS para campaign_leads
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode criar um lead (formulário público)
CREATE POLICY "Anyone can create campaign leads"
  ON public.campaign_leads
  FOR INSERT
  WITH CHECK (true);

-- Apenas admins podem ver leads (usando user_roles)
CREATE POLICY "Admins can view campaign leads"
  ON public.campaign_leads
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'editor', 'editor_chief')
    )
  );

-- Apenas admins podem atualizar leads
CREATE POLICY "Admins can update campaign leads"
  ON public.campaign_leads
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'editor', 'editor_chief')
    )
  );

-- Apenas admins podem deletar leads
CREATE POLICY "Admins can delete campaign leads"
  ON public.campaign_leads
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- RLS para campaign_lead_photos
ALTER TABLE public.campaign_lead_photos ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir fotos (junto com o lead)
CREATE POLICY "Anyone can upload lead photos"
  ON public.campaign_lead_photos
  FOR INSERT
  WITH CHECK (true);

-- Admins podem ver fotos
CREATE POLICY "Admins can view lead photos"
  ON public.campaign_lead_photos
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin', 'editor', 'editor_chief')
    )
  );

-- Admins podem deletar fotos
CREATE POLICY "Admins can delete lead photos"
  ON public.campaign_lead_photos
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- Storage policies para business-images
CREATE POLICY "Anyone can upload business images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'business-images');

CREATE POLICY "Anyone can view business images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'business-images');

CREATE POLICY "Admins can delete business images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'business-images'
    AND EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );