-- ===========================================
-- SISTEMA CONEXÃO AO VIVO - WEB RÁDIO & WEB TV
-- ===========================================

-- Canais de transmissão (Conexão Rádio, Conexão TV)
CREATE TABLE public.broadcast_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('radio', 'tv')),
  description TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Programas (Jornal da Manhã, Debate Cidadão, etc.)
CREATE TABLE public.broadcast_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.broadcast_channels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  host_name TEXT,
  host_user_id UUID,
  category TEXT,
  default_day_of_week INTEGER CHECK (default_day_of_week BETWEEN 0 AND 6),
  default_start_time TIME,
  default_duration_minutes INTEGER DEFAULT 60,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Transmissões ao vivo e gravadas
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.broadcast_programs(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES public.broadcast_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'live' CHECK (type IN ('live', 'scheduled', 'replay', 'playlist')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  livekit_room_name TEXT,
  livekit_room_id TEXT,
  recording_url TEXT,
  podcast_url TEXT,
  thumbnail_url TEXT,
  viewer_count INTEGER DEFAULT 0,
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  news_id UUID REFERENCES public.news(id) ON DELETE SET NULL,
  is_featured BOOLEAN DEFAULT false,
  has_captions BOOLEAN DEFAULT true,
  allow_chat BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, slug)
);

-- Participantes de uma transmissão
CREATE TABLE public.broadcast_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  user_id UUID,
  role TEXT NOT NULL CHECK (role IN ('host', 'co_host', 'guest', 'producer', 'viewer')),
  display_name TEXT NOT NULL,
  title_label TEXT,
  avatar_url TEXT,
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  is_camera_on BOOLEAN DEFAULT true,
  is_mic_on BOOLEAN DEFAULT true,
  is_screen_sharing BOOLEAN DEFAULT false,
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Grade de programação semanal
CREATE TABLE public.broadcast_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.sites(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES public.broadcast_channels(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.broadcast_programs(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_live BOOLEAN DEFAULT true,
  is_recurring BOOLEAN DEFAULT true,
  fallback_content_url TEXT,
  fallback_content_type TEXT CHECK (fallback_content_type IN ('playlist', 'replay', 'silence')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Transcrições e legendas em tempo real
CREATE TABLE public.broadcast_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL,
  speaker_id UUID REFERENCES public.broadcast_participants(id) ON DELETE SET NULL,
  speaker_name TEXT,
  text TEXT NOT NULL,
  is_final BOOLEAN DEFAULT false,
  language TEXT DEFAULT 'pt-BR',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chat ao vivo
CREATE TABLE public.broadcast_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  user_id UUID,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  message TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  deleted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Analytics de visualização
CREATE TABLE public.broadcast_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broadcast_id UUID REFERENCES public.broadcasts(id) ON DELETE CASCADE,
  user_id UUID,
  session_id TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ,
  watch_duration_seconds INTEGER,
  device_type TEXT,
  platform TEXT,
  country_code TEXT,
  region_code TEXT,
  city TEXT
);

-- Playlist para rádio offline
CREATE TABLE public.broadcast_playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.broadcast_channels(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INTEGER,
  artist TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.broadcast_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_playlist_items ENABLE ROW LEVEL SECURITY;

-- Public read policies for active channels and broadcasts
CREATE POLICY "Public can view active channels" ON public.broadcast_channels
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view active programs" ON public.broadcast_programs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can view public broadcasts" ON public.broadcasts
  FOR SELECT USING (is_public = true);

CREATE POLICY "Public can view schedule" ON public.broadcast_schedule
  FOR SELECT USING (true);

CREATE POLICY "Public can view transcripts" ON public.broadcast_transcripts
  FOR SELECT USING (true);

CREATE POLICY "Public can view chat messages" ON public.broadcast_chat_messages
  FOR SELECT USING (is_deleted = false);

CREATE POLICY "Public can view playlist items" ON public.broadcast_playlist_items
  FOR SELECT USING (is_active = true);

-- Authenticated users can send chat messages
CREATE POLICY "Authenticated users can send chat messages" ON public.broadcast_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Authenticated users can create analytics
CREATE POLICY "Anyone can create analytics" ON public.broadcast_analytics
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own analytics" ON public.broadcast_analytics
  FOR SELECT USING (true);

-- Admin policies using is_admin_or_editor function
CREATE POLICY "Admins can manage channels" ON public.broadcast_channels
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage programs" ON public.broadcast_programs
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage broadcasts" ON public.broadcasts
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage participants" ON public.broadcast_participants
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage schedule" ON public.broadcast_schedule
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage transcripts" ON public.broadcast_transcripts
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage chat" ON public.broadcast_chat_messages
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

CREATE POLICY "Admins can manage playlist" ON public.broadcast_playlist_items
  FOR ALL USING (public.is_admin_or_editor(auth.uid()));

-- Participants can view their own info
CREATE POLICY "Participants can view own info" ON public.broadcast_participants
  FOR SELECT USING (
    user_id = auth.uid() OR 
    invite_token IS NOT NULL
  );

-- Enable realtime for live features
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_transcripts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcast_participants;

-- Create indexes for performance
CREATE INDEX idx_broadcasts_status ON public.broadcasts(status);
CREATE INDEX idx_broadcasts_channel ON public.broadcasts(channel_id);
CREATE INDEX idx_broadcasts_scheduled ON public.broadcasts(scheduled_start);
CREATE INDEX idx_broadcast_schedule_day ON public.broadcast_schedule(day_of_week, start_time);
CREATE INDEX idx_broadcast_transcripts_broadcast ON public.broadcast_transcripts(broadcast_id, timestamp_ms);
CREATE INDEX idx_broadcast_chat_broadcast ON public.broadcast_chat_messages(broadcast_id, created_at);

-- Create storage bucket for recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'broadcast-recordings',
  'broadcast-recordings',
  true,
  524288000,
  ARRAY['video/mp4', 'video/webm', 'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm']
) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'broadcast-thumbnails',
  'broadcast-thumbnails',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view broadcast recordings" ON storage.objects
  FOR SELECT USING (bucket_id = 'broadcast-recordings');

CREATE POLICY "Public can view broadcast thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'broadcast-thumbnails');

CREATE POLICY "Admins can upload recordings" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'broadcast-recordings' AND
    public.is_admin_or_editor(auth.uid())
  );

CREATE POLICY "Admins can upload thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'broadcast-thumbnails' AND
    public.is_admin_or_editor(auth.uid())
  );

-- Function to update viewer count
CREATE OR REPLACE FUNCTION public.update_broadcast_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.broadcasts
    SET viewer_count = viewer_count + 1,
        peak_viewers = GREATEST(peak_viewers, viewer_count + 1),
        total_views = total_views + 1
    WHERE id = NEW.broadcast_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    UPDATE public.broadcasts
    SET viewer_count = GREATEST(0, viewer_count - 1)
    WHERE id = NEW.broadcast_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_viewer_count
AFTER INSERT OR UPDATE ON public.broadcast_analytics
FOR EACH ROW EXECUTE FUNCTION public.update_broadcast_viewer_count();

-- Function to auto-update updated_at
CREATE TRIGGER update_broadcast_channels_updated_at
BEFORE UPDATE ON public.broadcast_channels
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broadcast_programs_updated_at
BEFORE UPDATE ON public.broadcast_programs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broadcasts_updated_at
BEFORE UPDATE ON public.broadcasts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_broadcast_schedule_updated_at
BEFORE UPDATE ON public.broadcast_schedule
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();