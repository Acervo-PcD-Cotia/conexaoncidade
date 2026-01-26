-- =============================================
-- CONEXÃO ACADEMY - Tabelas e Políticas RLS
-- =============================================

-- 1. Categorias
CREATE TABLE public.academy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Cursos
CREATE TABLE public.academy_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.academy_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  instructor_name TEXT,
  duration_minutes INTEGER DEFAULT 0,
  visibility TEXT DEFAULT 'all' CHECK (visibility IN ('all', 'partners', 'admin')),
  is_published BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Aulas
CREATE TABLE public.academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.academy_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_html TEXT,
  video_embed TEXT,
  external_links JSONB DEFAULT '[]'::jsonb,
  duration_minutes INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Progresso do usuário
CREATE TABLE public.academy_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  lesson_id UUID NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, lesson_id)
);

-- Índices para performance
CREATE INDEX idx_academy_courses_category ON public.academy_courses(category_id);
CREATE INDEX idx_academy_courses_slug ON public.academy_courses(slug);
CREATE INDEX idx_academy_lessons_course ON public.academy_lessons(course_id);
CREATE INDEX idx_academy_progress_user ON public.academy_progress(user_id);
CREATE INDEX idx_academy_progress_lesson ON public.academy_progress(lesson_id);

-- Habilitar RLS
ALTER TABLE public.academy_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS DE LEITURA PÚBLICA
-- =============================================

-- Categorias ativas são públicas
CREATE POLICY "Categories are public" ON public.academy_categories
  FOR SELECT TO public USING (is_active = true);

-- Cursos publicados são públicos
CREATE POLICY "Published courses are public" ON public.academy_courses
  FOR SELECT TO public USING (is_published = true);

-- Aulas de cursos publicados são públicas
CREATE POLICY "Lessons from published courses are public" ON public.academy_lessons
  FOR SELECT TO public USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.academy_courses
      WHERE id = academy_lessons.course_id AND is_published = true
    )
  );

-- =============================================
-- POLÍTICAS DE PROGRESSO DO USUÁRIO
-- =============================================

-- Usuários gerenciam seu próprio progresso
CREATE POLICY "Users manage own progress" ON public.academy_progress
  FOR ALL TO authenticated USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =============================================
-- POLÍTICAS DE ADMINISTRAÇÃO
-- =============================================

-- Admins podem gerenciar categorias
CREATE POLICY "Admins manage categories" ON public.academy_categories
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'editor_chief')
    )
  );

-- Admins podem gerenciar cursos
CREATE POLICY "Admins manage courses" ON public.academy_courses
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'editor_chief')
    )
  );

-- Admins podem gerenciar aulas
CREATE POLICY "Admins manage lessons" ON public.academy_lessons
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('super_admin', 'admin', 'editor_chief')
    )
  );

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION public.update_academy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_academy_categories_updated_at
  BEFORE UPDATE ON public.academy_categories
  FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at();

CREATE TRIGGER update_academy_courses_updated_at
  BEFORE UPDATE ON public.academy_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at();

CREATE TRIGGER update_academy_lessons_updated_at
  BEFORE UPDATE ON public.academy_lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_academy_updated_at();