-- Add new status values to news_status enum
ALTER TYPE news_status ADD VALUE IF NOT EXISTS 'review';
ALTER TYPE news_status ADD VALUE IF NOT EXISTS 'approved';

-- Add new roles to app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'editor_chief';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'reporter';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'collaborator';

-- Create quick_notes table for rapid publication
CREATE TABLE public.quick_notes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id),
    author_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.quick_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Notas rápidas publicadas são públicas"
ON public.quick_notes FOR SELECT
USING (is_active = true);

CREATE POLICY "Editores podem gerenciar notas rápidas"
ON public.quick_notes FOR ALL
USING (is_admin_or_editor(auth.uid()))
WITH CHECK (is_admin_or_editor(auth.uid()));

-- Create home_config table for editorial home management
CREATE TABLE public.home_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    block_name TEXT NOT NULL UNIQUE,
    news_ids UUID[] DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.home_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Home config é pública para leitura"
ON public.home_config FOR SELECT
USING (true);

CREATE POLICY "Editores podem gerenciar home config"
ON public.home_config FOR ALL
USING (is_admin_or_editor(auth.uid()))
WITH CHECK (is_admin_or_editor(auth.uid()));

-- Create audit_logs table for tracking changes
CREATE TABLE public.audit_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem ver logs"
ON public.audit_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Sistema pode inserir logs"
ON public.audit_logs FOR INSERT
WITH CHECK (true);

-- Add source and image fields to news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}';

-- Create trigger for quick_notes updated_at
CREATE TRIGGER update_quick_notes_updated_at
BEFORE UPDATE ON public.quick_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for home_config updated_at
CREATE TRIGGER update_home_config_updated_at
BEFORE UPDATE ON public.home_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default home config blocks
INSERT INTO public.home_config (block_name, settings) VALUES
('main_headline', '{"quantity": 1}'),
('agora_na_cidade', '{"quantity": 8, "mode": "auto"}'),
('ultimas_noticias', '{"quantity": 20, "mode": "auto"}'),
('notas_rapidas', '{"quantity": 18, "mode": "auto"}'),
('mais_lidas', '{"quantity": 10, "period": "week"}')
ON CONFLICT (block_name) DO NOTHING;

-- Create news-images storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('news-images', 'news-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies for news-images bucket
CREATE POLICY "Imagens de notícias são públicas"
ON storage.objects FOR SELECT
USING (bucket_id = 'news-images');

CREATE POLICY "Editores podem fazer upload de imagens"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'news-images' AND is_admin_or_editor(auth.uid()));

CREATE POLICY "Editores podem deletar imagens"
ON storage.objects FOR DELETE
USING (bucket_id = 'news-images' AND is_admin_or_editor(auth.uid()));