
-- =============================================
-- MÓDULO TRANSPORTE ESCOLAR - COTIA/SP
-- =============================================

-- 1. Tabela de Escolas (Catálogo Oficial)
CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_oficial TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  rede TEXT NOT NULL CHECK (rede IN ('municipal', 'estadual', 'particular')),
  bairro TEXT NOT NULL,
  endereco TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pendente', 'inativo')),
  tenant_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para schools
CREATE INDEX idx_schools_rede ON public.schools(rede);
CREATE INDEX idx_schools_bairro ON public.schools(bairro);
CREATE INDEX idx_schools_nome ON public.schools(nome_oficial);
CREATE INDEX idx_schools_status ON public.schools(status);
CREATE INDEX idx_schools_tenant ON public.schools(tenant_id);

-- 2. Tabela de Transportadores
CREATE TABLE public.transporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  whatsapp TEXT NOT NULL UNIQUE,
  telefone TEXT,
  descricao_curta TEXT CHECK (char_length(descricao_curta) <= 240),
  nivel_verificacao INTEGER DEFAULT 0 CHECK (nivel_verificacao BETWEEN 0 AND 3),
  atende_acessibilidade BOOLEAN DEFAULT false,
  acessibilidade_tipos TEXT[] DEFAULT '{}',
  tipo_servico TEXT NOT NULL CHECK (tipo_servico IN ('porta_a_porta', 'ponto_encontro', 'ambos')),
  veiculo_tipo TEXT NOT NULL CHECK (veiculo_tipo IN ('van', 'kombi', 'micro_onibus', 'onibus', 'carro')),
  capacidade_aprox INTEGER,
  ar_condicionado BOOLEAN DEFAULT false,
  cinto_individual BOOLEAN DEFAULT false,
  vagas_status TEXT DEFAULT 'tenho_vagas' CHECK (vagas_status IN ('tenho_vagas', 'sem_vagas', 'lista_espera')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('ativo', 'pendente', 'bloqueado')),
  tenant_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para transporters
CREATE INDEX idx_transporters_status ON public.transporters(status);
CREATE INDEX idx_transporters_verificacao ON public.transporters(nivel_verificacao);
CREATE INDEX idx_transporters_acessibilidade ON public.transporters(atende_acessibilidade);
CREATE INDEX idx_transporters_tenant ON public.transporters(tenant_id);

-- 3. Tabela de Relação Transportador-Escola (N:N)
CREATE TABLE public.transporter_schools (
  transporter_id UUID NOT NULL REFERENCES public.transporters(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (transporter_id, school_id)
);

-- Índices para transporter_schools
CREATE INDEX idx_transporter_schools_school ON public.transporter_schools(school_id);
CREATE INDEX idx_transporter_schools_transporter ON public.transporter_schools(transporter_id);

-- 4. Tabela de Áreas de Cobertura (Bairro/Turno)
CREATE TABLE public.transporter_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID NOT NULL REFERENCES public.transporters(id) ON DELETE CASCADE,
  bairro TEXT NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'noite', 'integral')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para transporter_areas
CREATE INDEX idx_transporter_areas_bairro ON public.transporter_areas(bairro);
CREATE INDEX idx_transporter_areas_turno ON public.transporter_areas(turno);
CREATE INDEX idx_transporter_areas_transporter ON public.transporter_areas(transporter_id);

-- 5. Tabela de Leads/Solicitações de Pais
CREATE TABLE public.transport_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rede TEXT NOT NULL CHECK (rede IN ('municipal', 'estadual', 'particular', 'nao_sei')),
  school_id UUID REFERENCES public.schools(id),
  school_texto TEXT,
  bairro TEXT NOT NULL,
  turno TEXT NOT NULL CHECK (turno IN ('manha', 'tarde', 'noite', 'integral')),
  acessibilidade TEXT[] DEFAULT '{}',
  contato_whatsapp TEXT NOT NULL,
  consentimento BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'em_andamento', 'concluido')),
  tenant_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para transport_leads
CREATE INDEX idx_transport_leads_status ON public.transport_leads(status);
CREATE INDEX idx_transport_leads_bairro ON public.transport_leads(bairro);
CREATE INDEX idx_transport_leads_tenant ON public.transport_leads(tenant_id);

-- 6. Tabela de Denúncias
CREATE TABLE public.transport_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID REFERENCES public.transporters(id),
  school_id UUID REFERENCES public.schools(id),
  motivo TEXT NOT NULL CHECK (motivo IN ('contato_invalido', 'comportamento_inadequado', 'golpe', 'outros')),
  descricao TEXT CHECK (char_length(descricao) <= 800),
  contato TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'revisando', 'resolvido')),
  tenant_id UUID REFERENCES public.sites(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para transport_reports
CREATE INDEX idx_transport_reports_status ON public.transport_reports(status);
CREATE INDEX idx_transport_reports_transporter ON public.transport_reports(transporter_id);
CREATE INDEX idx_transport_reports_tenant ON public.transport_reports(tenant_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporter_schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transporter_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transport_reports ENABLE ROW LEVEL SECURITY;

-- Schools: Leitura pública de escolas ativas
CREATE POLICY "Escolas ativas são públicas"
  ON public.schools FOR SELECT
  USING (status = 'ativo');

CREATE POLICY "Admins podem gerenciar escolas"
  ON public.schools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Transporters: Leitura pública de transportadores ativos
CREATE POLICY "Transportadores ativos são públicos"
  ON public.transporters FOR SELECT
  USING (status = 'ativo');

CREATE POLICY "Qualquer pessoa pode cadastrar transportador"
  ON public.transporters FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar transportadores"
  ON public.transporters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Transporter Schools: Leitura pública
CREATE POLICY "Relação escola-transportador é pública"
  ON public.transporter_schools FOR SELECT
  USING (true);

CREATE POLICY "Qualquer pessoa pode vincular escola"
  ON public.transporter_schools FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar vínculos"
  ON public.transporter_schools FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Transporter Areas: Leitura pública
CREATE POLICY "Áreas de cobertura são públicas"
  ON public.transporter_areas FOR SELECT
  USING (true);

CREATE POLICY "Qualquer pessoa pode cadastrar área"
  ON public.transporter_areas FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar áreas"
  ON public.transporter_areas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Transport Leads: Inserção pública, leitura admin
CREATE POLICY "Qualquer pessoa pode criar lead"
  ON public.transport_leads FOR INSERT
  WITH CHECK (consentimento = true);

CREATE POLICY "Admins podem ver leads"
  ON public.transport_leads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins podem gerenciar leads"
  ON public.transport_leads FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- Transport Reports: Inserção pública, leitura admin
CREATE POLICY "Qualquer pessoa pode denunciar"
  ON public.transport_reports FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins podem ver denúncias"
  ON public.transport_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Admins podem gerenciar denúncias"
  ON public.transport_reports FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_schools_updated_at
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transporters_updated_at
  BEFORE UPDATE ON public.transporters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA GERAR SLUG
-- =============================================

CREATE OR REPLACE FUNCTION public.generate_school_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := lower(
      regexp_replace(
        regexp_replace(
          unaccent(NEW.nome_oficial || '-' || NEW.rede || '-' || NEW.bairro),
          '[^a-zA-Z0-9\s-]', '', 'g'
        ),
        '\s+', '-', 'g'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_school_slug_trigger
  BEFORE INSERT OR UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_school_slug();
