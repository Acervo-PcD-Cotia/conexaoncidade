
-- =============================================
-- CONEXÃO ACADEMY - MÓDULO ENEM 2026
-- Redação Nota 1000 + IA Corretora + IA Tutor
-- =============================================

-- Módulos ENEM (Redação, Linguagens, Humanas, etc.)
CREATE TABLE public.enem_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  year INTEGER NOT NULL DEFAULT 2026,
  icon TEXT DEFAULT 'BookOpen',
  cover_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Semanas de cada módulo (progressão sequencial)
CREATE TABLE public.enem_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.enem_modules(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  unlock_rule TEXT DEFAULT 'sequential', -- 'sequential' | 'date' | 'manual'
  unlock_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(module_id, week_number)
);

-- Aulas/Conteúdos de cada semana
CREATE TABLE public.enem_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES public.enem_weeks(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'video', -- 'video' | 'texto' | 'exercicio' | 'redacao'
  title TEXT NOT NULL,
  description TEXT,
  content_html TEXT,
  video_url TEXT,
  video_embed TEXT,
  duration_minutes INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Progresso do aluno por aula
CREATE TABLE public.enem_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.enem_lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked', -- 'locked' | 'available' | 'in_progress' | 'completed'
  progress_percent INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Submissões de redações
CREATE TABLE public.enem_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID REFERENCES public.enem_lessons(id) ON DELETE SET NULL,
  week_id UUID REFERENCES public.enem_weeks(id) ON DELETE SET NULL,
  theme TEXT NOT NULL,
  content TEXT NOT NULL,
  word_count INTEGER DEFAULT 0,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  
  -- Correção IA Corretora
  correction_status TEXT DEFAULT 'pending', -- 'pending' | 'correcting' | 'completed' | 'error'
  corrected_at TIMESTAMPTZ,
  
  -- Notas por competência (0-200 cada)
  score_c1 INTEGER, -- Norma Padrão
  score_c2 INTEGER, -- Compreensão do Tema
  score_c3 INTEGER, -- Argumentação
  score_c4 INTEGER, -- Coesão e Coerência
  score_c5 INTEGER, -- Proposta de Intervenção
  score_total INTEGER, -- Soma (0-1000)
  
  -- Feedback detalhado
  feedback_corretora JSONB, -- Análise completa da IA Corretora
  feedback_tutor JSONB, -- Orientação evolutiva da IA Tutor
  
  -- Diagnóstico
  diagnosis_level TEXT, -- 'iniciante' | 'intermediário' | 'avançado'
  diagnosis_strong_point TEXT,
  diagnosis_weak_point TEXT,
  diagnosis_recurring_error TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Histórico de erros do aluno (para IA Tutor)
CREATE TABLE public.enem_error_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  submission_id UUID REFERENCES public.enem_submissions(id) ON DELETE CASCADE,
  competency INTEGER NOT NULL, -- 1-5
  error_type TEXT NOT NULL,
  error_description TEXT,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Progresso semanal consolidado
CREATE TABLE public.enem_weekly_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_id UUID NOT NULL REFERENCES public.enem_weeks(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'locked', -- 'locked' | 'available' | 'in_progress' | 'completed'
  lessons_completed INTEGER DEFAULT 0,
  lessons_total INTEGER DEFAULT 0,
  unlocked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_id)
);

-- Índices para performance
CREATE INDEX idx_enem_weeks_module ON public.enem_weeks(module_id);
CREATE INDEX idx_enem_lessons_week ON public.enem_lessons(week_id);
CREATE INDEX idx_enem_progress_user ON public.enem_progress(user_id);
CREATE INDEX idx_enem_submissions_user ON public.enem_submissions(user_id);
CREATE INDEX idx_enem_submissions_status ON public.enem_submissions(correction_status);
CREATE INDEX idx_enem_error_history_user ON public.enem_error_history(user_id);
CREATE INDEX idx_enem_weekly_progress_user ON public.enem_weekly_progress(user_id);

-- Enable RLS
ALTER TABLE public.enem_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_error_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enem_weekly_progress ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (conteúdo do curso)
CREATE POLICY "Módulos ENEM visíveis para todos"
  ON public.enem_modules FOR SELECT
  USING (is_active = true);

CREATE POLICY "Semanas ENEM visíveis para todos"
  ON public.enem_weeks FOR SELECT
  USING (is_active = true);

CREATE POLICY "Aulas ENEM visíveis para todos"
  ON public.enem_lessons FOR SELECT
  USING (is_published = true);

-- Políticas de progresso (apenas próprio usuário)
CREATE POLICY "Usuário vê próprio progresso ENEM"
  ON public.enem_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza próprio progresso ENEM"
  ON public.enem_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário modifica próprio progresso ENEM"
  ON public.enem_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas de submissões
CREATE POLICY "Usuário vê próprias redações"
  ON public.enem_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário envia próprias redações"
  ON public.enem_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuário atualiza próprias redações"
  ON public.enem_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas de histórico de erros
CREATE POLICY "Usuário vê próprio histórico de erros"
  ON public.enem_error_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Sistema insere histórico de erros"
  ON public.enem_error_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas de progresso semanal
CREATE POLICY "Usuário vê próprio progresso semanal"
  ON public.enem_weekly_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuário gerencia próprio progresso semanal"
  ON public.enem_weekly_progress FOR ALL
  USING (auth.uid() = user_id);

-- =============================================
-- SEED: Módulo Redação Nota 1000
-- =============================================

-- Inserir módulo principal
INSERT INTO public.enem_modules (slug, title, description, year, icon, sort_order) VALUES
('redacao-nota-1000', 'Redação Nota 1000', 'Formação estratégica completa para alcançar nota máxima na redação do ENEM 2026', 2026, 'PenTool', 1),
('linguagens', 'Linguagens e Códigos', 'Português, Literatura, Língua Estrangeira e Artes', 2026, 'BookOpen', 2),
('humanas', 'Ciências Humanas', 'História, Geografia, Filosofia e Sociologia', 2026, 'Globe', 3),
('matematica', 'Matemática', 'Matemática e suas Tecnologias', 2026, 'Calculator', 4),
('natureza', 'Ciências da Natureza', 'Física, Química e Biologia', 2026, 'FlaskConical', 5);

-- Inserir semanas do módulo Redação
WITH redacao_module AS (
  SELECT id FROM public.enem_modules WHERE slug = 'redacao-nota-1000'
)
INSERT INTO public.enem_weeks (module_id, week_number, title, description) VALUES
((SELECT id FROM redacao_module), 1, 'Como o ENEM Corrige', 'Entenda a matriz de correção oficial e o que a banca realmente avalia em cada competência'),
((SELECT id FROM redacao_module), 2, 'Mapa da Redação Nota 1000', 'Estrutura I + D1 + D2 + C com o Método 2–2–1 para organização perfeita'),
((SELECT id FROM redacao_module), 3, 'Repertório Inteligente', 'Como construir e usar repertório sociocultural de forma produtiva e pertinente'),
((SELECT id FROM redacao_module), 4, 'Argumentação de Alta Nota', 'Técnicas avançadas de argumentação para atingir nível 5 na Competência 3'),
((SELECT id FROM redacao_module), 5, 'Proposta de Intervenção A.A.M.F.D', 'Agente, Ação, Meio, Finalidade e Detalhamento para Competência 5 perfeita'),
((SELECT id FROM redacao_module), 6, 'Linguagem e Erros que Tiram 1000', 'Erros gramaticais mais penalizados e como evitá-los definitivamente'),
((SELECT id FROM redacao_module), 7, 'Produção Orientada I', 'Primeira redação completa com correção detalhada e feedback evolutivo'),
((SELECT id FROM redacao_module), 8, 'Produção Orientada II', 'Segunda redação com análise comparativa de evolução'),
((SELECT id FROM redacao_module), 9, 'Aluno como Corretor', 'Aprenda a identificar erros corrigindo redações de outros alunos'),
((SELECT id FROM redacao_module), 10, 'Simulação ENEM 2026', 'Simulado oficial com condições reais de prova');

-- Inserir aulas da Semana 1
WITH semana1 AS (
  SELECT id FROM public.enem_weeks WHERE week_number = 1 AND module_id = (SELECT id FROM public.enem_modules WHERE slug = 'redacao-nota-1000')
)
INSERT INTO public.enem_lessons (week_id, type, title, description, sort_order, is_mandatory) VALUES
((SELECT id FROM semana1), 'video', 'Bem-vindo ao Redação Nota 1000', 'Apresentação do método e expectativas do curso', 1, true),
((SELECT id FROM semana1), 'texto', 'A Matriz de Correção Oficial', 'Documento completo com os critérios de avaliação do INEP', 2, true),
((SELECT id FROM semana1), 'video', 'As 5 Competências Explicadas', 'Análise detalhada de cada competência e seus níveis', 3, true),
((SELECT id FROM semana1), 'video', 'O que Zera uma Redação', 'Situações que levam à nota zero e como evitá-las', 4, true),
((SELECT id FROM semana1), 'exercicio', 'Quiz: Entendendo a Correção', 'Teste seus conhecimentos sobre a matriz de correção', 5, true);

-- Inserir aulas da Semana 2
WITH semana2 AS (
  SELECT id FROM public.enem_weeks WHERE week_number = 2 AND module_id = (SELECT id FROM public.enem_modules WHERE slug = 'redacao-nota-1000')
)
INSERT INTO public.enem_lessons (week_id, type, title, description, sort_order, is_mandatory) VALUES
((SELECT id FROM semana2), 'video', 'Estrutura I + D1 + D2 + C', 'A estrutura padrão das redações nota 1000', 1, true),
((SELECT id FROM semana2), 'video', 'O Método 2–2–1', 'Organização ideal de parágrafos para máxima clareza', 2, true),
((SELECT id FROM semana2), 'texto', 'Análise de Redação Nota 1000', 'Estudo de caso de uma redação que atingiu nota máxima', 3, true),
((SELECT id FROM semana2), 'exercicio', 'Prática: Planejando sua Estrutura', 'Exercício de planejamento estrutural', 4, true);

-- Inserir aulas da Semana 5 (Proposta de Intervenção)
WITH semana5 AS (
  SELECT id FROM public.enem_weeks WHERE week_number = 5 AND module_id = (SELECT id FROM public.enem_modules WHERE slug = 'redacao-nota-1000')
)
INSERT INTO public.enem_lessons (week_id, type, title, description, sort_order, is_mandatory) VALUES
((SELECT id FROM semana5), 'video', 'O que é uma Proposta de Intervenção', 'Definição e importância para a nota final', 1, true),
((SELECT id FROM semana5), 'video', 'A Fórmula A.A.M.F.D', 'Agente, Ação, Meio, Finalidade e Detalhamento', 2, true),
((SELECT id FROM semana5), 'texto', 'Propostas que Zeraram vs Nota Máxima', 'Comparativo entre propostas fracas e excelentes', 3, true),
((SELECT id FROM semana5), 'video', 'Erros Comuns na Proposta', 'Genericidade, inviabilidade e falta de detalhamento', 4, true),
((SELECT id FROM semana5), 'exercicio', 'Prática: Construindo Propostas', 'Exercício de criação de propostas completas', 5, true);

-- Inserir aulas da Semana 7 (Produção Orientada I)
WITH semana7 AS (
  SELECT id FROM public.enem_weeks WHERE week_number = 7 AND module_id = (SELECT id FROM public.enem_modules WHERE slug = 'redacao-nota-1000')
)
INSERT INTO public.enem_lessons (week_id, type, title, description, sort_order, is_mandatory) VALUES
((SELECT id FROM semana7), 'video', 'Orientações para sua Primeira Redação', 'Instruções e tema da redação', 1, true),
((SELECT id FROM semana7), 'texto', 'Coletânea de Textos Motivadores', 'Material de apoio para a redação', 2, true),
((SELECT id FROM semana7), 'redacao', 'Redação da Semana 7', 'Sua primeira redação completa para correção', 3, true);
