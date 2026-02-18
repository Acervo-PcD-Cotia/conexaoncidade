-- Add daily_max_items column to regional_sources
ALTER TABLE public.regional_sources 
ADD COLUMN IF NOT EXISTS daily_max_items integer DEFAULT 20;

COMMENT ON COLUMN public.regional_sources.daily_max_items IS 'Maximum number of items to ingest per day from this source. NULL = unlimited.';