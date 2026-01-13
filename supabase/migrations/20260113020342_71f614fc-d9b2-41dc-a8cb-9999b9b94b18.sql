-- Campos de acessibilidade para phone_catalog
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS accessibility_score INTEGER DEFAULT 0;
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS accessibility_features TEXT[] DEFAULT '{}';
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS accessibility_badges TEXT[] DEFAULT '{}';
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS screen_size DECIMAL(3,1);
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS has_physical_buttons BOOLEAN DEFAULT false;
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS has_nfc BOOLEAN DEFAULT false;
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS weight_grams INTEGER;
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS water_resistant BOOLEAN DEFAULT false;
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS drop_resistant BOOLEAN DEFAULT false;
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS has_emergency_sos BOOLEAN DEFAULT false;
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS speaker_quality TEXT DEFAULT 'normal';
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS vibration_strength TEXT DEFAULT 'normal';
ALTER TABLE public.phone_catalog ADD COLUMN IF NOT EXISTS import_source TEXT;

-- Índice para busca por acessibilidade
CREATE INDEX IF NOT EXISTS idx_phone_catalog_accessibility 
ON public.phone_catalog(accessibility_score DESC) 
WHERE is_active = true;