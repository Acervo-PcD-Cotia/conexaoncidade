import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BroadcastInfo {
  tvOpen: string[];
  tvClosed: string[];
  streaming: string[];
}

// Default broadcast rules based on day/time
function getDefaultBroadcast(matchDate: Date, isClassico: boolean): BroadcastInfo {
  const dayOfWeek = matchDate.getDay();
  const hour = matchDate.getHours();
  
  const broadcast: BroadcastInfo = {
    tvOpen: [],
    tvClosed: [],
    streaming: [],
  };
  
  // Sunday games
  if (dayOfWeek === 0) {
    if (hour >= 16 && hour < 18) {
      // 16h Sunday - Premiere exclusive
      broadcast.tvClosed = ['Premiere'];
      broadcast.streaming = ['Globoplay'];
    } else if (hour >= 18 && hour < 20) {
      // 18h Sunday - Usually Globo
      broadcast.tvOpen = ['TV Globo'];
      broadcast.tvClosed = ['SporTV', 'Premiere'];
      broadcast.streaming = ['Globoplay'];
    } else if (hour >= 20) {
      // 20h+ Sunday - Prime time
      broadcast.tvOpen = ['TV Globo'];
      broadcast.streaming = ['Globoplay'];
    }
  }
  
  // Saturday games
  if (dayOfWeek === 6) {
    if (hour >= 16 && hour < 19) {
      broadcast.tvClosed = ['Premiere'];
      broadcast.streaming = ['Globoplay'];
    } else if (hour >= 19 && hour < 21) {
      // 19h Saturday - Often Globo
      broadcast.tvOpen = ['TV Globo'];
      broadcast.tvClosed = ['SporTV'];
      broadcast.streaming = ['Globoplay'];
    } else if (hour >= 21) {
      // 21h Saturday - Premiere
      broadcast.tvClosed = ['Premiere'];
      broadcast.streaming = ['Globoplay'];
    }
  }
  
  // Weekday games (Wednesday/Thursday)
  if (dayOfWeek >= 3 && dayOfWeek <= 4) {
    if (hour >= 19 && hour < 21) {
      broadcast.tvClosed = ['SporTV', 'Premiere'];
      broadcast.streaming = ['Globoplay'];
    } else if (hour >= 21) {
      broadcast.tvClosed = ['Premiere'];
      broadcast.streaming = ['Globoplay'];
    }
  }
  
  // Clássicos get priority on open TV
  if (isClassico && broadcast.tvOpen.length === 0) {
    broadcast.tvOpen = ['TV Globo'];
  }
  
  // Fallback - all games on Premiere
  if (broadcast.tvOpen.length === 0 && broadcast.tvClosed.length === 0) {
    broadcast.tvClosed = ['Premiere'];
    broadcast.streaming = ['Globoplay'];
  }
  
  return broadcast;
}

// Check if it's a classic match
function isClassicoMatch(homeTeam: string, awayTeam: string): boolean {
  const classicos = [
    ['flamengo', 'vasco'],
    ['flamengo', 'fluminense'],
    ['flamengo', 'botafogo'],
    ['vasco', 'fluminense'],
    ['vasco', 'botafogo'],
    ['fluminense', 'botafogo'],
    ['corinthians', 'palmeiras'],
    ['corinthians', 'sao-paulo'],
    ['corinthians', 'santos'],
    ['palmeiras', 'sao-paulo'],
    ['palmeiras', 'santos'],
    ['sao-paulo', 'santos'],
    ['gremio', 'internacional'],
    ['atletico-mg', 'cruzeiro'],
    ['bahia', 'vitoria'],
  ];
  
  const home = homeTeam.toLowerCase();
  const away = awayTeam.toLowerCase();
  
  return classicos.some(([a, b]) => 
    (home.includes(a) && away.includes(b)) || (home.includes(b) && away.includes(a))
  );
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
    
    const { matchId, overwrite = false } = await req.json().catch(() => ({}));
    
    // Get upcoming matches without broadcast info
    let query = supabase
      .from('football_matches')
      .select(`
        id,
        match_date,
        home_team:home_team_id(id, name, slug),
        away_team:away_team_id(id, name, slug),
        competition:competition_id(slug)
      `)
      .gte('match_date', new Date().toISOString())
      .order('match_date', { ascending: true })
      .limit(50);
    
    if (matchId) {
      query = supabase
        .from('football_matches')
        .select(`
          id,
          match_date,
          home_team:home_team_id(id, name, slug),
          away_team:away_team_id(id, name, slug),
          competition:competition_id(slug)
        `)
        .eq('id', matchId);
    }
    
    const { data: matches, error: matchesError } = await query;
    
    if (matchesError) {
      throw new Error(`Failed to fetch matches: ${matchesError.message}`);
    }
    
    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No matches to process' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing ${matches.length} matches for broadcast info`);
    
    let processed = 0;
    let skipped = 0;
    
    for (const match of matches) {
      // Check if broadcast already exists
      if (!overwrite) {
        const { data: existing } = await supabase
          .from('br_broadcasts')
          .select('id')
          .eq('match_id', match.id)
          .single();
        
        if (existing) {
          skipped++;
          continue;
        }
      }
      
      const homeTeam = match.home_team as any;
      const awayTeam = match.away_team as any;
      
      if (!homeTeam || !awayTeam) {
        console.log(`Match ${match.id} missing team info, skipping`);
        continue;
      }
      
      const matchDate = new Date(match.match_date);
      const isClassico = isClassicoMatch(homeTeam.slug || homeTeam.name, awayTeam.slug || awayTeam.name);
      const broadcast = getDefaultBroadcast(matchDate, isClassico);
      
      // Upsert broadcast info
      const { error: upsertError } = await supabase
        .from('br_broadcasts')
        .upsert({
          match_id: match.id,
          tv_open: broadcast.tvOpen,
          tv_closed: broadcast.tvClosed,
          streaming: broadcast.streaming,
          updated_from: 'manual',
        }, { onConflict: 'match_id' });
      
      if (upsertError) {
        console.error(`Failed to upsert broadcast for match ${match.id}:`, upsertError);
      } else {
        processed++;
        console.log(`Set broadcast for ${homeTeam.name} x ${awayTeam.name}: ${broadcast.tvOpen.join(', ')} / ${broadcast.tvClosed.join(', ')}`);
      }
    }
    
    // Log the sync
    await supabase.from('br_fetch_logs').insert({
      source_key: 'broadcasts_sync',
      success: true,
      message: `Processed ${processed} matches, skipped ${skipped}`,
      items_processed: processed,
      duration_ms: Date.now() - startTime,
    });
    
    return new Response(
      JSON.stringify({
        success: true,
        processed,
        skipped,
        duration: `${Date.now() - startTime}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('Broadcast sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
