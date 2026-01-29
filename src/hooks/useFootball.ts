import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { 
  FootballMatch, 
  FootballTeam, 
  StandingsEntry, 
  PlayerStats 
} from "@/types/football";
import { isMatchLive } from "@/types/football";

// ============ MATCHES HOOKS ============

export function useMatches(params: {
  competitionId?: string;
  date?: string;
  round?: number;
  teamId?: string;
  status?: string;
  limit?: number;
} = {}) {
  return useQuery({
    queryKey: ["football", "fixtures", params],
    queryFn: async () => {
      let query = supabase
        .from("football_matches")
        .select(`
          *,
          home_team:football_teams!football_matches_home_team_id_fkey(*),
          away_team:football_teams!football_matches_away_team_id_fkey(*)
        `)
        .order("match_date", { ascending: true });
      
      if (params.competitionId) {
        query = query.eq("competition_id", params.competitionId);
      }
      if (params.date) {
        query = query.gte("match_date", `${params.date}T00:00:00`)
                     .lt("match_date", `${params.date}T23:59:59`);
      }
      if (params.round) {
        query = query.eq("round", params.round);
      }
      if (params.teamId) {
        query = query.or(`home_team_id.eq.${params.teamId},away_team_id.eq.${params.teamId}`);
      }
      if (params.status) {
        query = query.eq("status", params.status);
      }
      if (params.limit) {
        query = query.limit(params.limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as FootballMatch[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLiveMatches(competitionId?: string) {
  return useQuery({
    queryKey: ["football", "live", competitionId],
    queryFn: async () => {
      let query = supabase
        .from("football_matches")
        .select(`
          *,
          home_team:football_teams!football_matches_home_team_id_fkey(*),
          away_team:football_teams!football_matches_away_team_id_fkey(*)
        `)
        .in("status", ["1H", "2H", "HT", "ET", "P", "BT"]);
      
      if (competitionId) {
        query = query.eq("competition_id", competitionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as FootballMatch[];
    },
    refetchInterval: 15 * 1000,
    staleTime: 10 * 1000,
  });
}

export function useTodayMatches(competitionId?: string) {
  const today = new Date().toISOString().split("T")[0];
  
  return useQuery({
    queryKey: ["football", "today", competitionId],
    queryFn: async () => {
      let query = supabase
        .from("football_matches")
        .select(`
          *,
          home_team:football_teams!football_matches_home_team_id_fkey(*),
          away_team:football_teams!football_matches_away_team_id_fkey(*)
        `)
        .gte("match_date", `${today}T00:00:00`)
        .lt("match_date", `${today}T23:59:59`)
        .order("match_date", { ascending: true });
      
      if (competitionId) {
        query = query.eq("competition_id", competitionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as FootballMatch[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMatchDetail(matchId: string | undefined) {
  return useQuery({
    queryKey: ["football", "match", matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_matches")
        .select(`
          *,
          home_team:football_teams!football_matches_home_team_id_fkey(*),
          away_team:football_teams!football_matches_away_team_id_fkey(*)
        `)
        .eq("id", matchId!)
        .single();
      
      if (error) throw error;
      return data as unknown as FootballMatch;
    },
    enabled: !!matchId,
    staleTime: 30 * 1000,
  });
}

export function useMatchBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["football", "match-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_matches")
        .select(`
          *,
          home_team:football_teams!football_matches_home_team_id_fkey(*),
          away_team:football_teams!football_matches_away_team_id_fkey(*)
        `)
        .eq("slug", slug!)
        .single();
      
      if (error) throw error;
      return data as unknown as FootballMatch;
    },
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
}

// ============ STANDINGS HOOKS ============

export function useStandings(competitionId?: string) {
  return useQuery({
    queryKey: ["football", "standings", competitionId],
    queryFn: async () => {
      let query = supabase
        .from("football_standings")
        .select(`
          *,
          team:football_teams(*)
        `)
        .order("position", { ascending: true });
      
      if (competitionId) {
        query = query.eq("competition_id", competitionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as StandingsEntry[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

// ============ TEAM HOOKS ============

export function useTeam(teamId: string | undefined) {
  return useQuery({
    queryKey: ["football", "team", teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_teams")
        .select("*")
        .eq("id", teamId!)
        .single();
      
      if (error) throw error;
      return data as FootballTeam;
    },
    enabled: !!teamId,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useTeamBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["football", "team-slug", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_teams")
        .select("*")
        .eq("slug", slug!)
        .single();
      
      if (error) throw error;
      return data as FootballTeam;
    },
    enabled: !!slug,
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useTeamSearch(query: string) {
  return useQuery({
    queryKey: ["football", "search", query],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_teams")
        .select("*")
        .or(`name.ilike.%${query}%,short_name.ilike.%${query}%,stadium_city.ilike.%${query}%`)
        .limit(10);
      
      if (error) throw error;
      return data as FootballTeam[];
    },
    enabled: query.length >= 2,
    staleTime: 60 * 1000,
  });
}

export function useTeamMatches(teamId: string | undefined, limit: number = 10) {
  return useQuery({
    queryKey: ["football", "team-matches", teamId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_matches")
        .select(`
          *,
          home_team:football_teams!football_matches_home_team_id_fkey(*),
          away_team:football_teams!football_matches_away_team_id_fkey(*)
        `)
        .or(`home_team_id.eq.${teamId},away_team_id.eq.${teamId}`)
        .order("match_date", { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data as unknown as FootballMatch[];
    },
    enabled: !!teamId,
    staleTime: 5 * 60 * 1000,
  });
}

// ============ TOP SCORERS HOOKS ============

export function useTopScorers(competitionId?: string, limit: number = 20) {
  return useQuery({
    queryKey: ["football", "topscorers", competitionId, limit],
    queryFn: async () => {
      let query = supabase
        .from("football_player_stats")
        .select(`
          *,
          team:football_teams(*)
        `)
        .order("goals", { ascending: false })
        .limit(limit);
      
      if (competitionId) {
        query = query.eq("competition_id", competitionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as PlayerStats[];
    },
    staleTime: 30 * 60 * 1000,
  });
}

// ============ COMPETITIONS HOOKS ============

export function useCompetitions() {
  return useQuery({
    queryKey: ["football", "competitions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_competitions")
        .select("*")
        .order("name", { ascending: true });
      
      if (error) throw error;
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useCompetitionByType(type: string) {
  return useQuery({
    queryKey: ["football", "competition", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("football_competitions")
        .select("*")
        .ilike("name", `%${type}%`)
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    staleTime: 24 * 60 * 60 * 1000,
  });
}

// ============ ROUND HOOKS ============

export function useRoundMatches(competitionId: string | undefined, round: number) {
  return useQuery({
    queryKey: ["football", "round", competitionId, round],
    queryFn: async () => {
      let query = supabase
        .from("football_matches")
        .select(`
          *,
          home_team:football_teams!football_matches_home_team_id_fkey(*),
          away_team:football_teams!football_matches_away_team_id_fkey(*)
        `)
        .eq("round", round)
        .order("match_date", { ascending: true });
      
      if (competitionId) {
        query = query.eq("competition_id", competitionId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as FootballMatch[];
    },
    enabled: !!round,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCurrentRound(competitionId?: string) {
  return useQuery({
    queryKey: ["football", "current-round", competitionId],
    queryFn: async () => {
      let query = supabase
        .from("football_matches")
        .select("round")
        .gte("match_date", new Date().toISOString())
        .order("match_date", { ascending: true })
        .limit(1);
      
      if (competitionId) {
        query = query.eq("competition_id", competitionId);
      }
      
      const { data, error } = await query;
      if (error && error.code !== "PGRST116") throw error;
      return data?.[0]?.round || 1;
    },
    staleTime: 30 * 60 * 1000,
  });
}

// ============ SYNC HOOKS ============

export function useSyncFootballData() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (competitionId?: string) => {
      const { data, error } = await supabase.functions.invoke("football-api", {
        body: { action: "sync", competitionId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["football"] });
    },
  });
}
