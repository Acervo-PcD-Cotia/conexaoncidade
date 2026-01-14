-- Adicionar campos para integração notícia-story
ALTER TABLE web_stories 
  ADD COLUMN IF NOT EXISTS news_id uuid REFERENCES news(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS audio_url text,
  ADD COLUMN IF NOT EXISTS audio_type text;

ALTER TABLE web_story_slides
  ADD COLUMN IF NOT EXISTS slide_audio_url text,
  ADD COLUMN IF NOT EXISTS headline_text text,
  ADD COLUMN IF NOT EXISTS subheadline_text text;

-- Índice para busca por news_id
CREATE INDEX IF NOT EXISTS idx_web_stories_news_id ON web_stories(news_id);

-- Comentários explicativos
COMMENT ON COLUMN web_stories.news_id IS 'Referência à notícia de origem do WebStory';
COMMENT ON COLUMN web_stories.audio_type IS 'Tipo de áudio: ambient ou narration';
COMMENT ON COLUMN web_story_slides.headline_text IS 'Texto de destaque do slide';
COMMENT ON COLUMN web_story_slides.subheadline_text IS 'Subtítulo do slide';