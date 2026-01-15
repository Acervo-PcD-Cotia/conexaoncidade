-- Adicionar campos booleanos para destaques individuais
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_home_highlight boolean DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_urgent boolean DEFAULT false;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

-- Adicionar campo para auto-gerar WebStory
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS auto_generate_webstory boolean DEFAULT true;

-- Alterar defaults para podcast
ALTER TABLE public.news ALTER COLUMN auto_generate_podcast SET DEFAULT true;
ALTER TABLE public.news ALTER COLUMN auto_publish_podcast SET DEFAULT true;

-- Alterar default do status para published
ALTER TABLE public.news ALTER COLUMN status SET DEFAULT 'published';