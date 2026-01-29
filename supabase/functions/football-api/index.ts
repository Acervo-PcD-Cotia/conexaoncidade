import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RAPIDAPI_KEY = Deno.env.get("RAPIDAPI_KEY") || "";
const RAPIDAPI_HOST = "api-football-v1.p.rapidapi.com";
const API_BASE = "https://api-football-v1.p.rapidapi.com/v3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Brazilian leagues
const SERIE_A_ID = 71;
const SERIE_B_ID = 72;
const CURRENT_SEASON = 2025;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function fetchFromApi(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  
  console.log(`[API] Fetching: ${url.toString()}`);
  
  const response = await fetch(url.toString(), {
    headers: {
      "X-RapidAPI-Key": RAPIDAPI_KEY,
      "X-RapidAPI-Host": RAPIDAPI_HOST,
    },
  });
  
  if (!response.ok) {
    console.error(`[API] Error: ${response.status} ${response.statusText}`);
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  console.log(`[API] Response: ${data.results} results`);
  
  return data;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getOrCreateCompetition(leagueId: number): Promise<string> {
  const name = leagueId === SERIE_A_ID ? "Campeonato Brasileiro Série A" : "Campeonato Brasileiro Série B";
  
  const { data: existing } = await supabase
    .from("football_competitions")
    .select("id")
    .eq("external_id", leagueId)
    .single();
  
  if (existing) return existing.id;
  
  const { data: newComp, error } = await supabase
    .from("football_competitions")
    .insert({
      external_id: leagueId,
      name,
      type: "league",
      country: "Brazil",
      season: CURRENT_SEASON,
    })
    .select("id")
    .single();
  
  if (error) throw error;
  return newComp.id;
}

async function getOrCreateTeam(apiTeam: { id: number; name: string; logo: string }): Promise<string> {
  const { data: existing } = await supabase
    .from("football_teams")
    .select("id")
    .eq("external_id", apiTeam.id)
    .single();
  
  if (existing) return existing.id;
  
  const slug = slugify(apiTeam.name);
  
  const { data: newTeam, error } = await supabase
    .from("football_teams")
    .insert({
      external_id: apiTeam.id,
      name: apiTeam.name,
      slug,
      logo_url: apiTeam.logo,
    })
    .select("id")
    .single();
  
  if (error) throw error;
  return newTeam.id;
}

async function syncFixtures(leagueId: number, competitionId: string) {
  console.log(`[SYNC] Syncing fixtures for league ${leagueId}`);
  
  const response = await fetchFromApi("/fixtures", {
    league: String(leagueId),
    season: String(CURRENT_SEASON),
  });
  
  const fixtures = response.response || [];
  console.log(`[SYNC] Found ${fixtures.length} fixtures`);
  
  for (const fixture of fixtures) {
    try {
      const homeTeamId = await getOrCreateTeam(fixture.teams.home);
      const awayTeamId = await getOrCreateTeam(fixture.teams.away);
      
      const roundMatch = fixture.league.round?.match(/Regular Season - (\d+)/);
      const roundNumber = roundMatch ? parseInt(roundMatch[1]) : null;
      
      const date = new Date(fixture.fixture.date);
      const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
      const slug = `${slugify(fixture.teams.home.name)}-x-${slugify(fixture.teams.away.name)}-${dateStr}`;
      
      await supabase
        .from("football_matches")
        .upsert({
          external_id: fixture.fixture.id,
          competition_id: competitionId,
          home_team_id: homeTeamId,
          away_team_id: awayTeamId,
          season: CURRENT_SEASON,
          round: roundNumber,
          round_name: fixture.league.round,
          match_date: fixture.fixture.date,
          venue: fixture.fixture.venue?.name,
          city: fixture.fixture.venue?.city,
          status: fixture.fixture.status.short,
          elapsed_time: fixture.fixture.status.elapsed,
          home_score: fixture.goals.home,
          away_score: fixture.goals.away,
          home_score_halftime: fixture.score.halftime?.home,
          away_score_halftime: fixture.score.halftime?.away,
          slug,
          updated_at: new Date().toISOString(),
        }, { onConflict: "external_id" });
    } catch (err) {
      console.error(`[SYNC] Error syncing fixture ${fixture.fixture.id}:`, err);
    }
  }
  
  return fixtures.length;
}

async function syncStandings(leagueId: number, competitionId: string) {
  console.log(`[SYNC] Syncing standings for league ${leagueId}`);
  
  const response = await fetchFromApi("/standings", {
    league: String(leagueId),
    season: String(CURRENT_SEASON),
  });
  
  const standings = response.response?.[0]?.league?.standings?.[0] || [];
  console.log(`[SYNC] Found ${standings.length} standings entries`);
  
  for (const entry of standings) {
    try {
      const teamId = await getOrCreateTeam(entry.team);
      
      await supabase
        .from("football_standings")
        .upsert({
          competition_id: competitionId,
          team_id: teamId,
          season: CURRENT_SEASON,
          position: entry.rank,
          points: entry.points,
          played: entry.all.played,
          won: entry.all.win,
          drawn: entry.all.draw,
          lost: entry.all.lose,
          goals_for: entry.all.goals.for,
          goals_against: entry.all.goals.against,
          goal_difference: entry.goalsDiff,
          form: entry.form,
          last_updated: new Date().toISOString(),
        }, { onConflict: "competition_id,team_id,season" });
    } catch (err) {
      console.error(`[SYNC] Error syncing standing for team ${entry.team.id}:`, err);
    }
  }
  
  return standings.length;
}

async function syncTopScorers(leagueId: number, competitionId: string) {
  console.log(`[SYNC] Syncing top scorers for league ${leagueId}`);
  
  const response = await fetchFromApi("/players/topscorers", {
    league: String(leagueId),
    season: String(CURRENT_SEASON),
  });
  
  const scorers = response.response || [];
  console.log(`[SYNC] Found ${scorers.length} top scorers`);
  
  for (const entry of scorers) {
    try {
      const stats = entry.statistics[0];
      if (!stats) continue;
      
      const teamId = await getOrCreateTeam(stats.team);
      
      await supabase
        .from("football_player_stats")
        .upsert({
          external_id: entry.player.id,
          competition_id: competitionId,
          team_id: teamId,
          season: CURRENT_SEASON,
          player_name: entry.player.name,
          player_photo_url: entry.player.photo,
          position: stats.games?.position,
          nationality: entry.player.nationality,
          goals: stats.goals?.total || 0,
          assists: stats.goals?.assists || 0,
          yellow_cards: stats.cards?.yellow || 0,
          red_cards: stats.cards?.red || 0,
          matches_played: stats.games?.appearences || 0,
          minutes_played: stats.games?.minutes || 0,
          last_updated: new Date().toISOString(),
        }, { onConflict: "external_id,competition_id,season" });
    } catch (err) {
      console.error(`[SYNC] Error syncing player ${entry.player.id}:`, err);
    }
  }
  
  return scorers.length;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace(/^\/football-api\/?/, "").replace(/^\/+/, "");
    
    console.log(`[REQ] ${req.method} /${path}`);
    
    // Handle sync request
    if (path === "sync" || req.method === "POST") {
      const leagueId = url.searchParams.get("league") === "b" ? SERIE_B_ID : SERIE_A_ID;
      
      const competitionId = await getOrCreateCompetition(leagueId);
      
      const fixturesCount = await syncFixtures(leagueId, competitionId);
      const standingsCount = await syncStandings(leagueId, competitionId);
      const scorersCount = await syncTopScorers(leagueId, competitionId);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Sync completed",
          data: {
            fixtures: fixturesCount,
            standings: standingsCount,
            topScorers: scorersCount,
          },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle health check
    if (path === "health" || path === "") {
      return new Response(
        JSON.stringify({ status: "ok", apiKeyConfigured: !!RAPIDAPI_KEY }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: "Unknown endpoint" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[ERROR]", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
