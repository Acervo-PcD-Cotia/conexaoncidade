-- =====================================================
-- MÓDULO IMOBILIÁRIO - PORTAL CONEXÃO NA CIDADE
-- =====================================================

-- Enum para tipo de anunciante
CREATE TYPE public.anunciante_tipo AS ENUM ('corretor', 'imobiliaria');

-- Enum para plano do anunciante
CREATE TYPE public.anunciante_plano AS ENUM ('free', 'pro', 'partner');

-- Enum para finalidade do imóvel
CREATE TYPE public.imovel_finalidade AS ENUM ('venda', 'aluguel', 'venda_aluguel');

-- Enum para tipo do imóvel
CREATE TYPE public.imovel_tipo AS ENUM ('casa', 'apartamento', 'terreno', 'comercial', 'chacara', 'cobertura', 'studio', 'kitnet', 'galpao', 'sala_comercial');

-- Enum para status do imóvel
CREATE TYPE public.imovel_status AS ENUM ('rascunho', 'pendente', 'ativo', 'vendido', 'alugado', 'inativo');

-- Enum para status do lead
CREATE TYPE public.lead_imovel_status AS ENUM ('novo', 'contatado', 'qualificado', 'visita_agendada', 'proposta', 'fechado', 'perdido');

-- Enum para intenção do lead
CREATE TYPE public.lead_intencao AS ENUM ('comprar', 'alugar', 'investir', 'avaliar');

-- =====================================================
-- TABELA: anunciantes (corretores e imobiliárias)
-- =====================================================
CREATE TABLE public.anunciantes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  tipo public.anunciante_tipo NOT NULL DEFAULT 'corretor',
  nome TEXT NOT NULL,
  creci TEXT,
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  logo_url TEXT,
  capa_url TEXT,
  cidade_base TEXT,
  bairros_atuacao TEXT[],
  plano public.anunciante_plano NOT NULL DEFAULT 'free',
  sobre_html TEXT,
  website TEXT,
  instagram TEXT,
  facebook TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  total_imoveis INTEGER DEFAULT 0,
  total_leads INTEGER DEFAULT 0,
  rating_avg NUMERIC(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para anunciantes
CREATE UNIQUE INDEX idx_anunciantes_slug ON public.anunciantes(tenant_id, slug);
CREATE INDEX idx_anunciantes_cidade ON public.anunciantes(cidade_base);
CREATE INDEX idx_anunciantes_tipo ON public.anunciantes(tipo);
CREATE INDEX idx_anunciantes_user ON public.anunciantes(user_id);

-- =====================================================
-- TABELA: bairros_guia (Guia de Bairros)
-- =====================================================
CREATE TABLE public.bairros_guia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  cidade TEXT NOT NULL,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL,
  descricao_html TEXT,
  perfil_publico TEXT,
  infraestrutura TEXT,
  mobilidade TEXT,
  seguranca TEXT,
  escolas TEXT,
  lazer TEXT,
  comercio TEXT,
  faixa_preco_venda_min NUMERIC(12,2),
  faixa_preco_venda_max NUMERIC(12,2),
  faixa_preco_aluguel_min NUMERIC(12,2),
  faixa_preco_aluguel_max NUMERIC(12,2),
  imagem_capa TEXT,
  galeria TEXT[],
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT TRUE,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_bairros_slug ON public.bairros_guia(tenant_id, cidade, slug);
CREATE INDEX idx_bairros_cidade ON public.bairros_guia(cidade);

-- =====================================================
-- TABELA: imoveis
-- =====================================================
CREATE TABLE public.imoveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  anunciante_id UUID REFERENCES public.anunciantes(id) ON DELETE CASCADE,
  
  -- Identificação
  codigo TEXT,
  titulo TEXT NOT NULL,
  slug TEXT NOT NULL,
  
  -- Classificação
  finalidade public.imovel_finalidade NOT NULL DEFAULT 'venda',
  tipo public.imovel_tipo NOT NULL DEFAULT 'casa',
  
  -- Localização
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  endereco TEXT,
  numero TEXT,
  complemento TEXT,
  cep TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  mostrar_endereco_exato BOOLEAN DEFAULT FALSE,
  
  -- Valores
  preco NUMERIC(14,2),
  preco_anterior NUMERIC(14,2),
  preco_m2 NUMERIC(10,2),
  condominio_valor NUMERIC(10,2),
  iptu_valor NUMERIC(10,2),
  
  -- Características
  area_construida NUMERIC(10,2),
  area_terreno NUMERIC(10,2),
  quartos INTEGER DEFAULT 0,
  suites INTEGER DEFAULT 0,
  banheiros INTEGER DEFAULT 0,
  vagas INTEGER DEFAULT 0,
  
  -- Extras
  features JSONB DEFAULT '[]',
  proximidades JSONB DEFAULT '[]',
  
  -- Mídia
  video_url TEXT,
  tour_360_url TEXT,
  
  -- Conteúdo
  descricao_html TEXT,
  
  -- Status e controle
  status public.imovel_status NOT NULL DEFAULT 'rascunho',
  destaque BOOLEAN DEFAULT FALSE,
  lancamento BOOLEAN DEFAULT FALSE,
  aceita_financiamento BOOLEAN DEFAULT TRUE,
  aceita_permuta BOOLEAN DEFAULT FALSE,
  is_condominio BOOLEAN DEFAULT FALSE,
  
  -- SEO
  seo_title TEXT,
  seo_description TEXT,
  
  -- Métricas
  views_count INTEGER DEFAULT 0,
  leads_count INTEGER DEFAULT 0,
  favoritos_count INTEGER DEFAULT 0,
  
  -- Importação
  external_id TEXT,
  external_source TEXT,
  
  -- Timestamps
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para imoveis
CREATE UNIQUE INDEX idx_imoveis_slug ON public.imoveis(tenant_id, slug);
CREATE INDEX idx_imoveis_cidade_bairro ON public.imoveis(cidade, bairro);
CREATE INDEX idx_imoveis_finalidade ON public.imoveis(finalidade);
CREATE INDEX idx_imoveis_tipo ON public.imoveis(tipo);
CREATE INDEX idx_imoveis_preco ON public.imoveis(preco);
CREATE INDEX idx_imoveis_quartos ON public.imoveis(quartos);
CREATE INDEX idx_imoveis_status ON public.imoveis(status);
CREATE INDEX idx_imoveis_destaque ON public.imoveis(destaque) WHERE destaque = TRUE;
CREATE INDEX idx_imoveis_anunciante ON public.imoveis(anunciante_id);
CREATE INDEX idx_imoveis_geo ON public.imoveis(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX idx_imoveis_created ON public.imoveis(created_at DESC);
CREATE INDEX idx_imoveis_published ON public.imoveis(published_at DESC) WHERE status = 'ativo';

-- =====================================================
-- TABELA: imagens_imovel
-- =====================================================
CREATE TABLE public.imagens_imovel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT,
  ordem INTEGER DEFAULT 0,
  is_capa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_imagens_imovel ON public.imagens_imovel(imovel_id);
CREATE INDEX idx_imagens_ordem ON public.imagens_imovel(imovel_id, ordem);

-- =====================================================
-- TABELA: leads_imoveis
-- =====================================================
CREATE TABLE public.leads_imoveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  imovel_id UUID REFERENCES public.imoveis(id) ON DELETE SET NULL,
  anunciante_id UUID REFERENCES public.anunciantes(id) ON DELETE SET NULL,
  
  -- Dados do lead
  nome TEXT NOT NULL,
  telefone TEXT,
  whatsapp TEXT,
  email TEXT,
  mensagem TEXT,
  
  -- Qualificação
  intencao public.lead_intencao DEFAULT 'comprar',
  prazo TEXT,
  orcamento NUMERIC(14,2),
  
  -- Rastreamento
  origem TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  pagina_origem TEXT,
  ip_hash TEXT,
  
  -- Pipeline
  status public.lead_imovel_status NOT NULL DEFAULT 'novo',
  notas TEXT,
  
  -- Timestamps
  contatado_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_imovel ON public.leads_imoveis(imovel_id);
CREATE INDEX idx_leads_anunciante ON public.leads_imoveis(anunciante_id);
CREATE INDEX idx_leads_imoveis_status ON public.leads_imoveis(status);
CREATE INDEX idx_leads_created ON public.leads_imoveis(created_at DESC);

-- =====================================================
-- TABELA: favoritos_imoveis
-- =====================================================
CREATE TABLE public.favoritos_imoveis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  imovel_id UUID NOT NULL REFERENCES public.imoveis(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, imovel_id)
);

CREATE INDEX idx_favoritos_user ON public.favoritos_imoveis(user_id);
CREATE INDEX idx_favoritos_imovel ON public.favoritos_imoveis(imovel_id);

-- =====================================================
-- TABELA: buscas_salvas
-- =====================================================
CREATE TABLE public.buscas_imoveis_salvas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  filtros JSONB NOT NULL,
  notificar BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_buscas_user ON public.buscas_imoveis_salvas(user_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Anunciantes: público para leitura
ALTER TABLE public.anunciantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anunciantes públicos para leitura"
ON public.anunciantes FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Anunciantes podem editar próprio perfil"
ON public.anunciantes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem gerenciar anunciantes"
ON public.anunciantes FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Bairros: público para leitura
ALTER TABLE public.bairros_guia ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Bairros públicos para leitura"
ON public.bairros_guia FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admins podem gerenciar bairros"
ON public.bairros_guia FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Imóveis: público para ativos
ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Imóveis ativos são públicos"
ON public.imoveis FOR SELECT
USING (status = 'ativo');

CREATE POLICY "Anunciantes podem ver próprios imóveis"
ON public.imoveis FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.anunciantes a
    WHERE a.id = imoveis.anunciante_id AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Anunciantes podem gerenciar próprios imóveis"
ON public.imoveis FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.anunciantes a
    WHERE a.id = imoveis.anunciante_id AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem gerenciar todos imóveis"
ON public.imoveis FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Imagens: público se imóvel ativo
ALTER TABLE public.imagens_imovel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Imagens de imóveis ativos são públicas"
ON public.imagens_imovel FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.imoveis i
    WHERE i.id = imagens_imovel.imovel_id AND i.status = 'ativo'
  )
);

CREATE POLICY "Anunciantes podem gerenciar imagens de seus imóveis"
ON public.imagens_imovel FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.imoveis i
    JOIN public.anunciantes a ON a.id = i.anunciante_id
    WHERE i.id = imagens_imovel.imovel_id AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem gerenciar todas imagens"
ON public.imagens_imovel FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Leads: anunciante vê apenas os seus
ALTER TABLE public.leads_imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads podem ser criados por qualquer um"
ON public.leads_imoveis FOR INSERT
WITH CHECK (TRUE);

CREATE POLICY "Anunciantes podem ver seus leads"
ON public.leads_imoveis FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.anunciantes a
    WHERE a.id = leads_imoveis.anunciante_id AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Anunciantes podem atualizar seus leads"
ON public.leads_imoveis FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.anunciantes a
    WHERE a.id = leads_imoveis.anunciante_id AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem gerenciar todos leads"
ON public.leads_imoveis FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Favoritos: usuário vê apenas os seus
ALTER TABLE public.favoritos_imoveis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar seus favoritos"
ON public.favoritos_imoveis FOR ALL
USING (auth.uid() = user_id);

-- Buscas salvas: usuário vê apenas as suas
ALTER TABLE public.buscas_imoveis_salvas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem gerenciar suas buscas"
ON public.buscas_imoveis_salvas FOR ALL
USING (auth.uid() = user_id);

-- =====================================================
-- TRIGGERS para updated_at
-- =====================================================

CREATE TRIGGER update_anunciantes_updated_at
  BEFORE UPDATE ON public.anunciantes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bairros_guia_updated_at
  BEFORE UPDATE ON public.bairros_guia
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_imoveis_updated_at
  BEFORE UPDATE ON public.leads_imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Atualizar contador de imóveis do anunciante
CREATE OR REPLACE FUNCTION public.update_anunciante_imoveis_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.anunciantes
    SET total_imoveis = (
      SELECT COUNT(*) FROM public.imoveis
      WHERE anunciante_id = NEW.anunciante_id AND status = 'ativo'
    )
    WHERE id = NEW.anunciante_id;
  END IF;
  
  IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
    UPDATE public.anunciantes
    SET total_imoveis = (
      SELECT COUNT(*) FROM public.imoveis
      WHERE anunciante_id = OLD.anunciante_id AND status = 'ativo'
    )
    WHERE id = OLD.anunciante_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_anunciante_count
  AFTER INSERT OR UPDATE OR DELETE ON public.imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_anunciante_imoveis_count();

-- Atualizar contador de leads do anunciante
CREATE OR REPLACE FUNCTION public.update_anunciante_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.anunciantes
  SET total_leads = (
    SELECT COUNT(*) FROM public.leads_imoveis
    WHERE anunciante_id = NEW.anunciante_id
  )
  WHERE id = NEW.anunciante_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_anunciante_leads
  AFTER INSERT ON public.leads_imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_anunciante_leads_count();

-- Atualizar contador de leads do imóvel
CREATE OR REPLACE FUNCTION public.update_imovel_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.imovel_id IS NOT NULL THEN
    UPDATE public.imoveis
    SET leads_count = (
      SELECT COUNT(*) FROM public.leads_imoveis
      WHERE imovel_id = NEW.imovel_id
    )
    WHERE id = NEW.imovel_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_imovel_leads
  AFTER INSERT ON public.leads_imoveis
  FOR EACH ROW EXECUTE FUNCTION public.update_imovel_leads_count();

-- Incrementar visualizações do imóvel
CREATE OR REPLACE FUNCTION public.increment_imovel_views(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.imoveis SET views_count = views_count + 1 WHERE id = p_id;
END;
$$;