-- =============================================
-- MÓDULO ESPORTES - CAMPEONATO BRASILEIRO
-- =============================================

-- Competições (Série A, Série B, etc.)
CREATE TABLE public.football_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id INTEGER UNIQUE, -- ID da API externa
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  country TEXT DEFAULT 'Brazil',
  logo_url TEXT,
  season INTEGER NOT NULL DEFAULT 2024,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Times
CREATE TABLE public.football_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id INTEGER UNIQUE,
  name TEXT NOT NULL,
  short_name TEXT,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  stadium_name TEXT,
  stadium_city TEXT,
  founded_year INTEGER,
  primary_color TEXT,
  secondary_color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de classificação
CREATE TABLE public.football_standings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES public.football_competitions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 2024,
  position INTEGER NOT NULL,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER GENERATED ALWAYS AS (goals_for - goals_against) STORED,
  points INTEGER DEFAULT 0,
  form TEXT, -- Últimos 5 jogos: "WDLWW"
  home_played INTEGER DEFAULT 0,
  home_won INTEGER DEFAULT 0,
  home_drawn INTEGER DEFAULT 0,
  home_lost INTEGER DEFAULT 0,
  home_goals_for INTEGER DEFAULT 0,
  home_goals_against INTEGER DEFAULT 0,
  away_played INTEGER DEFAULT 0,
  away_won INTEGER DEFAULT 0,
  away_drawn INTEGER DEFAULT 0,
  away_lost INTEGER DEFAULT 0,
  away_goals_for INTEGER DEFAULT 0,
  away_goals_against INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(competition_id, team_id, season)
);

-- Partidas
CREATE TABLE public.football_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id INTEGER UNIQUE,
  competition_id UUID REFERENCES public.football_competitions(id) ON DELETE CASCADE,
  home_team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  away_team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 2024,
  round INTEGER, -- Número da rodada
  round_name TEXT, -- "Rodada 1", etc.
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  venue TEXT,
  city TEXT,
  status TEXT DEFAULT 'scheduled', -- scheduled, live, halftime, finished, postponed, cancelled
  elapsed_time INTEGER, -- Minutos de jogo (para ao vivo)
  home_score INTEGER,
  away_score INTEGER,
  home_score_halftime INTEGER,
  away_score_halftime INTEGER,
  slug TEXT, -- flamengo-x-palmeiras-2024-05-15
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Estatísticas de partida
CREATE TABLE public.football_match_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.football_matches(id) ON DELETE CASCADE UNIQUE,
  home_possession NUMERIC(5,2),
  away_possession NUMERIC(5,2),
  home_shots INTEGER DEFAULT 0,
  away_shots INTEGER DEFAULT 0,
  home_shots_on_target INTEGER DEFAULT 0,
  away_shots_on_target INTEGER DEFAULT 0,
  home_corners INTEGER DEFAULT 0,
  away_corners INTEGER DEFAULT 0,
  home_fouls INTEGER DEFAULT 0,
  away_fouls INTEGER DEFAULT 0,
  home_yellow_cards INTEGER DEFAULT 0,
  away_yellow_cards INTEGER DEFAULT 0,
  home_red_cards INTEGER DEFAULT 0,
  away_red_cards INTEGER DEFAULT 0,
  home_offsides INTEGER DEFAULT 0,
  away_offsides INTEGER DEFAULT 0,
  home_saves INTEGER DEFAULT 0,
  away_saves INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Eventos da partida (gols, cartões, substituições)
CREATE TABLE public.football_match_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.football_matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.football_teams(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- goal, yellow_card, red_card, substitution, var
  minute INTEGER,
  extra_minute INTEGER, -- Acréscimos
  player_name TEXT,
  assist_player_name TEXT,
  detail TEXT, -- "Penalty", "Own Goal", etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Estatísticas de jogadores (artilharia, assistências)
CREATE TABLE public.football_player_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id INTEGER,
  competition_id UUID REFERENCES public.football_competitions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 2024,
  player_name TEXT NOT NULL,
  player_photo_url TEXT,
  position TEXT,
  nationality TEXT,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  minutes_played INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(external_id, competition_id, season)
);

-- Favoritos do usuário (times favoritos)
CREATE TABLE public.football_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  team_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  notifications_enabled BOOLEAN DEFAULT true,
  notify_match_start BOOLEAN DEFAULT true,
  notify_goals BOOLEAN DEFAULT true,
  notify_match_end BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, team_id)
);

-- Histórico de confrontos diretos (H2H)
CREATE TABLE public.football_head_to_head (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_a_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  team_b_id UUID REFERENCES public.football_teams(id) ON DELETE CASCADE,
  total_matches INTEGER DEFAULT 0,
  team_a_wins INTEGER DEFAULT 0,
  team_b_wins INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(team_a_id, team_b_id)
);

-- Cache de dados da API (para evitar requests excessivos)
CREATE TABLE public.football_api_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_football_matches_date ON public.football_matches(match_date);
CREATE INDEX idx_football_matches_status ON public.football_matches(status);
CREATE INDEX idx_football_matches_competition ON public.football_matches(competition_id);
CREATE INDEX idx_football_matches_round ON public.football_matches(competition_id, round);
CREATE INDEX idx_football_standings_competition ON public.football_standings(competition_id);
CREATE INDEX idx_football_standings_position ON public.football_standings(position);
CREATE INDEX idx_football_player_stats_goals ON public.football_player_stats(goals DESC);
CREATE INDEX idx_football_player_stats_competition ON public.football_player_stats(competition_id);
CREATE INDEX idx_football_favorites_user ON public.football_favorites(user_id);
CREATE INDEX idx_football_api_cache_expires ON public.football_api_cache(expires_at);

-- Enable RLS
ALTER TABLE public.football_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_match_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_player_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_head_to_head ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.football_api_cache ENABLE ROW LEVEL SECURITY;

-- Policies públicas (leitura para todos - dados esportivos são públicos)
CREATE POLICY "Public read access for competitions" ON public.football_competitions FOR SELECT USING (true);
CREATE POLICY "Public read access for teams" ON public.football_teams FOR SELECT USING (true);
CREATE POLICY "Public read access for standings" ON public.football_standings FOR SELECT USING (true);
CREATE POLICY "Public read access for matches" ON public.football_matches FOR SELECT USING (true);
CREATE POLICY "Public read access for match stats" ON public.football_match_stats FOR SELECT USING (true);
CREATE POLICY "Public read access for match events" ON public.football_match_events FOR SELECT USING (true);
CREATE POLICY "Public read access for player stats" ON public.football_player_stats FOR SELECT USING (true);
CREATE POLICY "Public read access for h2h" ON public.football_head_to_head FOR SELECT USING (true);

-- Policies para favoritos (usuários logados)
CREATE POLICY "Users can view own favorites" ON public.football_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.football_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON public.football_favorites FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own favorites" ON public.football_favorites FOR UPDATE USING (auth.uid() = user_id);

-- Policy para cache (apenas via service role)
CREATE POLICY "Service role access for cache" ON public.football_api_cache FOR ALL USING (true);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.update_football_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_football_competitions_updated_at BEFORE UPDATE ON public.football_competitions FOR EACH ROW EXECUTE FUNCTION public.update_football_updated_at();
CREATE TRIGGER update_football_teams_updated_at BEFORE UPDATE ON public.football_teams FOR EACH ROW EXECUTE FUNCTION public.update_football_updated_at();
CREATE TRIGGER update_football_matches_updated_at BEFORE UPDATE ON public.football_matches FOR EACH ROW EXECUTE FUNCTION public.update_football_updated_at();
CREATE TRIGGER update_football_match_stats_updated_at BEFORE UPDATE ON public.football_match_stats FOR EACH ROW EXECUTE FUNCTION public.update_football_updated_at();

-- Inserir competições iniciais
INSERT INTO public.football_competitions (name, slug, season, is_active, external_id) VALUES
  ('Campeonato Brasileiro Série A', 'serie-a', 2024, true, 71),
  ('Campeonato Brasileiro Série B', 'serie-b', 2024, true, 72);