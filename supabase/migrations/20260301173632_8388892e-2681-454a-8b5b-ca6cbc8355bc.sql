-- Fix: Allow authenticated users to also see published news
DROP POLICY IF EXISTS "Notícias publicadas são públicas" ON public.news;

CREATE POLICY "Notícias publicadas são públicas"
ON public.news
FOR SELECT
TO public
USING (status = 'published' AND deleted_at IS NULL);
