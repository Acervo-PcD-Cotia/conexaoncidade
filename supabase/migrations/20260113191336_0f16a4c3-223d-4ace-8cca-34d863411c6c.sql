-- Tabela principal de respostas do Censo PcD Cotia
CREATE TABLE public.censo_pcd_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Bloco 1: Perfil do Respondente
  respondente_tipo TEXT NOT NULL CHECK (respondente_tipo IN ('pcd', 'responsavel', 'cuidador')),
  nome_completo TEXT NOT NULL,
  data_nascimento DATE NOT NULL,
  sexo TEXT NOT NULL CHECK (sexo IN ('masculino', 'feminino', 'nao_informar')),
  bairro TEXT NOT NULL,
  
  -- Bloco 2: Deficiência/TEA
  tipos_deficiencia TEXT[] NOT NULL,
  possui_laudo TEXT NOT NULL CHECK (possui_laudo IN ('sim', 'nao', 'em_processo')),
  nivel_suporte_tea TEXT CHECK (nivel_suporte_tea IN ('nivel1', 'nivel2', 'nivel3')),
  
  -- Bloco 3: Saúde e Atendimento
  recebe_acompanhamento_medico BOOLEAN NOT NULL,
  atendimentos_necessarios TEXT[],
  local_atendimento TEXT CHECK (local_atendimento IN ('sus', 'particular', 'convenio', 'nenhum')),
  em_fila_espera BOOLEAN,
  
  -- Bloco 4: Educação
  matriculado_escola TEXT CHECK (matriculado_escola IN ('municipal', 'estadual', 'particular', 'nao_matriculado')),
  apoio_educacional TEXT CHECK (apoio_educacional IN ('sim', 'parcial', 'nao')),
  necessidades_educacionais TEXT[],
  
  -- Bloco 5: Assistência e Renda
  beneficio_recebido TEXT[],
  renda_suficiente BOOLEAN,
  
  -- Bloco 6: Prioridades e Contato
  maior_necessidade TEXT NOT NULL,
  autoriza_contato BOOLEAN NOT NULL,
  
  -- Contato opcional
  telefone_whatsapp TEXT,
  email TEXT,
  
  -- Metadados
  consentimento_lgpd BOOLEAN NOT NULL DEFAULT false,
  ebook_downloaded BOOLEAN DEFAULT false,
  ebook_sent_whatsapp BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de notificações para admins
CREATE TABLE public.censo_pcd_admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID REFERENCES public.censo_pcd_responses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('new_response', 'weekly_summary')),
  sent_at TIMESTAMPTZ,
  recipients TEXT[],
  summary_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_censo_pcd_bairro ON public.censo_pcd_responses(bairro);
CREATE INDEX idx_censo_pcd_deficiencia ON public.censo_pcd_responses USING GIN(tipos_deficiencia);
CREATE INDEX idx_censo_pcd_created ON public.censo_pcd_responses(created_at);
CREATE INDEX idx_censo_pcd_maior_necessidade ON public.censo_pcd_responses(maior_necessidade);
CREATE INDEX idx_censo_notifications_type ON public.censo_pcd_admin_notifications(type);

-- Habilitar RLS
ALTER TABLE public.censo_pcd_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.censo_pcd_admin_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas para censo_pcd_responses
-- Qualquer um pode inserir (formulário público com consentimento LGPD)
CREATE POLICY "Permitir inserção pública com consentimento" 
ON public.censo_pcd_responses 
FOR INSERT 
WITH CHECK (consentimento_lgpd = true);

-- Apenas admins podem ler
CREATE POLICY "Apenas admins podem ler respostas" 
ON public.censo_pcd_responses 
FOR SELECT 
USING (public.is_admin_or_editor(auth.uid()));

-- Apenas admins podem atualizar
CREATE POLICY "Apenas admins podem atualizar respostas" 
ON public.censo_pcd_responses 
FOR UPDATE 
USING (public.is_admin_or_editor(auth.uid()));

-- Políticas para censo_pcd_admin_notifications
CREATE POLICY "Apenas admins podem ver notificações" 
ON public.censo_pcd_admin_notifications 
FOR SELECT 
USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Apenas admins podem inserir notificações" 
ON public.censo_pcd_admin_notifications 
FOR INSERT 
WITH CHECK (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Apenas admins podem atualizar notificações" 
ON public.censo_pcd_admin_notifications 
FOR UPDATE 
USING (public.is_admin_or_editor(auth.uid()));

-- Trigger para updated_at
CREATE TRIGGER update_censo_pcd_responses_updated_at
  BEFORE UPDATE ON public.censo_pcd_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();