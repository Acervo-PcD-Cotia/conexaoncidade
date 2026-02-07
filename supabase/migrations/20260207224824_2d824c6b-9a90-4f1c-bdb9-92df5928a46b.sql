
-- 1. Tabela news_clicks (tracking de circulacao de noticias)
CREATE TABLE public.news_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  news_id UUID NOT NULL REFERENCES public.news(id) ON DELETE CASCADE,
  ref_code TEXT NULL,
  src TEXT NOT NULL DEFAULT 'direct',
  referrer TEXT NULL,
  user_agent TEXT NULL,
  device_type TEXT NULL,
  browser TEXT NULL,
  ip_hash TEXT NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_news_clicks_news_date ON public.news_clicks(news_id, clicked_at);
CREATE INDEX idx_news_clicks_ref ON public.news_clicks(ref_code, clicked_at);
CREATE INDEX idx_news_clicks_src ON public.news_clicks(src, clicked_at);

ALTER TABLE public.news_clicks ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (tracking publico)
CREATE POLICY "Tracking publico insere news_clicks"
  ON public.news_clicks FOR INSERT WITH CHECK (true);

-- Admins/editors podem ler
CREATE POLICY "Admin le news_clicks"
  ON public.news_clicks FOR SELECT
  USING (is_admin_or_editor(auth.uid()));

-- Membros podem ler seus proprios cliques (por ref_code)
CREATE POLICY "Membro le proprios news_clicks"
  ON public.news_clicks FOR SELECT
  USING (
    ref_code IS NOT NULL AND
    ref_code = (
      SELECT ref_code FROM public.community_members
      WHERE user_id = auth.uid()
      LIMIT 1
    )
  );

-- 2. Adicionar ref_code aos membros da comunidade
ALTER TABLE public.community_members
  ADD COLUMN IF NOT EXISTS ref_code TEXT UNIQUE;

-- Gerar ref_code automatico para membros existentes
UPDATE public.community_members
SET ref_code = LOWER(SUBSTR(MD5(user_id::text), 1, 8))
WHERE ref_code IS NULL;

-- Trigger para gerar ref_code em novos membros
CREATE OR REPLACE FUNCTION generate_member_ref_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_code IS NULL THEN
    NEW.ref_code := LOWER(SUBSTR(MD5(NEW.user_id::text), 1, 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_member_ref_code
  BEFORE INSERT ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION generate_member_ref_code();
