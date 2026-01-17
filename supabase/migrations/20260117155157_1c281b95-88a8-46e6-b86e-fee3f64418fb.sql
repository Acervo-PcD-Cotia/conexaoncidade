-- =============================================
-- MÓDULO DE CLASSIFICADOS
-- =============================================

CREATE TABLE public.classifieds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('veiculos', 'imoveis', 'eletronicos', 'moveis', 'servicos', 'animais', 'moda', 'outros')),
  price DECIMAL(12,2),
  is_negotiable BOOLEAN DEFAULT false,
  contact_name TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,
  images TEXT[] DEFAULT '{}',
  location TEXT,
  neighborhood TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sold', 'expired')),
  rejection_reason TEXT,
  views_count INT DEFAULT 0,
  favorites_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT now() + interval '30 days',
  approved_at TIMESTAMPTZ,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_classifieds_status ON public.classifieds(status);
CREATE INDEX idx_classifieds_category ON public.classifieds(category);
CREATE INDEX idx_classifieds_neighborhood ON public.classifieds(neighborhood);
CREATE INDEX idx_classifieds_user_id ON public.classifieds(user_id);
CREATE INDEX idx_classifieds_created_at ON public.classifieds(created_at DESC);

-- RLS
ALTER TABLE public.classifieds ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver classificados aprovados
CREATE POLICY "Public can view approved classifieds"
ON public.classifieds FOR SELECT
USING (status = 'approved' AND expires_at > now());

-- Usuários autenticados podem ver seus próprios classificados
CREATE POLICY "Users can view own classifieds"
ON public.classifieds FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem criar classificados
CREATE POLICY "Users can create classifieds"
ON public.classifieds FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar seus próprios classificados
CREATE POLICY "Users can update own classifieds"
ON public.classifieds FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem deletar seus próprios classificados
CREATE POLICY "Users can delete own classifieds"
ON public.classifieds FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Admins podem fazer tudo
CREATE POLICY "Admins can manage all classifieds"
ON public.classifieds FOR ALL
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Favoritos de classificados
CREATE TABLE public.classified_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classified_id UUID REFERENCES public.classifieds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(classified_id, user_id)
);

ALTER TABLE public.classified_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
ON public.classified_favorites FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- =============================================
-- MÓDULO DE EMPREGOS
-- =============================================

CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  company_logo TEXT,
  company_website TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  benefits TEXT,
  salary_min DECIMAL(12,2),
  salary_max DECIMAL(12,2),
  salary_type TEXT DEFAULT 'mensal' CHECK (salary_type IN ('mensal', 'hora', 'projeto', 'a_combinar')),
  job_type TEXT NOT NULL CHECK (job_type IN ('clt', 'pj', 'estagio', 'temporario', 'freelancer', 'jovem_aprendiz')),
  work_mode TEXT DEFAULT 'presencial' CHECK (work_mode IN ('presencial', 'hibrido', 'remoto')),
  location TEXT,
  neighborhood TEXT,
  category TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  application_link TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'closed', 'expired')),
  is_featured BOOLEAN DEFAULT false,
  views_count INT DEFAULT 0,
  applications_count INT DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT now() + interval '60 days',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_jobs_status ON public.jobs(status);
CREATE INDEX idx_jobs_job_type ON public.jobs(job_type);
CREATE INDEX idx_jobs_work_mode ON public.jobs(work_mode);
CREATE INDEX idx_jobs_category ON public.jobs(category);
CREATE INDEX idx_jobs_created_at ON public.jobs(created_at DESC);

-- RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver vagas ativas
CREATE POLICY "Public can view active jobs"
ON public.jobs FOR SELECT
USING (status = 'active' AND expires_at > now());

-- Usuários podem ver suas próprias vagas
CREATE POLICY "Users can view own jobs"
ON public.jobs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem criar vagas
CREATE POLICY "Users can create jobs"
ON public.jobs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Usuários podem atualizar suas vagas
CREATE POLICY "Users can update own jobs"
ON public.jobs FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Admins podem fazer tudo
CREATE POLICY "Admins can manage all jobs"
ON public.jobs FOR ALL
TO authenticated
USING (public.is_admin_or_editor(auth.uid()));

-- Candidaturas
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  linkedin_url TEXT,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'viewed', 'shortlisted', 'rejected', 'hired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);

ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver suas próprias candidaturas
CREATE POLICY "Users can view own applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Usuários podem se candidatar
CREATE POLICY "Users can create applications"
ON public.job_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Donos das vagas podem ver candidaturas
CREATE POLICY "Job owners can view applications"
ON public.job_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = job_id AND user_id = auth.uid()
  )
);

-- Donos das vagas podem atualizar status
CREATE POLICY "Job owners can update applications"
ON public.job_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.jobs 
    WHERE id = job_id AND user_id = auth.uid()
  )
);

-- Vagas salvas
CREATE TABLE public.job_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(job_id, user_id)
);

ALTER TABLE public.job_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own saves"
ON public.job_saves FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_classifieds_updated_at
  BEFORE UPDATE ON public.classifieds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
  BEFORE UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para incrementar views
CREATE OR REPLACE FUNCTION public.increment_classified_views(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.classifieds SET views_count = views_count + 1 WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_job_views(p_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.jobs SET views_count = views_count + 1 WHERE id = p_id;
END;
$$;