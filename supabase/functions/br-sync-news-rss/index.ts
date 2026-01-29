import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsItem {
  title: string;
  link: string;
  excerpt?: string;
  imageUrl?: string;
  author?: string;
  publishedAt?: string;
}

// Parse news from GE HTML page (fallback from RSS)
function parseGeHtmlPage(html: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  // GE uses various patterns for news cards
  // Pattern 1: feed-post components
  const feedPostPattern = /<div[^>]*class="[^"]*feed-post[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi;
  
  // Pattern 2: bastian (their CMS) article cards  
  const articlePattern = /<article[^>]*>[\s\S]*?<\/article>/gi;
  
  // Pattern 3: Direct link parsing with titles
  const linkPattern = /<a[^>]+href="(https?:\/\/ge\.globo\.com\/[^"]*)"[^>]*>[\s\S]*?<\/a>/gi;
  
  // First, try to extract structured articles
  let matches = html.match(articlePattern) || [];
  
  for (const articleHtml of matches) {
    const item = extractNewsFromBlock(articleHtml);
    if (item) items.push(item);
  }
  
  // Also extract from links if articles not found
  if (items.length === 0) {
    let match;
    while ((match = linkPattern.exec(html)) !== null) {
      const url = match[1];
      const blockHtml = match[0];
      
      // Skip non-news links
      if (url.includes('/video/') || url.includes('/foto/') || url.includes('/ao-vivo/')) continue;
      
      const item = extractNewsFromBlock(blockHtml, url);
      if (item) items.push(item);
    }
  }
  
  // Dedupe by URL
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.link)) return false;
    seen.add(item.link);
    return true;
  }).slice(0, 30); // Limit to 30 most recent
}

function extractNewsFromBlock(html: string, defaultUrl?: string): NewsItem | null {
  // Extract URL
  const urlMatch = html.match(/href="(https?:\/\/ge\.globo\.com\/[^"]+)"/i);
  const url = urlMatch?.[1] || defaultUrl;
  
  if (!url) return null;
  
  // Extract title - try multiple patterns
  let title = '';
  
  // Pattern 1: h2/h3 title
  const titleMatch = html.match(/<h[123][^>]*>([\s\S]*?)<\/h[123]>/i);
  if (titleMatch) {
    title = cleanText(titleMatch[1]);
  }
  
  // Pattern 2: title attribute
  if (!title) {
    const titleAttr = html.match(/title="([^"]+)"/i);
    if (titleAttr) title = cleanText(titleAttr[1]);
  }
  
  // Pattern 3: aria-label
  if (!title) {
    const ariaLabel = html.match(/aria-label="([^"]+)"/i);
    if (ariaLabel) title = cleanText(ariaLabel[1]);
  }
  
  if (!title || title.length < 10) return null;
  
  // Skip non-Brasileirão content
  const brasileiraoKeywords = [
    'brasileir', 'série a', 'campeonato brasileiro',
    'flamengo', 'palmeiras', 'corinthians', 'são paulo', 'santos',
    'botafogo', 'fluminense', 'vasco', 'grêmio', 'internacional',
    'atlético', 'cruzeiro', 'bahia', 'fortaleza', 'athletico',
    'bragantino', 'vitória', 'juventude', 'cuiabá'
  ];
  
  const titleLower = title.toLowerCase();
  const isBrasileirao = brasileiraoKeywords.some(kw => titleLower.includes(kw));
  
  if (!isBrasileirao) return null;
  
  // Extract image
  const imgMatch = html.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
  const imageUrl = imgMatch?.[1];
  
  // Extract excerpt
  const excerptMatch = html.match(/<p[^>]*class="[^"]*(?:summary|excerpt|description)[^"]*"[^>]*>([\s\S]*?)<\/p>/i);
  const excerpt = excerptMatch ? cleanText(excerptMatch[1]) : undefined;
  
  // Extract time
  const timeMatch = html.match(/<time[^>]*datetime="([^"]+)"/i);
  const publishedAt = timeMatch?.[1];
  
  return {
    title: title.substring(0, 500),
    link: url,
    excerpt: excerpt?.substring(0, 1000),
    imageUrl,
    publishedAt,
  };
}

function cleanText(text: string): string {
  if (!text) return '';
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse RSS XML (fallback)
function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  
  const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi);
  if (!itemMatches) return items;
  
  for (const itemXml of itemMatches) {
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link');
    const description = extractTag(itemXml, 'description');
    const pubDate = extractTag(itemXml, 'pubDate');
    const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator');
    
    let imageUrl = '';
    const enclosureMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"[^>]*type="image/i);
    if (enclosureMatch) {
      imageUrl = enclosureMatch[1];
    } else {
      const mediaMatch = itemXml.match(/<media:content[^>]+url="([^"]+)"/i);
      if (mediaMatch) imageUrl = mediaMatch[1];
    }
    
    if (title && link) {
      items.push({
        title: cleanText(title),
        link,
        excerpt: cleanText(description),
        publishedAt: pubDate,
        author: cleanText(author),
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

// Check rate limit
async function checkRateLimit(supabase: any, sourceKey: string): Promise<boolean> {
  const BUCKET_SIZE = 20;
  const REFILL_RATE = 2;
  
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
    
    const { source: sourceFilter } = await req.json().catch(() => ({}));
    
    // Get enabled sources (both RSS and HTML types)
    let query = supabase
      .from('br_sources')
      .select('*')
      .in('kind', ['rss', 'html'])
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
        JSON.stringify({ message: 'No news sources enabled' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const results: Record<string, any> = {};
    
    for (const source of sources) {
      const sourceStartTime = Date.now();
      
      try {
        const canProceed = await checkRateLimit(supabase, source.key);
        if (!canProceed) {
          results[source.key] = { error: 'Rate limited', skipped: true };
          continue;
        }
        
        console.log(`Fetching news from ${source.name}: ${source.url}`);
        
        const headers: Record<string, string> = {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
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
        
        const content = await response.text();
        
        // Parse based on content type
        let items: NewsItem[];
        const contentType = response.headers.get('Content-Type') || '';
        
        if (contentType.includes('xml') || source.kind === 'rss') {
          items = parseRSS(content);
        } else {
          items = parseGeHtmlPage(content);
        }
        
        console.log(`Parsed ${items.length} items from ${source.name}`);
        
        let itemsNew = 0;
        let itemsSkipped = 0;
        
        for (const item of items) {
          // Check if already exists
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
          if (item.publishedAt) {
            try {
              publishedAt = new Date(item.publishedAt).toISOString();
            } catch {
              publishedAt = new Date().toISOString();
            }
          }
          
          // Insert new item
          const { error: insertError } = await supabase.from('br_news_items').insert({
            source_key: source.key,
            title: item.title.substring(0, 500),
            url: item.link,
            excerpt: item.excerpt?.substring(0, 1000) || null,
            image_url: item.imageUrl || null,
            published_at: publishedAt,
            author: item.author?.substring(0, 200) || null,
          });
          
          if (insertError) {
            if (insertError.code === '23505') {
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
    console.error('News sync error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
