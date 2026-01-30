-- Add column to preserve original publication date from source
ALTER TABLE news ADD COLUMN IF NOT EXISTS original_published_at TIMESTAMPTZ;