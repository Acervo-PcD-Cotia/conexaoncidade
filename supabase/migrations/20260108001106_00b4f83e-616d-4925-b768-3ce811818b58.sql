-- =========================================
-- EVOLUÇÃO DO SISTEMA ADMINISTRATIVO
-- =========================================

-- 1. Adicionar campos para quick_notes (agendamento)
ALTER TABLE public.quick_notes 
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published' 
  CHECK (status IN ('draft', 'published', 'scheduled'));

-- 2. Adicionar parent_id para subcategorias
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 3. Criar tabela de page views para analytics real
CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  story_id UUID REFERENCES public.web_stories(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT page_views_content_check CHECK (
    (news_id IS NOT NULL AND story_id IS NULL) OR 
    (news_id IS NULL AND story_id IS NOT NULL)
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_page_views_news ON public.page_views(news_id) WHERE news_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_story ON public.page_views(story_id) WHERE story_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_page_views_created ON public.page_views(created_at DESC);

-- RLS para page_views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode inserir (tracking público)
CREATE POLICY "Anyone can insert page views" ON public.page_views
FOR INSERT WITH CHECK (true);

-- Apenas admins/editores podem ver analytics
CREATE POLICY "Admins can view page views" ON public.page_views
FOR SELECT USING (is_admin_or_editor(auth.uid()));

-- 4. Criar tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- RLS para configurações
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage settings" ON public.system_settings
FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Editors can view settings" ON public.system_settings
FOR SELECT USING (is_admin_or_editor(auth.uid()));

-- Inserir configurações padrão
INSERT INTO public.system_settings (key, value) VALUES
  ('notifications', '{"editorial_alerts": true, "daily_summary": false, "draft_alert_days": 7}'),
  ('email', '{"sender_name": "Conexão na Cidade", "sender_address": "noreply@conexaonacidade.com.br"}'),
  ('analytics', '{"track_page_views": true, "track_ad_clicks": true}')
ON CONFLICT (key) DO NOTHING;

-- 5. Atualizar quick_notes existentes para ter status correto
UPDATE public.quick_notes 
SET status = CASE 
  WHEN is_active = true THEN 'published'
  ELSE 'draft'
END
WHERE status IS NULL;