-- Criar tabela de contas/configurações de redes sociais
CREATE TABLE public.social_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    platform TEXT NOT NULL CHECK (platform IN ('meta_facebook', 'meta_instagram', 'x', 'linkedin', 'telegram')),
    enabled BOOLEAN NOT NULL DEFAULT false,
    credentials_encrypted JSONB DEFAULT '{}'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (platform)
);

-- Criar tabela de posts sociais (fila)
CREATE TABLE public.social_posts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    news_id UUID REFERENCES public.news(id) ON DELETE CASCADE,
    platform TEXT NOT NULL CHECK (platform IN ('meta_facebook', 'meta_instagram', 'x', 'linkedin', 'telegram')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'needs_review', 'posting', 'posted', 'failed', 'cancelled')),
    scheduled_at TIMESTAMPTZ,
    posted_at TIMESTAMPTZ,
    external_post_id TEXT,
    external_post_url TEXT,
    payload JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    retries_count INTEGER NOT NULL DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de logs sociais
CREATE TABLE public.social_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    social_post_id UUID REFERENCES public.social_posts(id) ON DELETE CASCADE,
    level TEXT NOT NULL DEFAULT 'info' CHECK (level IN ('info', 'warn', 'error')),
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de configurações sociais por notícia
CREATE TABLE public.news_social_settings (
    news_id UUID PRIMARY KEY REFERENCES public.news(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT true,
    mode TEXT NOT NULL DEFAULT 'auto' CHECK (mode IN ('auto', 'review')),
    platforms TEXT[] DEFAULT ARRAY['meta_facebook', 'meta_instagram', 'x', 'linkedin', 'telegram'],
    scheduled_at TIMESTAMPTZ,
    image_source TEXT DEFAULT 'hero' CHECK (image_source IN ('hero', 'og', 'card', 'custom')),
    custom_image_url TEXT,
    custom_captions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_social_posts_status ON public.social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON public.social_posts(scheduled_at) WHERE status = 'queued';
CREATE INDEX idx_social_posts_news ON public.social_posts(news_id);
CREATE INDEX idx_social_logs_post ON public.social_logs(social_post_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_social_accounts_updated_at
    BEFORE UPDATE ON public.social_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
    BEFORE UPDATE ON public.social_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_news_social_settings_updated_at
    BEFORE UPDATE ON public.news_social_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_social_settings ENABLE ROW LEVEL SECURITY;

-- Políticas para social_accounts
CREATE POLICY "Admins podem gerenciar contas sociais"
    ON public.social_accounts FOR ALL
    USING (has_role(auth.uid(), 'admin'))
    WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Editores podem ver contas sociais"
    ON public.social_accounts FOR SELECT
    USING (is_admin_or_editor(auth.uid()));

-- Políticas para social_posts
CREATE POLICY "Editores podem gerenciar posts sociais"
    ON public.social_posts FOR ALL
    USING (is_admin_or_editor(auth.uid()))
    WITH CHECK (is_admin_or_editor(auth.uid()));

CREATE POLICY "Sistema pode inserir posts sociais"
    ON public.social_posts FOR INSERT
    WITH CHECK (true);

-- Políticas para social_logs
CREATE POLICY "Editores podem ver logs sociais"
    ON public.social_logs FOR SELECT
    USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Sistema pode inserir logs sociais"
    ON public.social_logs FOR INSERT
    WITH CHECK (true);

-- Políticas para news_social_settings
CREATE POLICY "Editores podem gerenciar configurações sociais de notícias"
    ON public.news_social_settings FOR ALL
    USING (is_admin_or_editor(auth.uid()))
    WITH CHECK (is_admin_or_editor(auth.uid()));

-- Função para criar posts sociais automaticamente
CREATE OR REPLACE FUNCTION public.create_social_posts_on_publish()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_settings news_social_settings;
    v_platform TEXT;
    v_mode TEXT;
    v_status TEXT;
    v_account social_accounts;
    v_canonical_url TEXT;
    v_payload JSONB;
BEGIN
    -- Apenas quando status muda para published
    IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
        -- Buscar configurações da notícia
        SELECT * INTO v_settings FROM news_social_settings WHERE news_id = NEW.id;
        
        -- Se não existe configuração ou está desabilitado, usar padrão
        IF v_settings IS NULL OR v_settings.enabled = false THEN
            RETURN NEW;
        END IF;
        
        v_mode := COALESCE(v_settings.mode, 'auto');
        v_canonical_url := 'https://conexaonacidade.com.br/noticia/' || NEW.slug;
        
        -- Para cada plataforma habilitada
        FOREACH v_platform IN ARRAY COALESCE(v_settings.platforms, ARRAY['meta_facebook', 'x', 'linkedin', 'telegram'])
        LOOP
            -- Verificar se a conta está habilitada
            SELECT * INTO v_account FROM social_accounts WHERE platform = v_platform AND enabled = true;
            
            IF v_account IS NOT NULL THEN
                v_status := CASE WHEN v_mode = 'auto' THEN 'queued' ELSE 'needs_review' END;
                
                v_payload := jsonb_build_object(
                    'title', COALESCE(NEW.meta_title, NEW.title),
                    'description', COALESCE(NEW.meta_description, NEW.excerpt),
                    'link', v_canonical_url,
                    'image', CASE v_settings.image_source
                        WHEN 'og' THEN COALESCE(NEW.og_image_url, NEW.featured_image_url)
                        WHEN 'card' THEN COALESCE(NEW.card_image_url, NEW.featured_image_url)
                        WHEN 'custom' THEN COALESCE(v_settings.custom_image_url, NEW.featured_image_url)
                        ELSE NEW.featured_image_url
                    END,
                    'custom_caption', COALESCE(v_settings.custom_captions->v_platform, null)
                );
                
                INSERT INTO social_posts (
                    news_id,
                    platform,
                    status,
                    scheduled_at,
                    payload,
                    created_by
                ) VALUES (
                    NEW.id,
                    v_platform,
                    v_status,
                    v_settings.scheduled_at,
                    v_payload,
                    NEW.author_id
                );
                
                -- Log da criação
                INSERT INTO social_logs (social_post_id, level, message, details)
                SELECT id, 'info', 'Post criado automaticamente', jsonb_build_object('platform', v_platform, 'mode', v_mode)
                FROM social_posts WHERE news_id = NEW.id AND platform = v_platform
                ORDER BY created_at DESC LIMIT 1;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Trigger para criar posts sociais automaticamente
CREATE TRIGGER trigger_create_social_posts
    AFTER UPDATE ON public.news
    FOR EACH ROW
    EXECUTE FUNCTION public.create_social_posts_on_publish();