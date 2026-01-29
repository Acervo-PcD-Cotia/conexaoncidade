-- =====================================================
-- MÓDULO BRASILEIRÃO - TABELAS PARA SYNC SEM API PAGA
-- =====================================================

-- 1. br_sources: Controle de fontes de dados
CREATE TABLE public.br_sources (
    key TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    kind TEXT NOT NULL CHECK (kind IN ('rss', 'html')),
    last_etag TEXT,
    last_modified TEXT,
    last_success_at TIMESTAMPTZ,
    last_error TEXT,
    error_count INT DEFAULT 0,
    is_enabled BOOL DEFAULT true,
    scrape_interval_minutes INT DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. br_news_items: Notícias externas capturadas via RSS
CREATE TABLE public.br_news_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_key TEXT NOT NULL REFERENCES public.br_sources(key) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    image_url TEXT,
    published_at TIMESTAMPTZ,
    author TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. br_generated_news: Conteúdo original gerado pelo portal
CREATE TABLE public.br_generated_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    related_match_id UUID REFERENCES public.football_matches(id) ON DELETE SET NULL,
    related_round INT,
    news_type TEXT NOT NULL CHECK (news_type IN ('round_recap', 'standings_change', 'where_to_watch', 'preview', 'highlight')),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. br_broadcasts: Onde assistir (transmissões)
CREATE TABLE public.br_broadcasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL UNIQUE REFERENCES public.football_matches(id) ON DELETE CASCADE,
    tv_open TEXT[] DEFAULT '{}',
    tv_closed TEXT[] DEFAULT '{}',
    streaming TEXT[] DEFAULT '{}',
    updated_from TEXT DEFAULT 'manual' CHECK (updated_from IN ('ge', 'cbf', 'manual')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. br_fetch_logs: Logs de sincronização
CREATE TABLE public.br_fetch_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_key TEXT NOT NULL REFERENCES public.br_sources(key) ON DELETE CASCADE,
    success BOOL NOT NULL,
    message TEXT,
    items_processed INT DEFAULT 0,
    duration_ms INT,
    fetched_at TIMESTAMPTZ DEFAULT now()
);

-- 6. br_rate_state: Controle de rate limit e circuit breaker
CREATE TABLE public.br_rate_state (
    source_key TEXT PRIMARY KEY REFERENCES public.br_sources(key) ON DELETE CASCADE,
    tokens REAL DEFAULT 10,
    last_refill TIMESTAMPTZ DEFAULT now(),
    circuit_open BOOL DEFAULT false,
    circuit_open_until TIMESTAMPTZ
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_br_news_items_source ON public.br_news_items(source_key);
CREATE INDEX idx_br_news_items_published ON public.br_news_items(published_at DESC);
CREATE INDEX idx_br_generated_news_status ON public.br_generated_news(status);
CREATE INDEX idx_br_generated_news_type ON public.br_generated_news(news_type);
CREATE INDEX idx_br_generated_news_published ON public.br_generated_news(published_at DESC);
CREATE INDEX idx_br_fetch_logs_source ON public.br_fetch_logs(source_key);
CREATE INDEX idx_br_fetch_logs_fetched ON public.br_fetch_logs(fetched_at DESC);

-- =====================================================
-- TRIGGER PARA updated_at
-- =====================================================

CREATE TRIGGER update_br_sources_updated_at
    BEFORE UPDATE ON public.br_sources
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_br_generated_news_updated_at
    BEFORE UPDATE ON public.br_generated_news
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_br_broadcasts_updated_at
    BEFORE UPDATE ON public.br_broadcasts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- RLS POLICIES (usando user_roles)
-- =====================================================

-- br_sources: Leitura pública, escrita apenas admin
ALTER TABLE public.br_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "br_sources_public_read" ON public.br_sources
    FOR SELECT USING (true);

CREATE POLICY "br_sources_admin_write" ON public.br_sources
    FOR ALL USING (
        public.is_admin_or_editor(auth.uid())
    );

-- br_news_items: Leitura pública, escrita apenas sistema/admin
ALTER TABLE public.br_news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "br_news_items_public_read" ON public.br_news_items
    FOR SELECT USING (true);

CREATE POLICY "br_news_items_admin_write" ON public.br_news_items
    FOR ALL USING (
        public.is_admin_or_editor(auth.uid())
    );

-- br_generated_news: Leitura pública (publicados), escrita admin
ALTER TABLE public.br_generated_news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "br_generated_news_public_read" ON public.br_generated_news
    FOR SELECT USING (
        status = 'published' OR public.is_admin_or_editor(auth.uid())
    );

CREATE POLICY "br_generated_news_admin_write" ON public.br_generated_news
    FOR ALL USING (
        public.is_admin_or_editor(auth.uid())
    );

-- br_broadcasts: Leitura pública, escrita admin
ALTER TABLE public.br_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "br_broadcasts_public_read" ON public.br_broadcasts
    FOR SELECT USING (true);

CREATE POLICY "br_broadcasts_admin_write" ON public.br_broadcasts
    FOR ALL USING (
        public.is_admin_or_editor(auth.uid())
    );

-- br_fetch_logs: Leitura apenas admin
ALTER TABLE public.br_fetch_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "br_fetch_logs_admin_only" ON public.br_fetch_logs
    FOR ALL USING (
        public.is_admin_or_editor(auth.uid())
    );

-- br_rate_state: Leitura apenas admin
ALTER TABLE public.br_rate_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "br_rate_state_admin_only" ON public.br_rate_state
    FOR ALL USING (
        public.is_admin_or_editor(auth.uid())
    );

-- =====================================================
-- DADOS INICIAIS: Fontes configuradas
-- =====================================================

INSERT INTO public.br_sources (key, name, url, kind, scrape_interval_minutes) VALUES
    ('cbf_standings', 'CBF - Tabela Série A', 'https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a/2026', 'html', 120),
    ('cbf_matches', 'CBF - Jogos Série A', 'https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a/2026', 'html', 60),
    ('ge_rss', 'Globo Esporte - RSS Brasileirão', 'https://ge.globo.com/rss/futebol/brasileirao-serie-a/', 'rss', 15),
    ('ogol_rss', 'oGol - RSS Futebol', 'https://www.ogol.com.br/rss.php', 'rss', 30)
ON CONFLICT (key) DO NOTHING;

-- Inicializar rate state para cada fonte
INSERT INTO public.br_rate_state (source_key, tokens, last_refill)
SELECT key, 10, now() FROM public.br_sources
ON CONFLICT (source_key) DO NOTHING;