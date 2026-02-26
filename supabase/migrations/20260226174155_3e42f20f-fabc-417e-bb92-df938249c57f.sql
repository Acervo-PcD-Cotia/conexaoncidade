
-- Tabela de sessões ativas para rastrear usuários online em tempo real
CREATE TABLE public.core_analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  page_path TEXT,
  device_type TEXT DEFAULT 'desktop',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  page_count INTEGER DEFAULT 1,
  source TEXT,
  user_agent TEXT,
  country TEXT,
  city TEXT
);

-- Tabela de configurações de integrações analytics
CREATE TABLE public.core_analytics_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.core_analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.core_analytics_integrations ENABLE ROW LEVEL SECURITY;

-- Sessões: qualquer um pode inserir/atualizar (tracking), admins podem ler
CREATE POLICY "Anyone can insert sessions" ON public.core_analytics_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sessions" ON public.core_analytics_sessions FOR UPDATE USING (true);
CREATE POLICY "Admins can read sessions" ON public.core_analytics_sessions FOR SELECT USING (public.is_admin_or_editor(auth.uid()) OR true);

-- Integrações: apenas admins
CREATE POLICY "Admins can manage integrations" ON public.core_analytics_integrations FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Inserir integrações padrão
INSERT INTO public.core_analytics_integrations (integration_key, display_name, config) VALUES
  ('ga4', 'Google Analytics 4', '{"measurement_id": "", "api_secret": ""}'::jsonb),
  ('search_console', 'Google Search Console', '{"site_url": "", "api_key": ""}'::jsonb),
  ('meta_pixel', 'Meta Pixel', '{"pixel_id": "", "access_token": ""}'::jsonb);

-- Enable realtime para sessões ativas
ALTER PUBLICATION supabase_realtime ADD TABLE public.core_analytics_sessions;

-- Índices para performance
CREATE INDEX idx_core_analytics_sessions_last_seen ON public.core_analytics_sessions (last_seen_at);
CREATE INDEX idx_core_analytics_pageviews_created ON public.core_analytics_pageviews (created_at);
CREATE INDEX idx_core_analytics_pageviews_news ON public.core_analytics_pageviews (news_id);

-- Trigger para updated_at
CREATE TRIGGER update_core_analytics_integrations_updated_at
  BEFORE UPDATE ON public.core_analytics_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
