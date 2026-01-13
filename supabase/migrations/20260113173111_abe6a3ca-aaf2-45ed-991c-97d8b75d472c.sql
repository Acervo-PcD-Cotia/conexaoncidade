-- Adicionar novos campos à tabela campaign_leads
ALTER TABLE campaign_leads
ADD COLUMN IF NOT EXISTS neighborhood TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}';

-- Atualizar trigger para nova pontuação simplificada
CREATE OR REPLACE FUNCTION calculate_lead_score()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Cadastro completo base: 10 pontos
  NEW.estimated_points := 10;
  
  -- Link do Google Maps: +5 pontos
  IF NEW.google_maps_link IS NOT NULL AND NEW.google_maps_link != '' THEN
    NEW.estimated_points := NEW.estimated_points + 5;
  END IF;
  
  -- Avaliação autorizada: +10 pontos
  IF NEW.authorized_review THEN
    NEW.estimated_points := NEW.estimated_points + 10;
  END IF;
  
  -- Fotos autorizadas: +5 pontos
  IF NEW.authorized_photos THEN
    NEW.estimated_points := NEW.estimated_points + 5;
  END IF;
  
  -- Correções autorizadas: +5 pontos
  IF NEW.authorized_corrections THEN
    NEW.estimated_points := NEW.estimated_points + 5;
  END IF;
  
  -- Guia Local autorizado: +5 pontos
  IF NEW.authorized_local_guide THEN
    NEW.estimated_points := NEW.estimated_points + 5;
  END IF;
  
  -- Determinar prioridade baseada na pontuação
  IF NEW.estimated_points >= 25 THEN
    NEW.priority := 'high';
  ELSIF NEW.estimated_points >= 15 THEN
    NEW.priority := 'medium';
  ELSE
    NEW.priority := 'low';
  END IF;
  
  NEW.updated_at := now();
  
  RETURN NEW;
END;
$$;