// Types for Football/Soccer module - Aligned with database schema

export interface FootballTeam {
  id: string;
  external_id?: number;
  name: string;
  short_name?: string;
  slug: string;
  logo_url?: string;
  stadium_name?: string;
  stadium_city?: string;
  founded_year?: number;
  primary_color?: string;
  secondary_color?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FootballMatch {
  id: string;
  external_id?: number;
  competition_id?: string;
  home_team_id?: string;
  away_team_id?: string;
  season: number;
  round?: number;
  round_name?: string;
  match_date: string;
  venue?: string;
  city?: string;
  status?: MatchStatus;
  elapsed_time?: number;
  home_score?: number;
  away_score?: number;
  home_score_halftime?: number;
  away_score_halftime?: number;
  slug?: string;
  created_at?: string;
  updated_at?: string;
  // Joined data
  home_team?: FootballTeam;
  away_team?: FootballTeam;
  competition?: FootballCompetition;
}

export interface FootballCompetition {
  id: string;
  external_id?: number;
  name: string;
  type: string;
  logo_url?: string;
  country?: string;
  season?: number;
}

export type MatchStatus = 
  | 'NS' // Not Started
  | 'TBD' // Time To Be Defined
  | '1H' // First Half
  | 'HT' // Halftime
  | '2H' // Second Half
  | 'ET' // Extra Time
  | 'P' // Penalty
  | 'FT' // Full Time
  | 'AET' // After Extra Time
  | 'PEN' // Penalty Shootout
  | 'BT' // Break Time
  | 'SUSP' // Suspended
  | 'INT' // Interrupted
  | 'PST' // Postponed
  | 'CANC' // Cancelled
  | 'ABD' // Abandoned
  | 'AWD' // Awarded
  | 'WO' // Walkover
  | 'LIVE' // Live (any live status)
  | string; // Fallback for other statuses

export interface StandingsEntry {
  id: string;
  team_id?: string;
  competition_id?: string;
  season: number;
  position: number;
  points?: number;
  played?: number;
  won?: number;
  drawn?: number;
  lost?: number;
  goals_for?: number;
  goals_against?: number;
  goal_difference?: number;
  form?: string;
  last_updated?: string;
  created_at?: string;
  // Joined data
  team?: FootballTeam;
}

export interface PlayerStats {
  id: string;
  external_id?: number;
  player_name: string;
  player_photo_url?: string;
  team_id?: string;
  competition_id?: string;
  season: number;
  position?: string;
  nationality?: string;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  matches_played?: number;
  minutes_played?: number;
  last_updated?: string;
  created_at?: string;
  // Joined data
  team?: FootballTeam;
}

// Helpers

export const BRAZILIAN_LEAGUES = {
  SERIE_A: 71,
  SERIE_B: 72,
} as const;

export const LEAGUE_NAMES: Record<number, string> = {
  [BRAZILIAN_LEAGUES.SERIE_A]: 'Série A',
  [BRAZILIAN_LEAGUES.SERIE_B]: 'Série B',
};

export function getMatchStatusLabel(status?: MatchStatus | string): string {
  if (!status) return 'A definir';
  
  const labels: Record<string, string> = {
    'NS': 'Não Iniciado',
    'TBD': 'A Definir',
    '1H': '1º Tempo',
    'HT': 'Intervalo',
    '2H': '2º Tempo',
    'ET': 'Prorrogação',
    'P': 'Pênaltis',
    'FT': 'Encerrado',
    'AET': 'Após Prorrogação',
    'PEN': 'Após Pênaltis',
    'BT': 'Intervalo',
    'SUSP': 'Suspenso',
    'INT': 'Interrompido',
    'PST': 'Adiado',
    'CANC': 'Cancelado',
    'ABD': 'Abandonado',
    'AWD': 'W.O.',
    'WO': 'W.O.',
    'LIVE': 'Ao Vivo',
  };
  return labels[status] || status;
}

export function isMatchLive(status?: MatchStatus | string): boolean {
  if (!status) return false;
  return ['1H', '2H', 'HT', 'ET', 'P', 'BT', 'LIVE'].includes(status);
}

export function isMatchFinished(status?: MatchStatus | string): boolean {
  if (!status) return false;
  return ['FT', 'AET', 'PEN', 'AWD', 'WO'].includes(status);
}

export function isMatchScheduled(status?: MatchStatus | string): boolean {
  if (!status) return true;
  return ['NS', 'TBD'].includes(status);
}

export function getStatusColor(status?: MatchStatus | string): { bg: string; text: string } {
  if (isMatchLive(status)) {
    return { bg: 'bg-red-500/20', text: 'text-red-500' };
  }
  if (isMatchFinished(status)) {
    return { bg: 'bg-muted', text: 'text-muted-foreground' };
  }
  return { bg: 'bg-primary/10', text: 'text-primary' };
}

export type PositionZone = 'libertadores' | 'sulamericana' | 'neutral' | 'relegation';

export function getPositionZone(position: number, isSerieA: boolean = true): PositionZone {
  if (isSerieA) {
    if (position <= 4) return 'libertadores'; // G4 - Libertadores
    if (position <= 6) return 'sulamericana'; // Pre-Libertadores
    if (position <= 12) return 'sulamericana'; // Sul-Americana
    if (position >= 17) return 'relegation'; // Z4 - Rebaixamento
    return 'neutral';
  }
  
  // Série B zones
  if (position <= 4) return 'libertadores'; // G4 - Acesso
  if (position >= 17) return 'relegation'; // Z4 - Rebaixamento
  return 'neutral';
}

export function getPositionZoneColors(zone: PositionZone): { bg: string; border: string } {
  switch (zone) {
    case 'libertadores':
      return { bg: 'bg-green-500/10', border: 'border-l-green-500' };
    case 'sulamericana':
      return { bg: 'bg-blue-500/10', border: 'border-l-blue-500' };
    case 'relegation':
      return { bg: 'bg-red-500/10', border: 'border-l-red-500' };
    default:
      return { bg: '', border: 'border-l-transparent' };
  }
}

export function generateMatchSlug(match: FootballMatch): string {
  const homeTeam = match.home_team?.short_name || match.home_team?.name || 'time1';
  const awayTeam = match.away_team?.short_name || match.away_team?.name || 'time2';
  const date = new Date(match.match_date);
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
  
  return `${slugify(homeTeam)}-x-${slugify(awayTeam)}-${dateStr}`;
}

export function generateTeamSlug(team: FootballTeam): string {
  return team.slug || slugify(team.name);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getSerieSlug(competitionName?: string): string {
  if (!competitionName) return 'serie-a';
  if (competitionName.toLowerCase().includes('série b') || competitionName.toLowerCase().includes('serie b')) {
    return 'serie-b';
  }
  return 'serie-a';
}

export function getSerieFromSlug(slug: string): 'A' | 'B' {
  return slug === 'serie-b' ? 'B' : 'A';
}
