import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsResult {
  round?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeScore?: number;
  awayScore?: number;
  date?: string;
}

interface ParsedNews {
  title: string;
  url: string;
  date?: string;
  matchResult?: NewsResult;
}

// Normaliza nome de time para slug
function slugify(name: string): string {
  const map: Record<string, string> = {
    'atletico-mg': 'atletico-mg',
    'atletico-go': 'atletico-go',
    'atletico-pr': 'athletico-pr',
    'athletico-pr': 'athletico-pr',
    'red bull bragantino': 'bragantino',
    'rb bragantino': 'bragantino',
    'sao paulo': 'sao-paulo',
    'america-mg': 'america-mg',
  };
  
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  return map[slug] || slug;
}

// Times do Brasileirão 2026
const BRASILEIRAO_TEAMS = [
  'Flamengo', 'Palmeiras', 'São Paulo', 'Fluminense', 'Corinthians',
  'Internacional', 'Grêmio', 'Atlético-MG', 'Botafogo', 'Athletico-PR',
  'Santos', 'Vasco', 'Fortaleza', 'Cruzeiro', 'Bahia',
  'Bragantino', 'Vitória', 'Juventude', 'Cuiabá', 'Atlético-GO'
];

// Verifica rate limit (Token Bucket)
async function checkRateLimit(supabase: any, sourceKey: string): Promise<boolean> {
  const BUCKET_SIZE = 10;
  const REFILL_RATE = 1;
  
  const { data: state, error } = await supabase
    .from('br_rate_state')
    .select('*')
    .eq('source_key', sourceKey)
    .single();
  
  if (error || !state) {
    console.log('Rate state not found, allowing request');
    return true;
  }
  
  if (state.circuit_open && state.circuit_open_until) {
    const openUntil = new Date(state.circuit_open_until);
    if (openUntil > new Date()) {
      console.log('Circuit breaker is open until', openUntil);
      return false;
    }
    await supabase
      .from('br_rate_state')
      .update({ circuit_open: false, circuit_open_until: null })
      .eq('source_key', sourceKey);
  }
  
  const lastRefill = new Date(state.last_refill);
  const elapsedMinutes = (Date.now() - lastRefill.getTime()) / 60000;
  const refill = Math.floor(elapsedMinutes) * REFILL_RATE;
  let tokens = Math.min(BUCKET_SIZE, (state.tokens || 0) + refill);
  
  if (tokens < 1) {
    console.log('No tokens available, rate limited');
    return false;
  }
  
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
    
    if (newErrorCount >= 5) {
      const openUntil = new Date(Date.now() + 30 * 60 * 1000);
      await supabase
        .from('br_rate_state')
        .update({ circuit_open: true, circuit_open_until: openUntil.toISOString() })
        .eq('source_key', sourceKey);
      console.log('Circuit breaker opened until', openUntil);
    }
  }
}

// Parse news from CBF HTML page
function parseCbfNewsPage(html: string): ParsedNews[] {
  const news: ParsedNews[] = [];
  
  // Match article blocks - CBF uses <article> or <div class="news-item">
  const articlePattern = /<article[^>]*>[\s\S]*?<\/article>/gi;
  const divPattern = /<div[^>]*class="[^"]*(?:news|article|card)[^"]*"[^>]*>[\s\S]*?<\/div>/gi;
  
  const matches = html.match(articlePattern) || html.match(divPattern) || [];
  
  // Also try to find links with titles
  const linkPattern = /<a[^>]+href="([^"]*\/noticias\/[^"]*)"[^>]*>[\s\S]*?<\/a>/gi;
  const titlePattern = /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi;
  
  let linkMatch;
  while ((linkMatch = linkPattern.exec(html)) !== null) {
    const url = linkMatch[1];
    const fullMatch = linkMatch[0];
    
    // Extract title from the link or nearby h tag
    const titleMatch = fullMatch.match(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) 
      || fullMatch.match(/>([^<]{10,})</);
    
    if (titleMatch) {
      const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
      
      if (title.length > 10) {
        // Try to extract match result from title
        const matchResult = parseMatchFromTitle(title);
        
        news.push({
          title,
          url: url.startsWith('http') ? url : `https://www.cbf.com.br${url}`,
          matchResult,
        });
      }
    }
  }
  
  // Remove duplicates by URL
  const seen = new Set<string>();
  return news.filter(n => {
    if (seen.has(n.url)) return false;
    seen.add(n.url);
    return true;
  });
}

// Parse match result from news title
// Examples: "Análise do VAR: São Paulo (SP) X Flamengo (RJ) - 1ª Rodada"
//           "Flamengo 2 x 1 Palmeiras - Melhores momentos"
function parseMatchFromTitle(title: string): NewsResult | undefined {
  // Pattern 1: "Team1 N x N Team2"
  const scorePattern = /([A-ZÀ-Úa-zà-ú\s-]+)\s+(\d+)\s*x\s*(\d+)\s+([A-ZÀ-Úa-zà-ú\s-]+)/i;
  const scoreMatch = title.match(scorePattern);
  
  if (scoreMatch) {
    return {
      homeTeam: scoreMatch[1].trim(),
      homeScore: parseInt(scoreMatch[2]),
      awayScore: parseInt(scoreMatch[3]),
      awayTeam: scoreMatch[4].trim(),
    };
  }
  
  // Pattern 2: "Team1 (UF) X Team2 (UF) - Nª Rodada"
  const matchPattern = /([A-ZÀ-Úa-zà-ú\s-]+)\s*\([A-Z]{2}\)\s*[Xx]\s*([A-ZÀ-Úa-zà-ú\s-]+)\s*\([A-Z]{2}\)/;
  const matchMatch = title.match(matchPattern);
  
  if (matchMatch) {
    const roundMatch = title.match(/(\d+)[ªº]?\s*[Rr]odada/);
    return {
      homeTeam: matchMatch[1].trim(),
      awayTeam: matchMatch[2].trim(),
      round: roundMatch ? parseInt(roundMatch[1]) : undefined,
    };
  }
  
  return undefined;
}

// Ensure teams exist in database
async function ensureTeamsExist(supabase: any): Promise<void> {
  for (const teamName of BRASILEIRAO_TEAMS) {
    const slug = slugify(teamName);
    
    await supabase
      .from('football_teams')
      .upsert({
        slug,
        name: teamName,
        short_name: teamName.substring(0, 3).toUpperCase(),
      }, { onConflict: 'slug' });
  }
}

// Ensure standings exist with initial data
async function ensureStandingsExist(supabase: any, competitionId: string, season: number): Promise<number> {
  let processed = 0;
  
  for (let i = 0; i < BRASILEIRAO_TEAMS.length; i++) {
    const teamName = BRASILEIRAO_TEAMS[i];
    const slug = slugify(teamName);
    
    const { data: team } = await supabase
      .from('football_teams')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (team) {
      // IMPORTANT: Do NOT include goal_difference - it's a GENERATED column
      const { error: upsertError } = await supabase
        .from('football_standings')
        .upsert({
          competition_id: competitionId,
          season,
          position: i + 1,
          team_id: team.id,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          // goal_difference is computed automatically by PostgreSQL
          points: 0,
        }, { onConflict: 'competition_id,team_id,season' });
      
      if (upsertError) {
        console.error(`Failed to upsert standing for team ${teamName}:`, upsertError);
        continue;
      }
      processed++;
    }
  }
  
  return processed;
}

// Process match results from parsed news
async function processMatchResults(
  supabase: any, 
  competitionId: string, 
  season: number,
  newsItems: ParsedNews[]
): Promise<number> {
  let processed = 0;
  
  for (const news of newsItems) {
    if (!news.matchResult) continue;
    
    const { homeTeam, awayTeam, homeScore, awayScore, round } = news.matchResult;
    
    if (!homeTeam || !awayTeam) continue;
    
    // Find team IDs
    const homeSlug = slugify(homeTeam);
    const awaySlug = slugify(awayTeam);
    
    const { data: homeTeamData } = await supabase
      .from('football_teams')
      .select('id')
      .eq('slug', homeSlug)
      .single();
    
    const { data: awayTeamData } = await supabase
      .from('football_teams')
      .select('id')
      .eq('slug', awaySlug)
      .single();
    
    if (!homeTeamData || !awayTeamData) continue;
    
    // Upsert match
    const matchData: any = {
      competition_id: competitionId,
      season,
      home_team_id: homeTeamData.id,
      away_team_id: awayTeamData.id,
      status: homeScore !== undefined ? 'finished' : 'scheduled',
    };
    
    if (round) matchData.round = `Rodada ${round}`;
    if (homeScore !== undefined) matchData.home_score = homeScore;
    if (awayScore !== undefined) matchData.away_score = awayScore;
    
    await supabase.from('football_matches').upsert(
      matchData,
      { onConflict: 'competition_id,home_team_id,away_team_id,season,round' }
    );
    
    processed++;
  }
  
  return processed;
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
    
    console.log(`Syncing from CBF: ${action}, URL: ${source.url}`);
    
    // Ensure teams exist first
    await ensureTeamsExist(supabase);
    
    // Get competition ID - search by name containing "Série A" and order by season DESC
    const { data: competition } = await supabase
      .from('football_competitions')
      .select('id, slug, season')
      .ilike('name', '%Série A%')
      .order('season', { ascending: false })
      .limit(1)
      .single();
    
    if (!competition) {
      throw new Error('Competition Série A not found - please create it first');
    }
    
    console.log(`Using competition: ${competition.slug} (season ${competition.season})`);
    
    // Fetch CBF news page
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    };
    
    if (source.last_etag) {
      headers['If-None-Match'] = source.last_etag;
    }
    if (source.last_modified) {
      headers['If-Modified-Since'] = source.last_modified;
    }
    
    let response: Response;
    try {
      response = await fetch(source.url, { headers });
    } catch (fetchError: unknown) {
      throw new Error(`Failed to fetch CBF: ${fetchError instanceof Error ? fetchError.message : 'Unknown error'}`);
    }
    
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
      // Ensure initial standings exist
      itemsProcessed = await ensureStandingsExist(supabase, competition.id, season);
      
      // Parse news for any match results to update standings
      const newsItems = parseCbfNewsPage(html);
      console.log(`Parsed ${newsItems.length} news items from CBF`);
      
      // Process any match results found
      const matchesProcessed = await processMatchResults(supabase, competition.id, season, newsItems);
      itemsProcessed += matchesProcessed;
      
    } else if (action === 'matches') {
      // Parse news for match information
      const newsItems = parseCbfNewsPage(html);
      console.log(`Parsed ${newsItems.length} news items from CBF`);
      
      itemsProcessed = await processMatchResults(supabase, competition.id, season, newsItems);
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
