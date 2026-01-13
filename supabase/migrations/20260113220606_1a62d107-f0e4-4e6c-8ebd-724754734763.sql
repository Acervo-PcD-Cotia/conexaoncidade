-- Add category column to community_posts if not exists
ALTER TABLE public.community_posts 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'geral';