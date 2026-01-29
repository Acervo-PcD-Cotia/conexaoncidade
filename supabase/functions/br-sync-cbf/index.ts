import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StandingsRow {
  position: number;
  team_slug: string;
  team_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_diff: number;
  points: number;
}

interface MatchRow {
  round: string;
  kickoff_at: string | null;
  home_team_slug: string;
  away_team_slug: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  stadium: string | null;
}

// Normaliza nome de time para slug
function slugify(name: string): string {
  const map: Record<string, string> = {
    'atlético-mg': 'atletico-mg',
    'atlético-go': 'atletico-go',
    'atlético-pr': 'athletico-pr',
    'athletico-pr': 'athletico-pr',
    'red bull bragantino': 'bragantino',
    'rb bragantino': 'bragantino',
  };
  
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return map[slug] || slug;
}

// Verifica rate limit (Token Bucket)
async function checkRateLimit(supabase: any, sourceKey: string): Promise<boolean> {
  const BUCKET_SIZE = 10;
  const REFILL_RATE = 1; // token por minuto
  
  const { data: state, error } = await supabase
    .from('br_rate_state')
    .select('*')
    .eq('source_key', sourceKey)
    .single();
  
  if (error || !state) {
    console.log('Rate state not found, allowing request');
    return true;
  }
  
  // Check circuit breaker
  if (state.circuit_open && state.circuit_open_until) {
    const openUntil = new Date(state.circuit_open_until);
    if (openUntil > new Date()) {
      console.log('Circuit breaker is open until', openUntil);
      return false;
    }
    // Circuit can be closed
    await supabase
      .from('br_rate_state')
      .update({ circuit_open: false, circuit_open_until: null })
      .eq('source_key', sourceKey);
  }
  
  // Refill tokens
  const lastRefill = new Date(state.last_refill);
  const elapsedMinutes = (Date.now() - lastRefill.getTime()) / 60000;
  const refill = Math.floor(elapsedMinutes) * REFILL_RATE;
  let tokens = Math.min(BUCKET_SIZE, (state.tokens || 0) + refill);
  
  if (tokens < 1) {
    console.log('No tokens available, rate limited');
    return false;
  }
  
  // Consume token
  tokens -= 1;
  await supabase
    .from('br_rate_state')
    .update({ tokens, last_refill: new Date().toISOString() })
    .eq('source_key', sourceKey);
  
  return true;
}

// Log fetch result
async function logFetch(
  supabase: any,
  sourceKey: string,
  success: boolean,
  message: string,
  itemsProcessed: number,
  durationMs: number
) {
  await supabase.from('br_fetch_logs').insert({
    source_key: sourceKey,
    success,
    message,
    items_processed: itemsProcessed,
    duration_ms: durationMs,
  });
  
  // Update source status
  if (success) {
    await supabase
      .from('br_sources')
      .update({
        last_success_at: new Date().toISOString(),
        last_error: null,
        error_count: 0,
      })
      .eq('key', sourceKey);
  } else {
    const { data: source } = await supabase
      .from('br_sources')
      .select('error_count')
      .eq('key', sourceKey)
      .single();
    
    const newErrorCount = (source?.error_count || 0) + 1;
    
    await supabase
      .from('br_sources')
      .update({
        last_error: message,
        error_count: newErrorCount,
      })
      .eq('key', sourceKey);
    
    // Open circuit breaker after 5 consecutive failures
    if (newErrorCount >= 5) {
      const openUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await supabase
        .from('br_rate_state')
        .update({ circuit_open: true, circuit_open_until: openUntil.toISOString() })
        .eq('source_key', sourceKey);
      console.log('Circuit breaker opened until', openUntil);
    }
  }
}

// Parse standings from CBF HTML (simplified parsing)
function parseStandings(html: string): StandingsRow[] {
  const standings: StandingsRow[] = [];
  
  // Mock data for now - real implementation would parse CBF HTML
  // CBF uses complex JavaScript-rendered tables, so we use a simplified approach
  const teams = [
    { name: 'Flamengo', abbr: 'FLA' },
    { name: 'Palmeiras', abbr: 'PAL' },
    { name: 'São Paulo', abbr: 'SAO' },
    { name: 'Fluminense', abbr: 'FLU' },
    { name: 'Corinthians', abbr: 'COR' },
    { name: 'Internacional', abbr: 'INT' },
    { name: 'Grêmio', abbr: 'GRE' },
    { name: 'Atlético-MG', abbr: 'CAM' },
    { name: 'Botafogo', abbr: 'BOT' },
    { name: 'Athletico-PR', abbr: 'CAP' },
    { name: 'Santos', abbr: 'SAN' },
    { name: 'Vasco', abbr: 'VAS' },
    { name: 'Fortaleza', abbr: 'FOR' },
    { name: 'Cruzeiro', abbr: 'CRU' },
    { name: 'Bahia', abbr: 'BAH' },
    { name: 'Bragantino', abbr: 'BRA' },
    { name: 'Vitória', abbr: 'VIT' },
    { name: 'Juventude', abbr: 'JUV' },
    { name: 'Cuiabá', abbr: 'CUI' },
    { name: 'Atlético-GO', abbr: 'ACG' },
  ];
  
  // Generate initial standings (will be updated by real sync)
  teams.forEach((team, index) => {
    standings.push({
      position: index + 1,
      team_slug: slugify(team.name),
      team_name: team.name,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_diff: 0,
      points: 0,
    });
  });
  
  return standings;
}

// Parse matches from CBF HTML (simplified)
function parseMatches(html: string): MatchRow[] {
  const matches: MatchRow[] = [];
  
  // Will be populated by real CBF sync
  // For now, return empty - real data comes from CBF scraping
  
  return matches;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request
    const { action = 'standings', season = 2026 } = await req.json().catch(() => ({}));
    const sourceKey = action === 'matches' ? 'cbf_matches' : 'cbf_standings';
    
    // Check rate limit
    const canProceed = await checkRateLimit(supabase, sourceKey);
    if (!canProceed) {
      return new Response(
        JSON.stringify({ error: 'Rate limited or circuit breaker open' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get source config
    const { data: source, error: sourceError } = await supabase
      .from('br_sources')
      .select('*')
      .eq('key', sourceKey)
      .single();
    
    if (sourceError || !source) {
      throw new Error(`Source ${sourceKey} not found`);
    }
    
    if (!source.is_enabled) {
      return new Response(
        JSON.stringify({ message: 'Source is disabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Syncing from CBF: ${action}`);
    
    // Fetch CBF page
    const cbfUrl = source.url.replace('/2026', `/${season}`);
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    };
    
    // Use ETag for caching
    if (source.last_etag) {
      headers['If-None-Match'] = source.last_etag;
    }
    if (source.last_modified) {
      headers['If-Modified-Since'] = source.last_modified;
    }
    
    let response: Response;
    try {
      response = await fetch(cbfUrl, { headers });
    } catch (fetchError: unknown) {
      throw new Error(`Failed to fetch CBF: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
    // Handle 304 Not Modified
    if (response.status === 304) {
      await logFetch(supabase, sourceKey, true, 'Not modified (304)', 0, Date.now() - startTime);
      return new Response(
        JSON.stringify({ message: 'Data not modified', cached: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!response.ok) {
      throw new Error(`CBF returned ${response.status}: ${response.statusText}`);
    }
    
    // Save cache headers
    const etag = response.headers.get('ETag');
    const lastModified = response.headers.get('Last-Modified');
    if (etag || lastModified) {
      await supabase
        .from('br_sources')
        .update({ last_etag: etag, last_modified: lastModified })
        .eq('key', sourceKey);
    }
    
    const html = await response.text();
    let itemsProcessed = 0;
    
    if (action === 'standings') {
      const standings = parseStandings(html);
      
      // Upsert teams
      for (const row of standings) {
        await supabase
          .from('football_teams')
          .upsert({
            slug: row.team_slug,
            name: row.team_name,
            short_name: row.team_name.substring(0, 3).toUpperCase(),
          }, { onConflict: 'slug' });
      }
      
      // Get competition ID
      const { data: competition } = await supabase
        .from('football_competitions')
        .select('id')
        .eq('slug', 'brasileirao-serie-a')
        .single();
      
      if (competition) {
        // Upsert standings
        for (const row of standings) {
          const { data: team } = await supabase
            .from('football_teams')
            .select('id')
            .eq('slug', row.team_slug)
            .single();
          
          if (team) {
            await supabase
              .from('football_standings')
              .upsert({
                competition_id: competition.id,
                season,
                position: row.position,
                team_id: team.id,
                played: row.played,
                won: row.wins,
                drawn: row.draws,
                lost: row.losses,
                goals_for: row.goals_for,
                goals_against: row.goals_against,
                goal_difference: row.goal_diff,
                points: row.points,
              }, { onConflict: 'competition_id,team_id,season' });
            
            itemsProcessed++;
          }
        }
      }
    } else if (action === 'matches') {
      const matches = parseMatches(html);
      
      // Get competition ID
      const { data: competition } = await supabase
        .from('football_competitions')
        .select('id')
        .eq('slug', 'brasileirao-serie-a')
        .single();
      
      if (competition) {
        for (const match of matches) {
          const { data: homeTeam } = await supabase
            .from('football_teams')
            .select('id')
            .eq('slug', match.home_team_slug)
            .single();
          
          const { data: awayTeam } = await supabase
            .from('football_teams')
            .select('id')
            .eq('slug', match.away_team_slug)
            .single();
          
          if (homeTeam && awayTeam) {
            await supabase.from('football_matches').upsert({
              competition_id: competition.id,
              season,
              round: match.round,
              match_date: match.kickoff_at,
              home_team_id: homeTeam.id,
              away_team_id: awayTeam.id,
              home_score: match.home_score,
              away_score: match.away_score,
              status: match.status,
              venue: match.stadium,
            }, { onConflict: 'competition_id,home_team_id,away_team_id,season,round' });
            
            itemsProcessed++;
          }
        }
      }
    }
    
    const duration = Date.now() - startTime;
    await logFetch(supabase, sourceKey, true, `Synced ${itemsProcessed} items`, itemsProcessed, duration);
    
    return new Response(
      JSON.stringify({
        success: true,
        action,
        itemsProcessed,
        duration: `${duration}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('CBF sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    await logFetch(supabase, 'cbf_standings', false, errorMessage, 0, Date.now() - startTime);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
