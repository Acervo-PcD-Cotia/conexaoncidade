import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegionalSource {
  id: string;
  city: string;
  name: string;
  type: 'rss' | 'listing';
  rss_url: string | null;
  listing_url: string | null;
  selectors: Record<string, string>;
  is_active: boolean;
  poll_interval_minutes: number;
  last_fetched_at: string | null;
  error_count: number;
  tags_default: string[];
  daily_max_items: number | null;
}

interface ParsedItem {
  url: string;
  title: string;
  excerpt?: string;
  published_at?: string;
  image_url?: string;
  raw_payload: Record<string, unknown>;
}

// Helper: sleep for delay
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper: validate URL for SSRF
function isValidSourceUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    // Block private IPs and localhost
    if (parsed.hostname.match(/^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/)) {
      return false;
    }
    // Only allow HTTP/HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Helper: check if error is TLS-related
function isTLSError(message: string): boolean {
  return /TLS|SSL|certificate|close_notify|peer closed|handshake|CERT/i.test(message);
}

// Helper: fetch with retry and TLS fallback
async function fetchWithRetry(url: string, maxRetries = 4): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, */*',
          'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
          'Connection': 'keep-alive',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
      
      if (response.status === 429 || response.status === 503) {
        console.log(`[Retry] Rate limited (${response.status}), waiting ${Math.pow(2, i) * 2}s...`);
        await sleep(Math.pow(2, i) * 2000);
        continue;
      }
      
      return response;
    } catch (e) {
      lastError = e instanceof Error ? e : new Error('Unknown error');
      console.log(`[Retry] Attempt ${i + 1}/${maxRetries} failed: ${lastError.message}`);
      
      // For TLS errors, try HTTP fallback on first attempt
      if (i === 0 && isTLSError(lastError.message)) {
        const httpUrl = url.replace('https://', 'http://');
        console.log(`[Retry] Trying HTTP fallback: ${httpUrl}`);
        try {
          const httpResponse = await fetch(httpUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/rss+xml, application/xml, text/xml, */*',
            },
          });
          if (httpResponse.ok) return httpResponse;
          console.log(`[Retry] HTTP fallback returned ${httpResponse.status}`);
        } catch (httpError) {
          console.log(`[Retry] HTTP fallback also failed`);
        }
      }
      
      // Exponential backoff: 2s, 4s, 8s, 16s
      const delay = Math.pow(2, i + 1) * 1000;
      console.log(`[Retry] Waiting ${delay / 1000}s before next attempt...`);
      await sleep(delay);
    }
  }
  
  throw lastError || new Error('Max retries exceeded');
}

// Parse RSS feed
async function parseRSSFeed(rssUrl: string): Promise<ParsedItem[]> {
  console.log(`[RSS] Fetching: ${rssUrl}`);
  
  if (!isValidSourceUrl(rssUrl)) {
    throw new Error('Invalid URL: blocked by SSRF protection');
  }
  
  const response = await fetchWithRetry(rssUrl);

  if (!response.ok) {
    throw new Error(`RSS fetch failed: ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const items: ParsedItem[] = [];

  // Simple XML parsing for RSS items
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    
    const getTagContent = (tag: string): string => {
      const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
      const m = itemXml.match(regex);
      return (m ? (m[1] || m[2] || '') : '').trim();
    };

    const link = getTagContent('link') || getTagContent('guid');
    const title = getTagContent('title');
    
    if (link && title) {
      const pubDate = getTagContent('pubDate') || getTagContent('dc:date');
      const description = getTagContent('description');
      const content = getTagContent('content:encoded');
      
      // Try to extract image from content or enclosure
      let imageUrl = '';
      const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]*type=["']image/i);
      if (enclosureMatch) {
        imageUrl = enclosureMatch[1];
      } else {
        const imgMatch = (content || description).match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
          imageUrl = imgMatch[1];
        }
      }

      items.push({
        url: link,
        title: title.replace(/<[^>]*>/g, '').trim(),
        excerpt: description.replace(/<[^>]*>/g, '').substring(0, 500),
        published_at: pubDate ? new Date(pubDate).toISOString() : undefined,
        image_url: imageUrl || undefined,
        raw_payload: {
          title,
          link,
          description,
          content: content.substring(0, 2000),
          pubDate,
        },
      });
    }
  }

  console.log(`[RSS] Found ${items.length} items`);
  return items;
}

// Parse listing page (HTML crawler)
async function parseListingPage(listingUrl: string, selectors: Record<string, string>): Promise<ParsedItem[]> {
  console.log(`[Listing] Fetching: ${listingUrl}`);
  
  const response = await fetch(listingUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`Listing fetch failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const items: ParsedItem[] = [];
  const baseUrl = new URL(listingUrl).origin;

  // Auto-detect news links using common patterns
  const linkPatterns = [
    /href=["']([^"']*(?:noticia|noticias|news|portal\/noticias)[^"']*)["']/gi,
    /href=["']([^"']*\/\d{4}\/\d{2}\/[^"']*)["']/gi,
    /href=["']([^"']*-\d+\.html?)["']/gi,
  ];

  const foundUrls = new Set<string>();

  for (const pattern of linkPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      let url = match[1];
      if (url.startsWith('/')) {
        url = baseUrl + url;
      } else if (!url.startsWith('http')) {
        url = baseUrl + '/' + url;
      }
      
      // Skip non-article URLs
      if (url.includes('javascript:') || url.includes('#') || url.endsWith('.pdf') || url.endsWith('.jpg')) {
        continue;
      }
      
      foundUrls.add(url);
    }
  }

  // Extract titles near links
  for (const url of foundUrls) {
    // Try to find title near the link in HTML
    const linkEscaped = url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const contextRegex = new RegExp(`(?:<[^>]*>)?([^<]{10,200})(?:<[^>]*>)?[^<]*${linkEscaped}|${linkEscaped}[^<]*(?:<[^>]*>)?([^<]{10,200})`, 'i');
    const contextMatch = html.match(contextRegex);
    
    let title = '';
    if (contextMatch) {
      title = (contextMatch[1] || contextMatch[2] || '').replace(/<[^>]*>/g, '').trim();
    }
    
    if (!title || title.length < 10) {
      // Use URL slug as title
      const slug = url.split('/').pop()?.replace(/[-_]/g, ' ').replace(/\.\w+$/, '') || 'Notícia';
      title = slug.charAt(0).toUpperCase() + slug.slice(1);
    }

    items.push({
      url,
      title: title.substring(0, 200),
      raw_payload: { detected_url: url },
    });
  }

  // Limit to 20 most recent
  console.log(`[Listing] Found ${items.length} items, limiting to 20`);
  return items.slice(0, 20);
}

// Main handler
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json().catch(() => ({}));
    const { source_id, dry_run = false } = body;

    console.log(`[Regional Ingest] Starting - source_id: ${source_id || 'all'}, dry_run: ${dry_run}`);

    // Get sources to process
    let query = supabase
      .from('regional_sources')
      .select('*')
      .eq('is_active', true)
      .neq('mode', 'off');

    if (source_id) {
      query = query.eq('id', source_id);
    }

    const { data: sources, error: sourcesError } = await query;

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    if (!sources || sources.length === 0) {
      return new Response(JSON.stringify({ success: true, message: 'No sources to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const source of sources as RegionalSource[]) {
      console.log(`\n[Processing] ${source.name} (${source.type})`);

      // Check poll interval
      if (source.last_fetched_at) {
        const lastFetch = new Date(source.last_fetched_at);
        const nextFetch = new Date(lastFetch.getTime() + source.poll_interval_minutes * 60 * 1000);
        if (new Date() < nextFetch && !source_id) {
          console.log(`[Skip] Not yet time to poll (next: ${nextFetch.toISOString()})`);
          continue;
        }
      }

      // Create run record
      let runId = null;
      if (!dry_run) {
        const { data: run } = await supabase
          .from('regional_ingest_runs')
          .insert({ source_id: source.id, status: 'running' })
          .select('id')
          .single();
        runId = run?.id;
      }

      try {
        let items: ParsedItem[] = [];

        if (source.type === 'rss' && source.rss_url) {
          items = await parseRSSFeed(source.rss_url);
        } else if (source.type === 'listing' && source.listing_url) {
          items = await parseListingPage(source.listing_url, source.selectors || {});
        }

        let newCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;

        if (!dry_run) {
          // Check daily limit
          const dailyMax = source.daily_max_items || 200;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          const { count: todayCount } = await supabase
            .from('regional_ingest_items')
            .select('*', { count: 'exact', head: true })
            .eq('source_id', source.id)
            .gte('created_at', today.toISOString());
          
          const remainingSlots = Math.max(0, dailyMax - (todayCount || 0));
          
          if (remainingSlots === 0) {
            console.log(`[Skip] Daily limit (${dailyMax}) reached for ${source.name}`);
            results.push({
              source_id: source.id,
              source_name: source.name,
              city: source.city,
              items_found: items.length,
              items_new: 0,
              items_duplicated: 0,
              items_errored: 0,
              skipped: 'daily_limit_reached',
            });
            continue;
          }
          
          // Limit items to remaining daily slots
          const itemsToProcess = items.slice(0, remainingSlots);
          
          for (const item of itemsToProcess) {
            // Try to insert (will fail if canonical_url exists)
            const { error: insertError } = await supabase
              .from('regional_ingest_items')
              .insert({
                source_id: source.id,
                canonical_url: item.url,
                title: item.title,
                excerpt: item.excerpt,
                image_url: item.image_url,
                published_at: item.published_at,
                raw_payload: item.raw_payload,
                status: 'new',
              });

            if (insertError) {
              if (insertError.code === '23505') {
                duplicateCount++;
              } else {
                console.error(`Insert error: ${insertError.message}`);
                errorCount++;
              }
            } else {
              newCount++;
            }
          }

          // Update source
          await supabase
            .from('regional_sources')
            .update({
              last_fetched_at: new Date().toISOString(),
              last_success_at: new Date().toISOString(),
              error_count: 0,
              last_error: null,
            })
            .eq('id', source.id);

          // Update run
          if (runId) {
            await supabase
              .from('regional_ingest_runs')
              .update({
                finished_at: new Date().toISOString(),
                status: errorCount > 0 ? 'warning' : 'ok',
                items_found: items.length,
                items_new: newCount,
                items_duplicated: duplicateCount,
                items_errored: errorCount,
                log: `Processed ${items.length} items: ${newCount} new, ${duplicateCount} duplicates, ${errorCount} errors`,
              })
              .eq('id', runId);
          }
        }

        results.push({
          source_id: source.id,
          source_name: source.name,
          city: source.city,
          items_found: items.length,
          items_new: newCount,
          items_duplicated: duplicateCount,
          items_errored: errorCount,
          preview: dry_run ? items.slice(0, 10) : undefined,
        });

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error(`[Error] ${source.name}: ${errorMessage}`);

        if (!dry_run) {
          // Update source with error
          await supabase
            .from('regional_sources')
            .update({
              last_fetched_at: new Date().toISOString(),
              error_count: (source.error_count || 0) + 1,
              last_error: errorMessage,
              // Pause if too many errors
              is_active: (source.error_count || 0) >= 4 ? false : source.is_active,
            })
            .eq('id', source.id);

          // Update run
          if (runId) {
            await supabase
              .from('regional_ingest_runs')
              .update({
                finished_at: new Date().toISOString(),
                status: 'error',
                log: errorMessage,
              })
              .eq('id', runId);
          }
        }

        results.push({
          source_id: source.id,
          source_name: source.name,
          city: source.city,
          error: errorMessage,
        });
      }
    }

    console.log(`\n[Regional Ingest] Complete - processed ${results.length} sources`);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[Regional Ingest] Fatal error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});