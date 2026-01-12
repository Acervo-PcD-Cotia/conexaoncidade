-- Adicionar campos de editor na tabela news
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS editor_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS editor_name text;

COMMENT ON COLUMN public.news.editor_id IS 'ID do editor responsável pela revisão';
COMMENT ON COLUMN public.news.editor_name IS 'Nome do editor (sobrescreve editor_id se preenchido)';