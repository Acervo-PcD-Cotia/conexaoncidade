-- Enum para vereditos
CREATE TYPE public.fact_check_verdict AS ENUM (
  'CONFIRMADO',
  'PROVAVELMENTE_VERDADEIRO', 
  'ENGANOSO',
  'PROVAVELMENTE_FALSO',
  'FALSO',
  'NAO_VERIFICAVEL_AINDA'
);

-- Enum para status de verificação
CREATE TYPE public.fact_check_status AS ENUM (
  'NEW',
  'UNDER_REVIEW',
  'EDITORIAL_QUEUE',
  'REVIEWED',
  'PUBLISHED'
);

-- Enum para tipo de entrada
CREATE TYPE public.fact_check_input_type AS ENUM (
  'link',
  'text',
  'title',
  'image'
);

-- Enum para tipo de fonte confiável
CREATE TYPE public.trusted_source_type AS ENUM (
  'PRIMARY',
  'JOURNALISM',
  'CHECKER',
  'OTHER'
);

-- Tabela principal de verificações
CREATE TABLE public.fact_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ref_slug TEXT,
  input_type public.fact_check_input_type NOT NULL,
  input_content TEXT NOT NULL,
  image_url TEXT,
  verdict public.fact_check_verdict NOT NULL DEFAULT 'NAO_VERIFICAVEL_AINDA',
  score INTEGER NOT NULL DEFAULT 50 CHECK (score >= 0 AND score <= 100),
  summary TEXT,
  methodology TEXT,
  limitations TEXT,
  is_public BOOLEAN NOT NULL DEFAULT true,
  status public.fact_check_status NOT NULL DEFAULT 'NEW',
  editor_notes TEXT,
  opt_in_editorial BOOLEAN NOT NULL DEFAULT false,
  share_url TEXT,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE
);

-- Alegações checadas
CREATE TABLE public.fact_check_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_check_id UUID NOT NULL REFERENCES public.fact_checks(id) ON DELETE CASCADE,
  claim_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fontes encontradas como evidência
CREATE TABLE public.fact_check_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_check_id UUID NOT NULL REFERENCES public.fact_checks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  snippet TEXT,
  reliability_score INTEGER CHECK (reliability_score >= 0 AND reliability_score <= 100),
  is_corroborating BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Denúncias de erro
CREATE TABLE public.fact_check_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fact_check_id UUID NOT NULL REFERENCES public.fact_checks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Fontes confiáveis (whitelist/blacklist)
CREATE TABLE public.trusted_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  type public.trusted_source_type NOT NULL DEFAULT 'OTHER',
  is_allowed BOOLEAN NOT NULL DEFAULT true,
  weight INTEGER NOT NULL DEFAULT 10 CHECK (weight >= 0 AND weight <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE
);

-- Configurações de fact-check (singleton por tenant)
CREATE TABLE public.factcheck_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE UNIQUE,
  primary_weight INTEGER NOT NULL DEFAULT 20,
  multi_source_bonus INTEGER NOT NULL DEFAULT 20,
  contradiction_penalty INTEGER NOT NULL DEFAULT 30,
  no_evidence_penalty INTEGER NOT NULL DEFAULT 15,
  clickbait_penalty INTEGER NOT NULL DEFAULT 10,
  consistency_bonus INTEGER NOT NULL DEFAULT 10,
  min_sources_to_confirm INTEGER NOT NULL DEFAULT 2,
  default_methodology_text TEXT DEFAULT 'Esta verificação foi realizada automaticamente através de análise de fontes confiáveis, comparação de informações e detecção de padrões. O sistema busca evidências em bases de dados jornalísticas, órgãos oficiais e agências de checagem.',
  default_limitations_text TEXT DEFAULT 'Este resultado é baseado nas evidências disponíveis no momento da verificação e pode mudar com novas informações. Recomendamos sempre consultar múltiplas fontes antes de compartilhar.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_fact_checks_user_id ON public.fact_checks(user_id);
CREATE INDEX idx_fact_checks_status ON public.fact_checks(status);
CREATE INDEX idx_fact_checks_verdict ON public.fact_checks(verdict);
CREATE INDEX idx_fact_checks_created_at ON public.fact_checks(created_at DESC);
CREATE INDEX idx_fact_check_claims_fact_check_id ON public.fact_check_claims(fact_check_id);
CREATE INDEX idx_fact_check_sources_fact_check_id ON public.fact_check_sources(fact_check_id);
CREATE INDEX idx_fact_check_reports_fact_check_id ON public.fact_check_reports(fact_check_id);
CREATE INDEX idx_trusted_sources_domain ON public.trusted_sources(domain);

-- Enable RLS
ALTER TABLE public.fact_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_check_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_check_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_check_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.factcheck_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fact_checks
CREATE POLICY "Public fact checks are viewable by everyone" 
ON public.fact_checks FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can view their own fact checks" 
ON public.fact_checks FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create fact checks" 
ON public.fact_checks FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own fact checks" 
ON public.fact_checks FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all fact checks" 
ON public.fact_checks FOR ALL 
USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for fact_check_claims
CREATE POLICY "Claims are viewable with their fact check" 
ON public.fact_check_claims FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.fact_checks fc 
  WHERE fc.id = fact_check_id AND (fc.is_public = true OR fc.user_id = auth.uid())
));

CREATE POLICY "Anyone can create claims" 
ON public.fact_check_claims FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage claims" 
ON public.fact_check_claims FOR ALL 
USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for fact_check_sources
CREATE POLICY "Sources are viewable with their fact check" 
ON public.fact_check_sources FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.fact_checks fc 
  WHERE fc.id = fact_check_id AND (fc.is_public = true OR fc.user_id = auth.uid())
));

CREATE POLICY "Anyone can create sources" 
ON public.fact_check_sources FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can manage sources" 
ON public.fact_check_sources FOR ALL 
USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for fact_check_reports
CREATE POLICY "Anyone can create reports" 
ON public.fact_check_reports FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own reports" 
ON public.fact_check_reports FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage reports" 
ON public.fact_check_reports FOR ALL 
USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for trusted_sources
CREATE POLICY "Trusted sources are viewable by everyone" 
ON public.trusted_sources FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage trusted sources" 
ON public.trusted_sources FOR ALL 
USING (public.is_admin_or_editor(auth.uid()));

-- RLS Policies for factcheck_settings
CREATE POLICY "Settings are viewable by everyone" 
ON public.factcheck_settings FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage settings" 
ON public.factcheck_settings FOR ALL 
USING (public.is_admin_or_editor(auth.uid()));

-- Trigger for updated_at on trusted_sources
CREATE TRIGGER update_trusted_sources_updated_at
BEFORE UPDATE ON public.trusted_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on factcheck_settings
CREATE TRIGGER update_factcheck_settings_updated_at
BEFORE UPDATE ON public.factcheck_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.factcheck_settings (tenant_id) VALUES (NULL);

-- Insert some default trusted sources
INSERT INTO public.trusted_sources (domain, name, type, is_allowed, weight) VALUES
('g1.globo.com', 'G1', 'JOURNALISM', true, 15),
('gov.br', 'Governo Federal', 'PRIMARY', true, 25),
('aosfatos.org', 'Aos Fatos', 'CHECKER', true, 20),
('lupa.uol.com.br', 'Agência Lupa', 'CHECKER', true, 20),
('boatos.org', 'Boatos.org', 'CHECKER', true, 18),
('reuters.com', 'Reuters', 'JOURNALISM', true, 20),
('apnews.com', 'Associated Press', 'JOURNALISM', true, 20),
('folha.uol.com.br', 'Folha de S.Paulo', 'JOURNALISM', true, 15),
('estadao.com.br', 'Estadão', 'JOURNALISM', true, 15),
('ibge.gov.br', 'IBGE', 'PRIMARY', true, 25),
('who.int', 'OMS', 'PRIMARY', true, 25),
('saude.gov.br', 'Ministério da Saúde', 'PRIMARY', true, 22);