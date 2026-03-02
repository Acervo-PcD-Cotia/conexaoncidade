const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsItem {
  id: string;
  title: string;
  source: string;
  published_at: string;
  original_published_at: string | null;
  slug: string;
}

interface ProcessResult {
  id: string;
  title: string;
  source: string;
  originalDate: string | null;
  newDate: string | null;
  status: 'success' | 'error' | 'skipped';
  message?: string;
  method?: string;
}

const MONTH_MAP: Record<string, number> = {
  'jan': 0, 'janeiro': 0,
  'fev': 1, 'fevereiro': 1,
  'mar': 2, 'março': 2,
  'abr': 3, 'abril': 3,
  'mai': 4, 'maio': 4,
  'jun': 5, 'junho': 5,
  'jul': 6, 'julho': 6,
  'ago': 7, 'agosto': 7,
  'set': 8, 'setembro': 8,
  'out': 9, 'outubro': 9,
  'nov': 10, 'novembro': 10,
  'dez': 11, 'dezembro': 11,
};

// Known source URL patterns for municipal portals
const SOURCE_URL_PATTERNS: Record<string, string> = {
  'Prefeitura de Cotia': 'https://cotia.sp.gov.br/',
  'Prefeitura de Barueri': 'https://portal.barueri.sp.gov.br/Noticia/',
  'Prefeitura de Osasco': 'https://osasco.sp.gov.br/',
  'Prefeitura de Itapevi': 'https://itapevi.sp.gov.br/',
  'Prefeitura de Jandira': 'https://jandira.sp.gov.br/',
  'Prefeitura de Carapicuíba': 'https://carapicuiba.sp.gov.br/',
};

// Normalize source to standard name
function normalizeSource(source: string): string {
  if (!source) return source;
  
  // Already normalized
  if (source.startsWith('Prefeitura de ') && !source.includes('http')) {
    return source;
  }
  
  // Extract from URL
  const urlLower = source.toLowerCase();
  if (urlLower.includes('cotia.sp.gov.br')) return 'Prefeitura de Cotia';
  if (urlLower.includes('barueri.sp.gov.br')) return 'Prefeitura de Barueri';
  if (urlLower.includes('osasco.sp.gov.br')) return 'Prefeitura de Osasco';
  if (urlLower.includes('itapevi.sp.gov.br')) return 'Prefeitura de Itapevi';
  if (urlLower.includes('jandira.sp.gov.br')) return 'Prefeitura de Jandira';
  if (urlLower.includes('carapicuiba.sp.gov.br')) return 'Prefeitura de Carapicuíba';
  if (urlLower.includes('embu.sp.gov.br') || urlLower.includes('embudasartes')) return 'Prefeitura de Embu das Artes';
  if (urlLower.includes('itapecerica')) return 'Prefeitura de Itapecerica da Serra';
  if (urlLower.includes('vfrancisco') || urlLower.includes('vargem')) return 'Prefeitura de Vargem Grande Paulista';
  if (urlLower.includes('saoroque')) return 'Prefeitura de São Roque';
  if (urlLower.includes('ibiuna')) return 'Prefeitura de Ibiúna';
  if (urlLower.includes('agenciabrasil')) return 'Agência Brasil';
  
  // Remove duplications like "Prefeitura de Cotia – Prefeitura de Cotia"
  const parts = source.split(/[–—\-]/).map(p => p.trim());
  if (parts.length > 1 && parts[0] === parts[1]) {
    return parts[0];
  }
  
  // Remove everything after the prefeitura name
  const prefMatch = source.match(/^(Prefeitura\s+(?:Municipal\s+)?de\s+\S+(?:\s+\S+)?)/i);
  if (prefMatch) {
    return prefMatch[1].trim();
  }
  
  return source;
}

// Extract date from URL path (e.g., Barueri: /27-02-2026-slug or /Noticia/27-02-2026-slug)
function extractDateFromUrl(url: string): Date | null {
  if (!url) return null;
  
  // Barueri pattern: DD-MM-YYYY in URL path
  const barueriPattern = /\/(\d{2})-(\d{2})-(\d{4})-/;
  const match = url.match(barueriPattern);
  if (match) {
    const [, day, month, year] = match;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
    if (!isNaN(d.getTime())) {
      console.log(`URL date extracted: ${d.toISOString()} from ${url}`);
      return d;
    }
  }
  
  // Generic pattern: YYYY-MM-DD in URL
  const isoPattern = /\/(\d{4})-(\d{2})-(\d{2})/;
  const isoMatch = url.match(isoPattern);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
    if (!isNaN(d.getTime())) {
      console.log(`ISO URL date extracted: ${d.toISOString()}`);
      return d;
    }
  }
  
  // Cotia pattern: /YYYY/MM/ in upload paths or content
  const yearMonthPattern = /\/(\d{4})\/(\d{2})\//;
  const ymMatch = url.match(yearMonthPattern);
  if (ymMatch) {
    // This gives us year/month but not day - not reliable enough
    return null;
  }
  
  return null;
}

function extractDateFromContent(content: string): Date | null {
  const normalizedContent = content.toLowerCase();
  
  // Pattern 1: "27 JAN 2026" or "27 JANEIRO 2026"
  const pattern1 = /(\d{1,2})\s+(jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)\s+(\d{4})/i;
  
  // Pattern 2: "27/01/2026" or "27-01-2026"
  const pattern2 = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
  
  // Pattern 3: "2026-01-27" (ISO format)
  const pattern3 = /(\d{4})-(\d{2})-(\d{2})/;
  
  // Pattern 4: "27 de janeiro de 2026"
  const pattern4 = /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i;

  // Pattern 5: "27.01.2026"
  const pattern5 = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;

  let match = content.match(pattern1);
  if (match) {
    const [, day, month, year] = match;
    const monthIndex = MONTH_MAP[month.toLowerCase()];
    if (monthIndex !== undefined) {
      return new Date(parseInt(year), monthIndex, parseInt(day), 12, 0, 0);
    }
  }

  match = content.match(pattern4);
  if (match) {
    const [, day, month, year] = match;
    const monthIndex = MONTH_MAP[month.toLowerCase()];
    if (monthIndex !== undefined) {
      return new Date(parseInt(year), monthIndex, parseInt(day), 12, 0, 0);
    }
  }

  match = content.match(pattern2);
  if (match) {
    const [, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  }

  match = content.match(pattern5);
  if (match) {
    const [, day, month, year] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  }

  match = content.match(pattern3);
  if (match) {
    const [, year, month, day] = match;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  }

  return null;
}

// Reconstruct source URL from normalized source name + slug
function reconstructSourceUrl(source: string, slug: string): string | null {
  const baseUrl = SOURCE_URL_PATTERNS[source];
  if (!baseUrl) return null;
  
  if (source === 'Prefeitura de Cotia') {
    return `${baseUrl}${slug}/`;
  }
  if (source === 'Prefeitura de Barueri') {
    // Barueri URLs have date prefix in slug, we can't reliably reconstruct
    return null;
  }
  
  return `${baseUrl}${slug}`;
}

async function scrapeSourceDate(sourceUrl: string): Promise<Date | null> {
  const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!apiKey) {
    console.error('FIRECRAWL_API_KEY not configured');
    return null;
  }

  try {
    console.log(`Scraping: ${sourceUrl}`);
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: sourceUrl,
        formats: ['markdown'],
        onlyMainContent: false,
        waitFor: 2000,
      }),
    });

    if (!response.ok) {
      console.error(`Firecrawl error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const markdown = data.data?.markdown || data.markdown || '';
    
    if (!markdown) {
      console.log('No content received from Firecrawl');
      return null;
    }

    return extractDateFromContent(markdown);
  } catch (error) {
    console.error(`Error scraping ${sourceUrl}:`, error);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      dryRun = true, 
      limit = 50, 
      daysBack = 30,
      onlyMissing = true,
      targetDate = null,
      newsIds = null,
      normalizeSourceNames = false, // NEW: also normalize source names
    } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    console.log(`Options: dryRun=${dryRun}, limit=${limit}, onlyMissing=${onlyMissing}, normalizeSourceNames=${normalizeSourceNames}`);

    let query = supabase
      .from('news')
      .select('id, title, source, published_at, created_at, original_published_at, slug')
      .not('source', 'is', null);

    if (newsIds && Array.isArray(newsIds) && newsIds.length > 0) {
      query = query.in('id', newsIds);
    } else if (targetDate) {
      query = query
        .gte('published_at', `${targetDate}T00:00:00Z`)
        .lt('published_at', `${targetDate}T23:59:59Z`);
    } else {
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    if (onlyMissing) {
      query = query.is('original_published_at', null);
    }

    const { data: newsItems, error: fetchError } = await query.limit(limit);

    if (fetchError) throw new Error(`Error fetching news: ${fetchError.message}`);

    if (!newsItems || newsItems.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No news items found', processed: 0, results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: ProcessResult[] = [];

    for (const item of newsItems as NewsItem[]) {
      console.log(`\nProcessing: ${item.title}`);
      
      // Step 1: Try to extract URL from source field
      const urlMatch = item.source?.match(/https?:\/\/[^\s\]]+/);
      let sourceUrl = urlMatch ? urlMatch[0] : null;
      
      // Step 2: If source is a name (not URL), try to reconstruct URL from slug
      if (!sourceUrl && item.slug) {
        sourceUrl = reconstructSourceUrl(item.source, item.slug);
        if (sourceUrl) {
          console.log(`Reconstructed URL: ${sourceUrl}`);
        }
      }

      // Step 3: Try to extract date from URL path first (fastest, no API call)
      let extractedDate: Date | null = null;
      let method = '';
      
      if (sourceUrl) {
        extractedDate = extractDateFromUrl(sourceUrl);
        if (extractedDate) {
          method = 'url_pattern';
        }
      }

      // Step 4: If URL extraction failed, try scraping
      if (!extractedDate && sourceUrl) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        extractedDate = await scrapeSourceDate(sourceUrl);
        if (extractedDate) {
          method = 'scraping';
        }
      }

      // Step 5: Normalize source name if requested
      const normalizedSource = normalizeSourceNames ? normalizeSource(item.source) : null;

      if (!extractedDate && !normalizedSource) {
        results.push({
          id: item.id,
          title: item.title,
          source: item.source,
          originalDate: item.published_at,
          newDate: null,
          status: sourceUrl ? 'error' : 'skipped',
          message: sourceUrl ? 'Could not extract date from source' : 'No valid URL found in source',
        });
        continue;
      }

      const updateData: Record<string, string> = {};
      const messages: string[] = [];
      
      if (extractedDate) {
        const newDateIso = extractedDate.toISOString();
        updateData.published_at = newDateIso;
        updateData.original_published_at = newDateIso;
        messages.push(`Data: ${newDateIso.split('T')[0]} (${method})`);
      }
      
      if (normalizedSource && normalizedSource !== item.source) {
        updateData.source = normalizedSource;
        messages.push(`Fonte: ${normalizedSource}`);
      }

      if (!dryRun && Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('news')
          .update(updateData)
          .eq('id', item.id);

        if (updateError) {
          results.push({
            id: item.id,
            title: item.title,
            source: item.source,
            originalDate: item.published_at,
            newDate: extractedDate?.toISOString() || null,
            status: 'error',
            message: `Update failed: ${updateError.message}`,
            method,
          });
          continue;
        }
      }

      results.push({
        id: item.id,
        title: item.title,
        source: normalizedSource || item.source,
        originalDate: item.published_at,
        newDate: extractedDate?.toISOString() || null,
        status: extractedDate || normalizedSource ? 'success' : 'skipped',
        message: messages.join(' | ') || (dryRun ? 'Dry run' : 'No changes needed'),
        method,
      });
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        processed: results.length,
        summary: { success: successCount, errors: errorCount, skipped: skippedCount },
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
