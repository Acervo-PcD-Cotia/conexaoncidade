-- 1. Adicionar suporte a review_id em reports
ALTER TABLE public.community_reports 
ADD COLUMN IF NOT EXISTS review_id UUID REFERENCES public.community_location_reviews(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_reports_review ON public.community_reports(review_id);

-- 2. Tabela de favoritos
CREATE TABLE public.community_location_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  location_id UUID NOT NULL REFERENCES public.community_locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, location_id)
);

CREATE INDEX idx_favorites_user ON public.community_location_favorites(user_id);
CREATE INDEX idx_favorites_location ON public.community_location_favorites(location_id);

-- RLS
ALTER TABLE public.community_location_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own favorites" ON public.community_location_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON public.community_location_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON public.community_location_favorites
  FOR DELETE USING (auth.uid() = user_id);