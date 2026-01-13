-- Tabela de avaliações de locais
CREATE TABLE public.community_location_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES public.community_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  accessibility_rating INTEGER CHECK (accessibility_rating >= 1 AND accessibility_rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(location_id, user_id)
);

-- Índices para performance
CREATE INDEX idx_location_reviews_location ON public.community_location_reviews(location_id);
CREATE INDEX idx_location_reviews_user ON public.community_location_reviews(user_id);

-- Adicionar colunas de média na tabela de locais
ALTER TABLE public.community_locations 
ADD COLUMN IF NOT EXISTS avg_rating NUMERIC(2,1) DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION,
ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

-- Habilitar RLS
ALTER TABLE public.community_location_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can read reviews" ON public.community_location_reviews
  FOR SELECT USING (true);

CREATE POLICY "Community members can create reviews" ON public.community_location_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.community_members 
      WHERE user_id = auth.uid() AND access_granted_at IS NOT NULL
    )
  );

CREATE POLICY "Users can update own reviews" ON public.community_location_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.community_location_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar média de avaliações
CREATE OR REPLACE FUNCTION public.update_location_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.community_locations SET
    avg_rating = (
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) 
      FROM public.community_location_reviews 
      WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM public.community_location_reviews 
      WHERE location_id = COALESCE(NEW.location_id, OLD.location_id)
    )
  WHERE id = COALESCE(NEW.location_id, OLD.location_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para atualizar média automaticamente
CREATE TRIGGER trigger_update_location_rating
AFTER INSERT OR UPDATE OR DELETE ON public.community_location_reviews
FOR EACH ROW EXECUTE FUNCTION public.update_location_rating();