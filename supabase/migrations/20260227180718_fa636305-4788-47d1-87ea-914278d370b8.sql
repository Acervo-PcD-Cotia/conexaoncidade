-- Add columns for external podcast media (upload, youtube, google drive)
ALTER TABLE public.news 
  ADD COLUMN IF NOT EXISTS podcast_media_type text DEFAULT 'tts',
  ADD COLUMN IF NOT EXISTS podcast_external_url text,
  ADD COLUMN IF NOT EXISTS podcast_video_url text;

-- podcast_media_type: 'tts' (ElevenLabs), 'upload' (mp3/m4a/mp4 uploaded), 'youtube', 'google_drive'
-- podcast_external_url: YouTube/YouTube Music/Google Drive link
-- podcast_video_url: mp4 video URL (storage or external)

COMMENT ON COLUMN public.news.podcast_media_type IS 'tts | upload | youtube | google_drive';
COMMENT ON COLUMN public.news.podcast_external_url IS 'External URL (YouTube, YouTube Music, Google Drive)';
COMMENT ON COLUMN public.news.podcast_video_url IS 'Video URL for mp4 podcasts';