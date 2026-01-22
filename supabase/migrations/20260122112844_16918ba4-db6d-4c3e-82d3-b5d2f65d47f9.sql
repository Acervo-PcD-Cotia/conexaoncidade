-- Inserir faixas de teste na playlist do Auto DJ (Conexão FM)
INSERT INTO broadcast_playlist_items (channel_id, title, artist, audio_url, duration_seconds, sort_order, is_active, genre)
VALUES 
  ('3223a2ab-7074-4921-86d9-bd1b000aa667', 'Acoustic Breeze', 'Benjamin Tissot', 'https://www.bensound.com/bensound-music/bensound-acousticbreeze.mp3', 234, 1, true, 'Acoustic'),
  ('3223a2ab-7074-4921-86d9-bd1b000aa667', 'Sunny', 'Benjamin Tissot', 'https://www.bensound.com/bensound-music/bensound-sunny.mp3', 140, 2, true, 'Acoustic'),
  ('3223a2ab-7074-4921-86d9-bd1b000aa667', 'Jazzy Frenchy', 'Benjamin Tissot', 'https://www.bensound.com/bensound-music/bensound-jazzyfrenchy.mp3', 128, 3, true, 'Jazz'),
  ('3223a2ab-7074-4921-86d9-bd1b000aa667', 'Little Idea', 'Benjamin Tissot', 'https://www.bensound.com/bensound-music/bensound-littleidea.mp3', 144, 4, true, 'Acoustic'),
  ('3223a2ab-7074-4921-86d9-bd1b000aa667', 'Happy Rock', 'Benjamin Tissot', 'https://www.bensound.com/bensound-music/bensound-happyrock.mp3', 105, 5, true, 'Rock');

-- Ativar configurações do Auto DJ para o canal de rádio
INSERT INTO broadcast_autodj_settings (channel_id, is_enabled, shuffle_mode, crossfade_seconds, fallback_enabled, volume_level)
VALUES ('3223a2ab-7074-4921-86d9-bd1b000aa667', true, true, 3, true, 80)
ON CONFLICT (channel_id) DO UPDATE SET 
  is_enabled = true, 
  shuffle_mode = true,
  crossfade_seconds = 3,
  fallback_enabled = true,
  volume_level = 80;

-- Inserir vídeos de teste na grade da TV (Conexão TV)
INSERT INTO broadcast_video_items (channel_id, title, video_url, video_type, youtube_id, thumbnail_url, duration_seconds, sort_order, is_active)
VALUES 
  ('ba005b02-2043-4669-83ff-5efcc2a6e113', 'Bem-vindo à Conexão TV', 'https://www.youtube.com/watch?v=jNQXAC9IVRw', 'youtube', 'jNQXAC9IVRw', 'https://img.youtube.com/vi/jNQXAC9IVRw/hqdefault.jpg', 19, 1, true),
  ('ba005b02-2043-4669-83ff-5efcc2a6e113', 'Notícias Locais', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'youtube', 'dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', 212, 2, true),
  ('ba005b02-2043-4669-83ff-5efcc2a6e113', 'Cultura e Entretenimento', 'https://www.youtube.com/watch?v=9bZkp7q19f0', 'youtube', '9bZkp7q19f0', 'https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg', 252, 3, true),
  ('ba005b02-2043-4669-83ff-5efcc2a6e113', 'Documentário Natureza', 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_1MB.mp4', 'external', NULL, NULL, 10, 4, true);