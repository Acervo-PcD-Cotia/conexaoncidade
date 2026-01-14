-- =============================================
-- ANALYTICS DE LEITURA DE NOTÍCIAS
-- =============================================

CREATE TABLE public.news_reading_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.sites(id),
  session_id TEXT NOT NULL,
  user_id UUID,
  
  -- Métricas de leitura
  time_on_page_seconds INTEGER DEFAULT 0,
  scroll_depth_percent INTEGER DEFAULT 0,
  scroll_depth_max INTEGER DEFAULT 0,
  
  -- Interações com áudio
  audio_played BOOLEAN DEFAULT false,
  audio_play_count INTEGER DEFAULT 0,
  audio_total_listen_seconds INTEGER DEFAULT 0,
  podcast_played BOOLEAN DEFAULT false,
  podcast_play_count INTEGER DEFAULT 0,
  
  -- Outras interações
  summary_expanded BOOLEAN DEFAULT false,
  toc_clicked BOOLEAN DEFAULT false,
  shared BOOLEAN DEFAULT false,
  share_platform TEXT,
  
  -- Contexto
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  viewport_width INTEGER,
  read_completed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(news_id, session_id)
);

-- Índices para consultas rápidas
CREATE INDEX idx_news_reading_analytics_news_id ON news_reading_analytics(news_id);
CREATE INDEX idx_news_reading_analytics_created_at ON news_reading_analytics(created_at);
CREATE INDEX idx_news_reading_analytics_session ON news_reading_analytics(session_id);
CREATE INDEX idx_news_reading_analytics_tenant ON news_reading_analytics(tenant_id);

-- RLS - Permitir inserts anônimos para tracking
ALTER TABLE news_reading_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts for tracking" ON news_reading_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow updates for same session" ON news_reading_analytics
  FOR UPDATE USING (true);

CREATE POLICY "Admins can read all analytics" ON news_reading_analytics
  FOR SELECT USING (public.is_admin_or_editor(auth.uid()));

-- =============================================
-- PREFERÊNCIAS DE PUSH POR CATEGORIA
-- =============================================

CREATE TABLE public.user_push_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id)
);

CREATE INDEX idx_user_push_preferences_user ON user_push_preferences(user_id);
CREATE INDEX idx_user_push_preferences_category ON user_push_preferences(category_id);

-- RLS
ALTER TABLE user_push_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_push_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_push_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_push_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_push_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_user_push_preferences_updated_at
  BEFORE UPDATE ON user_push_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_reading_analytics_updated_at
  BEFORE UPDATE ON news_reading_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();