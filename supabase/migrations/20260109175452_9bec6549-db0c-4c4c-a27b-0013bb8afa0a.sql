-- Add new fields for enhanced news template
-- Summary fields for different lengths
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS summary_short TEXT;
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS summary_medium TEXT;

-- Transcript for audio accessibility
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS transcript_text TEXT;

-- Podcast control per news item
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS podcast_enabled BOOLEAN DEFAULT true;

-- Display-specific updated timestamp
ALTER TABLE public.news ADD COLUMN IF NOT EXISTS updated_at_display TIMESTAMPTZ;

-- Add comments for documentation
COMMENT ON COLUMN public.news.summary_short IS 'Short summary (~50 words, 30 seconds read)';
COMMENT ON COLUMN public.news.summary_medium IS 'Medium summary (~150 words, 90 seconds read)';
COMMENT ON COLUMN public.news.transcript_text IS 'Audio transcription or cleaned content for accessibility';
COMMENT ON COLUMN public.news.podcast_enabled IS 'Whether this news should appear in podcast RSS feed';
COMMENT ON COLUMN public.news.updated_at_display IS 'User-facing update timestamp (different from internal updated_at)';