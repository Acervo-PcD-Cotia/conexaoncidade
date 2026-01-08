-- Tabela de histórico de importações
CREATE TABLE public.noticias_ai_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  source_url TEXT,
  source_name TEXT,
  source_badge TEXT,
  import_type TEXT DEFAULT 'individual',
  status TEXT DEFAULT 'success',
  error_message TEXT,
  format_corrected BOOLEAN DEFAULT false,
  news_id UUID REFERENCES public.news(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de fontes
CREATE TABLE public.noticias_ai_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain_pattern TEXT NOT NULL,
  badge TEXT NOT NULL,
  badge_color TEXT DEFAULT '#6B7280',
  parsing_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de agendamentos
CREATE TABLE public.noticias_ai_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  urls TEXT[] NOT NULL,
  interval TEXT NOT NULL,
  max_articles INTEGER DEFAULT 5,
  source_id UUID REFERENCES public.noticias_ai_sources(id),
  auto_publish BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de logs de agendamentos
CREATE TABLE public.noticias_ai_schedule_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES public.noticias_ai_schedules(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'success',
  articles_imported INTEGER DEFAULT 0,
  errors TEXT[],
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de progresso do usuário (gamificação)
CREATE TABLE public.noticias_ai_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'beginner',
  completed_milestones TEXT[] DEFAULT '{}',
  tour_completed BOOLEAN DEFAULT false,
  imports_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.noticias_ai_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias_ai_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias_ai_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias_ai_schedule_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias_ai_user_progress ENABLE ROW LEVEL SECURITY;

-- Policies para noticias_ai_imports
CREATE POLICY "Editores podem ver importações" ON public.noticias_ai_imports
  FOR SELECT USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Editores podem criar importações" ON public.noticias_ai_imports
  FOR INSERT WITH CHECK (is_admin_or_editor(auth.uid()));

-- Policies para noticias_ai_sources
CREATE POLICY "Fontes são públicas para leitura" ON public.noticias_ai_sources
  FOR SELECT USING (true);

CREATE POLICY "Editores podem gerenciar fontes" ON public.noticias_ai_sources
  FOR ALL USING (is_admin_or_editor(auth.uid()));

-- Policies para noticias_ai_schedules
CREATE POLICY "Editores podem ver agendamentos" ON public.noticias_ai_schedules
  FOR SELECT USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Editores podem gerenciar agendamentos" ON public.noticias_ai_schedules
  FOR ALL USING (is_admin_or_editor(auth.uid()));

-- Policies para noticias_ai_schedule_logs
CREATE POLICY "Editores podem ver logs" ON public.noticias_ai_schedule_logs
  FOR SELECT USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Sistema pode inserir logs" ON public.noticias_ai_schedule_logs
  FOR INSERT WITH CHECK (true);

-- Policies para noticias_ai_user_progress
CREATE POLICY "Usuários podem ver próprio progresso" ON public.noticias_ai_user_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprio progresso" ON public.noticias_ai_user_progress
  FOR ALL USING (auth.uid() = user_id);

-- Inserir fontes do sistema
INSERT INTO public.noticias_ai_sources (name, domain_pattern, badge, badge_color, is_system) VALUES
  ('Agência Brasil', 'agenciabrasil.ebc.com.br', 'AB', '#22C55E', true),
  ('G1', 'g1.globo.com', 'G1', '#EF4444', true),
  ('Folha de S.Paulo', 'folha.uol.com.br', 'FSP', '#1E3A8A', true),
  ('UOL', 'uol.com.br', 'UOL', '#F97316', true),
  ('Estadão', 'estadao.com.br', 'EST', '#3B82F6', true),
  ('CNN Brasil', 'cnnbrasil.com.br', 'CNN', '#991B1B', true),
  ('BBC', 'bbc.com', 'BBC', '#1F2937', true),
  ('R7', 'r7.com', 'R7', '#DC2626', true),
  ('Terra', 'terra.com.br', 'TRR', '#16A34A', true),
  ('iG', 'ig.com.br', 'iG', '#7C3AED', true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_noticias_ai_sources_updated_at
  BEFORE UPDATE ON public.noticias_ai_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_noticias_ai_schedules_updated_at
  BEFORE UPDATE ON public.noticias_ai_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_noticias_ai_user_progress_updated_at
  BEFORE UPDATE ON public.noticias_ai_user_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();