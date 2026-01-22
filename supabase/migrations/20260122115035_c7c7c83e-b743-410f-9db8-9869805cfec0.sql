-- =====================================================
-- ILLÚMINA STUDIO - FASE 1: FUNDAÇÃO DO BANCO DE DADOS
-- =====================================================

-- 1. Teams (equipes e planos)
CREATE TABLE public.illumina_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'advanced')),
  seats_total INTEGER DEFAULT 1,
  seats_used INTEGER DEFAULT 0,
  storage_used_mb BIGINT DEFAULT 0,
  storage_limit_mb BIGINT DEFAULT 5000,
  two_factor_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Team Members (membros e papéis)
CREATE TABLE public.illumina_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  user_id UUID,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'guest')),
  invited_email TEXT,
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Studios (salas permanentes reutilizáveis)
CREATE TABLE public.illumina_studios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  permanent_link TEXT UNIQUE,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  defaults_json JSONB DEFAULT '{
    "layout": "grid",
    "background": null,
    "overlays": [],
    "lower_thirds": [],
    "audio_settings": {
      "noise_cancellation": true,
      "echo_cancellation": true
    }
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  max_participants INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Studio Sessions (sessões de estúdio)
CREATE TABLE public.illumina_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES public.illumina_studios(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  title TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('live', 'record', 'webinar')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'recording', 'paused', 'ended', 'cancelled')),
  scheduled_start_at TIMESTAMPTZ,
  actual_start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  livekit_room_name TEXT UNIQUE,
  livekit_room_id TEXT,
  destinations_selected UUID[] DEFAULT '{}',
  recording_enabled BOOLEAN DEFAULT true,
  recording_type TEXT DEFAULT 'cloud' CHECK (recording_type IN ('cloud', 'local', 'separate_tracks')),
  metadata_json JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Session Participants (participantes da sessão)
CREATE TABLE public.illumina_session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.illumina_sessions(id) ON DELETE CASCADE,
  user_id UUID,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'guest' CHECK (role IN ('host', 'co_host', 'guest', 'viewer')),
  is_on_stage BOOLEAN DEFAULT false,
  is_muted BOOLEAN DEFAULT false,
  is_camera_off BOOLEAN DEFAULT false,
  is_screen_sharing BOOLEAN DEFAULT false,
  volume_level INTEGER DEFAULT 100,
  lower_third_text TEXT,
  lower_third_style JSONB,
  invite_token TEXT UNIQUE,
  invite_expires_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,
  left_at TIMESTAMPTZ,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'waiting', 'backstage', 'on_stage', 'left')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Destinations (destinos de streaming)
CREATE TABLE public.illumina_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('youtube', 'facebook', 'instagram', 'linkedin', 'x', 'twitch', 'kick', 'brightcove', 'rtmp', 'webtv')),
  name TEXT NOT NULL,
  description TEXT,
  oauth_tokens_encrypted TEXT,
  oauth_refresh_token_encrypted TEXT,
  oauth_expires_at TIMESTAMPTZ,
  rtmp_url TEXT,
  stream_key_encrypted TEXT,
  is_enabled BOOLEAN DEFAULT true,
  is_connected BOOLEAN DEFAULT false,
  last_used_at TIMESTAMPTZ,
  connection_status TEXT DEFAULT 'disconnected',
  metadata_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Recordings (gravações com trilhas separadas)
CREATE TABLE public.illumina_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.illumina_sessions(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  title TEXT,
  type TEXT DEFAULT 'main' CHECK (type IN ('main', 'local', 'separate_tracks')),
  status TEXT DEFAULT 'recording' CHECK (status IN ('recording', 'processing', 'ready', 'failed', 'deleted')),
  url_main TEXT,
  urls_tracks JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  duration_seconds INTEGER,
  size_bytes BIGINT,
  resolution TEXT,
  format TEXT DEFAULT 'mp4',
  tags TEXT[] DEFAULT '{}',
  participants_json JSONB DEFAULT '[]',
  metadata_json JSONB DEFAULT '{}',
  storage_path TEXT,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Clips (clipes horizontais e verticais)
CREATE TABLE public.illumina_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recording_id UUID NOT NULL REFERENCES public.illumina_recordings(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT DEFAULT 'horizontal' CHECK (type IN ('horizontal', 'vertical')),
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'failed')),
  url TEXT,
  thumbnail_url TEXT,
  in_point_seconds INTEGER NOT NULL,
  out_point_seconds INTEGER NOT NULL,
  duration_seconds INTEGER,
  focus_position JSONB,
  subtitles_url TEXT,
  metadata_json JSONB DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Webinars
CREATE TABLE public.illumina_webinars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  studio_id UUID REFERENCES public.illumina_studios(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  mode TEXT DEFAULT 'live' CHECK (mode IN ('live', 'vod')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'live', 'ended', 'cancelled')),
  require_signup BOOLEAN DEFAULT false,
  signup_fields_json JSONB DEFAULT '[
    {"name": "name", "label": "Nome", "type": "text", "required": true},
    {"name": "email", "label": "E-mail", "type": "email", "required": true}
  ]'::jsonb,
  cover_image_url TEXT,
  scheduled_start_at TIMESTAMPTZ,
  scheduled_end_at TIMESTAMPTZ,
  actual_start_at TIMESTAMPTZ,
  actual_end_at TIMESTAMPTZ,
  chat_opens_minutes_before INTEGER DEFAULT 10,
  chat_closes_minutes_after INTEGER DEFAULT 10,
  allow_reactions BOOLEAN DEFAULT true,
  allow_simulcast BOOLEAN DEFAULT false,
  simulcast_destinations UUID[] DEFAULT '{}',
  recording_id UUID REFERENCES public.illumina_recordings(id),
  embed_settings_json JSONB DEFAULT '{
    "show_chat": true,
    "theme": "dark",
    "brand_color": "#6366f1"
  }'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Webinar Registrations
CREATE TABLE public.illumina_webinar_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webinar_id UUID NOT NULL REFERENCES public.illumina_webinars(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  extra_fields_json JSONB DEFAULT '{}',
  access_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  attended BOOLEAN DEFAULT false,
  attended_at TIMESTAMPTZ,
  watch_duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(webinar_id, email)
);

-- 11. Branding Assets
CREATE TABLE public.illumina_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  name TEXT DEFAULT 'Default',
  is_default BOOLEAN DEFAULT false,
  logos JSONB DEFAULT '[]',
  palettes JSONB DEFAULT '{
    "primary": "#6366f1",
    "secondary": "#8b5cf6",
    "accent": "#f59e0b",
    "background": "#1f2937",
    "text": "#ffffff"
  }'::jsonb,
  overlays JSONB DEFAULT '[]',
  backgrounds JSONB DEFAULT '[]',
  lower_thirds_presets JSONB DEFAULT '[]',
  tickers_presets JSONB DEFAULT '[]',
  fonts_json JSONB DEFAULT '{
    "heading": "Inter",
    "body": "Inter"
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Scenes (cenas do estúdio)
CREATE TABLE public.illumina_scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id UUID NOT NULL REFERENCES public.illumina_studios(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  layout TEXT DEFAULT 'grid' CHECK (layout IN ('grid', 'spotlight', 'pip', 'side_by_side', 'vertical', 'custom')),
  layout_config JSONB DEFAULT '{}',
  background_url TEXT,
  background_type TEXT CHECK (background_type IN ('image', 'video', 'color')),
  background_color TEXT,
  overlays JSONB DEFAULT '[]',
  lower_thirds JSONB DEFAULT '[]',
  tickers JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Schedules (agendamentos de transmissão)
CREATE TABLE public.illumina_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('recording', 'webinar', 'live')),
  content_id UUID NOT NULL,
  title TEXT,
  run_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  destinations_selected UUID[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  executed_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Audit Logs
CREATE TABLE public.illumina_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.illumina_teams(id) ON DELETE SET NULL,
  actor_user_id UUID,
  actor_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  entity_name TEXT,
  ip_address INET,
  user_agent TEXT,
  payload_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. System Status
CREATE TABLE public.illumina_system_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'degraded', 'partial_outage', 'major_outage', 'maintenance')),
  message TEXT,
  incident_url TEXT,
  last_check_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Chat Messages (para webinários e sessões)
CREATE TABLE public.illumina_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.illumina_sessions(id) ON DELETE CASCADE,
  webinar_id UUID REFERENCES public.illumina_webinars(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'illumina' CHECK (platform IN ('illumina', 'youtube', 'facebook', 'twitch', 'kick', 'instagram', 'linkedin')),
  external_id TEXT,
  user_id UUID,
  user_name TEXT NOT NULL,
  user_avatar_url TEXT,
  message TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  is_held BOOLEAN DEFAULT false,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  deleted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT session_or_webinar CHECK (session_id IS NOT NULL OR webinar_id IS NOT NULL)
);

-- 17. Referral Program
CREATE TABLE public.illumina_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.illumina_teams(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(8), 'hex'),
  referred_team_id UUID REFERENCES public.illumina_teams(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'rewarded')),
  reward_type TEXT,
  reward_value DECIMAL(10, 2),
  converted_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_illumina_team_members_team ON public.illumina_team_members(team_id);
CREATE INDEX idx_illumina_team_members_user ON public.illumina_team_members(user_id);
CREATE INDEX idx_illumina_studios_team ON public.illumina_studios(team_id);
CREATE INDEX idx_illumina_studios_slug ON public.illumina_studios(slug);
CREATE INDEX idx_illumina_sessions_studio ON public.illumina_sessions(studio_id);
CREATE INDEX idx_illumina_sessions_team ON public.illumina_sessions(team_id);
CREATE INDEX idx_illumina_sessions_status ON public.illumina_sessions(status);
CREATE INDEX idx_illumina_recordings_session ON public.illumina_recordings(session_id);
CREATE INDEX idx_illumina_recordings_team ON public.illumina_recordings(team_id);
CREATE INDEX idx_illumina_clips_recording ON public.illumina_clips(recording_id);
CREATE INDEX idx_illumina_webinars_team ON public.illumina_webinars(team_id);
CREATE INDEX idx_illumina_webinars_slug ON public.illumina_webinars(slug);
CREATE INDEX idx_illumina_webinar_registrations_webinar ON public.illumina_webinar_registrations(webinar_id);
CREATE INDEX idx_illumina_destinations_team ON public.illumina_destinations(team_id);
CREATE INDEX idx_illumina_branding_team ON public.illumina_branding(team_id);
CREATE INDEX idx_illumina_scenes_studio ON public.illumina_scenes(studio_id);
CREATE INDEX idx_illumina_schedules_team ON public.illumina_schedules(team_id);
CREATE INDEX idx_illumina_schedules_run_at ON public.illumina_schedules(run_at);
CREATE INDEX idx_illumina_audit_logs_team ON public.illumina_audit_logs(team_id);
CREATE INDEX idx_illumina_audit_logs_created ON public.illumina_audit_logs(created_at DESC);
CREATE INDEX idx_illumina_chat_messages_session ON public.illumina_chat_messages(session_id);
CREATE INDEX idx_illumina_chat_messages_webinar ON public.illumina_chat_messages(webinar_id);
CREATE INDEX idx_illumina_session_participants_session ON public.illumina_session_participants(session_id);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.illumina_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_studios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_clips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_webinar_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_branding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_system_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.illumina_referrals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Helper function to check team membership
CREATE OR REPLACE FUNCTION public.is_illumina_team_member(p_team_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.illumina_team_members 
    WHERE team_id = p_team_id 
    AND user_id = p_user_id 
    AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.illumina_teams
    WHERE id = p_team_id
    AND owner_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper function to check team admin/owner
CREATE OR REPLACE FUNCTION public.is_illumina_team_admin(p_team_id UUID, p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.illumina_team_members 
    WHERE team_id = p_team_id 
    AND user_id = p_user_id 
    AND role IN ('owner', 'admin')
    AND status = 'active'
  ) OR EXISTS (
    SELECT 1 FROM public.illumina_teams
    WHERE id = p_team_id
    AND owner_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Teams policies
CREATE POLICY "Users can view their own teams" ON public.illumina_teams
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    is_illumina_team_member(id)
  );

CREATE POLICY "Users can create teams" ON public.illumina_teams
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update their teams" ON public.illumina_teams
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete their teams" ON public.illumina_teams
  FOR DELETE USING (owner_id = auth.uid());

-- Team Members policies
CREATE POLICY "Team members can view other members" ON public.illumina_team_members
  FOR SELECT USING (
    is_illumina_team_member(team_id) OR
    invited_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Admins can manage team members" ON public.illumina_team_members
  FOR ALL USING (is_illumina_team_admin(team_id));

-- Studios policies
CREATE POLICY "Team members can view studios" ON public.illumina_studios
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage studios" ON public.illumina_studios
  FOR ALL USING (is_illumina_team_admin(team_id));

-- Sessions policies
CREATE POLICY "Team members can view sessions" ON public.illumina_sessions
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Team members can create sessions" ON public.illumina_sessions
  FOR INSERT WITH CHECK (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage sessions" ON public.illumina_sessions
  FOR UPDATE USING (is_illumina_team_admin(team_id));

CREATE POLICY "Admins can delete sessions" ON public.illumina_sessions
  FOR DELETE USING (is_illumina_team_admin(team_id));

-- Session Participants policies
CREATE POLICY "Anyone can view session participants" ON public.illumina_session_participants
  FOR SELECT USING (true);

CREATE POLICY "Team members can manage participants" ON public.illumina_session_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.illumina_sessions s
      WHERE s.id = session_id
      AND is_illumina_team_member(s.team_id)
    )
  );

-- Destinations policies
CREATE POLICY "Team members can view destinations" ON public.illumina_destinations
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage destinations" ON public.illumina_destinations
  FOR ALL USING (is_illumina_team_admin(team_id));

-- Recordings policies
CREATE POLICY "Team members can view recordings" ON public.illumina_recordings
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Team members can create recordings" ON public.illumina_recordings
  FOR INSERT WITH CHECK (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage recordings" ON public.illumina_recordings
  FOR UPDATE USING (is_illumina_team_admin(team_id));

CREATE POLICY "Admins can delete recordings" ON public.illumina_recordings
  FOR DELETE USING (is_illumina_team_admin(team_id));

-- Clips policies
CREATE POLICY "Team members can view clips" ON public.illumina_clips
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Team members can create clips" ON public.illumina_clips
  FOR INSERT WITH CHECK (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage clips" ON public.illumina_clips
  FOR UPDATE USING (is_illumina_team_admin(team_id));

CREATE POLICY "Admins can delete clips" ON public.illumina_clips
  FOR DELETE USING (is_illumina_team_admin(team_id));

-- Webinars policies
CREATE POLICY "Anyone can view published webinars" ON public.illumina_webinars
  FOR SELECT USING (
    status IN ('scheduled', 'live', 'ended') OR
    is_illumina_team_member(team_id)
  );

CREATE POLICY "Team members can create webinars" ON public.illumina_webinars
  FOR INSERT WITH CHECK (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage webinars" ON public.illumina_webinars
  FOR UPDATE USING (is_illumina_team_admin(team_id));

CREATE POLICY "Admins can delete webinars" ON public.illumina_webinars
  FOR DELETE USING (is_illumina_team_admin(team_id));

-- Webinar Registrations policies (public insert)
CREATE POLICY "Anyone can register for webinars" ON public.illumina_webinar_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Team members can view registrations" ON public.illumina_webinar_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.illumina_webinars w
      WHERE w.id = webinar_id
      AND is_illumina_team_member(w.team_id)
    )
  );

-- Branding policies
CREATE POLICY "Team members can view branding" ON public.illumina_branding
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage branding" ON public.illumina_branding
  FOR ALL USING (is_illumina_team_admin(team_id));

-- Scenes policies
CREATE POLICY "Team members can view scenes" ON public.illumina_scenes
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage scenes" ON public.illumina_scenes
  FOR ALL USING (is_illumina_team_admin(team_id));

-- Schedules policies
CREATE POLICY "Team members can view schedules" ON public.illumina_schedules
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Admins can manage schedules" ON public.illumina_schedules
  FOR ALL USING (is_illumina_team_admin(team_id));

-- Audit Logs policies (read-only for team members)
CREATE POLICY "Team members can view audit logs" ON public.illumina_audit_logs
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "System can insert audit logs" ON public.illumina_audit_logs
  FOR INSERT WITH CHECK (true);

-- System Status policies (public read)
CREATE POLICY "Anyone can view system status" ON public.illumina_system_status
  FOR SELECT USING (true);

-- Chat Messages policies
CREATE POLICY "Anyone can view chat messages" ON public.illumina_chat_messages
  FOR SELECT USING (
    is_deleted = false AND moderation_status = 'approved'
  );

CREATE POLICY "Authenticated users can send messages" ON public.illumina_chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage chat messages" ON public.illumina_chat_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.illumina_sessions s
      WHERE s.id = session_id
      AND is_illumina_team_admin(s.team_id)
    ) OR EXISTS (
      SELECT 1 FROM public.illumina_webinars w
      WHERE w.id = webinar_id
      AND is_illumina_team_admin(w.team_id)
    )
  );

-- Referrals policies
CREATE POLICY "Team members can view their referrals" ON public.illumina_referrals
  FOR SELECT USING (is_illumina_team_member(team_id));

CREATE POLICY "Team members can create referrals" ON public.illumina_referrals
  FOR INSERT WITH CHECK (is_illumina_team_member(team_id));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps trigger
CREATE OR REPLACE FUNCTION public.illumina_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_illumina_teams_timestamp
  BEFORE UPDATE ON public.illumina_teams
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_team_members_timestamp
  BEFORE UPDATE ON public.illumina_team_members
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_studios_timestamp
  BEFORE UPDATE ON public.illumina_studios
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_sessions_timestamp
  BEFORE UPDATE ON public.illumina_sessions
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_destinations_timestamp
  BEFORE UPDATE ON public.illumina_destinations
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_recordings_timestamp
  BEFORE UPDATE ON public.illumina_recordings
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_webinars_timestamp
  BEFORE UPDATE ON public.illumina_webinars
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_branding_timestamp
  BEFORE UPDATE ON public.illumina_branding
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_scenes_timestamp
  BEFORE UPDATE ON public.illumina_scenes
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

CREATE TRIGGER update_illumina_schedules_timestamp
  BEFORE UPDATE ON public.illumina_schedules
  FOR EACH ROW EXECUTE FUNCTION public.illumina_update_timestamp();

-- Auto-create team member for owner
CREATE OR REPLACE FUNCTION public.illumina_auto_create_owner_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.illumina_team_members (team_id, user_id, role, status)
  VALUES (NEW.id, NEW.owner_id, 'owner', 'active');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_owner_member
  AFTER INSERT ON public.illumina_teams
  FOR EACH ROW EXECUTE FUNCTION public.illumina_auto_create_owner_member();

-- Auto-create default branding for team
CREATE OR REPLACE FUNCTION public.illumina_auto_create_default_branding()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.illumina_branding (team_id, name, is_default)
  VALUES (NEW.id, 'Default', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_create_default_branding
  AFTER INSERT ON public.illumina_teams
  FOR EACH ROW EXECUTE FUNCTION public.illumina_auto_create_default_branding();

-- Generate permanent link for studios
CREATE OR REPLACE FUNCTION public.illumina_generate_permanent_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.permanent_link IS NULL THEN
    NEW.permanent_link = '/illumina/studio/' || NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_studio_permanent_link
  BEFORE INSERT ON public.illumina_studios
  FOR EACH ROW EXECUTE FUNCTION public.illumina_generate_permanent_link();

-- Insert initial system status components
INSERT INTO public.illumina_system_status (component, status, message) VALUES
  ('api', 'operational', 'API funcionando normalmente'),
  ('streaming', 'operational', 'Serviço de streaming operacional'),
  ('storage', 'operational', 'Armazenamento funcionando normalmente'),
  ('recordings', 'operational', 'Processamento de gravações OK'),
  ('chat', 'operational', 'Chat em tempo real funcionando'),
  ('auth', 'operational', 'Autenticação operacional');