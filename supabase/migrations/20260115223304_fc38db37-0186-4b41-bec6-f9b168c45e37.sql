-- Remover a constraint existente
ALTER TABLE public.noticias_ai_imports
DROP CONSTRAINT noticias_ai_imports_news_id_fkey;

-- Recriar com ON DELETE CASCADE
ALTER TABLE public.noticias_ai_imports
ADD CONSTRAINT noticias_ai_imports_news_id_fkey
  FOREIGN KEY (news_id) 
  REFERENCES public.news(id) 
  ON DELETE CASCADE;