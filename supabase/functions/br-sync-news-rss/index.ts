import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  author?: string;
  imageUrl?: string;
}

// Parse RSS XML
function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  
  // Simple regex-based parsing for RSS items
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi);
  
  if (!itemMatches) return items;
  
  for (const itemXml of itemMatches) {
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description');
    const pubDate = extractTag(itemXml, 'pubDate');
    const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator');
    
    // Try to extract image from enclosure or media:content
    let imageUrl = '';
    const enclosureMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i);
    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    } else {
      const mediaMatch = itemXml.match(/<media:content[^>]+url="([^"]+)"/i);
      if (mediaMatch) {
        imageUrl = mediaMatch[1];
      }
    }
    
    if (title && link) {
      items.push({
        title: cleanHtml(title),
        link,
        description: cleanHtml(description),
        pubDate,
        author: cleanHtml(author),
        imageUrl,
      });
    }
  }
  
  return items;
}

function extractTag(xml: string, tagName: string): string {
  const regex = new RegExp(`<${tagName}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tagName}>`, 'i');
  const match = xml.match(regex);
  return match ? match[1].trim() : '';
}

function cleanHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

// Check rate limit
async function checkRateLimit(supabase: any, sourceKey: string): Promise<boolean> {
  const BUCKET_SIZE = 20;
  const REFILL_RATE = 2; // tokens per minute
  
  const { data: state } = await supabase
    .from('br_rate_state')
    .select('*')
    .eq('source_key', sourceKey)
    .single();
  
  if (!state) return true;
  
  if (state.circuit_open && state.circuit_open_until) {
    if (new Date(state.circuit_open_until) > new Date()) {
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
  
  if (tokens < 1) return false;
  
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
      const openUntil = new Date(Date.now() + 15 * 60 * 1000);
      await supabase
        .from('br_rate_state')
        .update({ circuit_open: true, circuit_open_until: openUntil.toISOString() })
        .eq('source_key', sourceKey);
    }
  }
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
    const { source: sourceFilter } = await req.json().catch(() => ({}));
    
    // Get enabled RSS sources
    let query = supabase
      .from('br_sources')
      .select('*')
      .eq('kind', 'rss')
      .eq('is_enabled', true);
    
    if (sourceFilter) {
      query = query.eq('key', sourceFilter);
    }
    
    const { data: sources, error: sourcesError } = await query;
    
    if (sourcesError) {
      throw new Error(`Failed to get sources: ${sourcesError.message}`);
    }
    
    if (!sources || sources.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No RSS sources enabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results: Record<string, any> = {};
    
    for (const source of sources) {
      const sourceStartTime = Date.now();
      
      try {
        // Check rate limit
        const canProceed = await checkRateLimit(supabase, source.key);
        if (!canProceed) {
          results[source.key] = { error: 'Rate limited', skipped: true };
          continue;
        }
        
        console.log(`Fetching RSS from ${source.name}: ${source.url}`);
        
        const headers: Record<string, string> = {
          'User-Agent': 'ConexaoNaCidade/1.0 NewsBot',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        };
        
        if (source.last_etag) {
          headers['If-None-Match'] = source.last_etag;
        }
        if (source.last_modified) {
          headers['If-Modified-Since'] = source.last_modified;
        }
        
        const response = await fetch(source.url, { headers });
        
        if (response.status === 304) {
          results[source.key] = { cached: true, itemsNew: 0 };
          await logFetch(supabase, source.key, true, 'Not modified (304)', 0, Date.now() - sourceStartTime);
          continue;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Save cache headers
        const etag = response.headers.get('ETag');
        const lastModified = response.headers.get('Last-Modified');
        if (etag || lastModified) {
          await supabase
            .from('br_sources')
            .update({ last_etag: etag, last_modified: lastModified })
            .eq('key', source.key);
        }
        
        const xml = await response.text();
        const items = parseRSS(xml);
        
        console.log(`Parsed ${items.length} items from ${source.name}`);
        
        let itemsNew = 0;
        let itemsSkipped = 0;
        
        for (const item of items) {
          // Check if already exists (dedupe by URL)
          const { data: existing } = await supabase
            .from('br_news_items')
            .select('id')
            .eq('url', item.link)
            .single();
          
          if (existing) {
            itemsSkipped++;
            continue;
          }
          
          // Parse date
          let publishedAt: string | null = null;
          if (item.pubDate) {
            try {
              publishedAt = new Date(item.pubDate).toISOString();
            } catch {
              publishedAt = new Date().toISOString();
            }
          }
          
          // Insert new item
          const { error: insertError } = await supabase.from('br_news_items').insert({
            source_key: source.key,
            title: item.title.substring(0, 500),
            url: item.link,
            excerpt: item.description?.substring(0, 1000) || null,
            image_url: item.imageUrl || null,
            published_at: publishedAt,
            author: item.author?.substring(0, 200) || null,
          });
          
          if (insertError) {
            if (insertError.code === '23505') {
              // Duplicate URL, skip
              itemsSkipped++;
            } else {
              console.error(`Insert error for ${item.link}:`, insertError);
            }
          } else {
            itemsNew++;
          }
        }
        
        results[source.key] = {
          itemsFound: items.length,
          itemsNew,
          itemsSkipped,
        };
        
        await logFetch(
          supabase, 
          source.key, 
          true, 
          `Found ${items.length}, added ${itemsNew}, skipped ${itemsSkipped}`,
          itemsNew,
          Date.now() - sourceStartTime
        );
        
      } catch (sourceError: unknown) {
        console.error(`Error syncing ${source.key}:`, sourceError);
        const errorMessage = sourceError instanceof Error ? sourceError.message : 'Unknown error';
        results[source.key] = { error: errorMessage };
        await logFetch(supabase, source.key, false, errorMessage, 0, Date.now() - sourceStartTime);
      }
    }
    
    const duration = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: true,
        sources: results,
        duration: `${duration}ms`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error: unknown) {
    console.error('RSS sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
