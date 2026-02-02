const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface NewsItem {
  id: string;
  title: string;
  source: string;
  published_at: string;
}

interface ProcessResult {
  id: string;
  title: string;
  source: string;
  originalDate: string | null;
  newDate: string | null;
  status: 'success' | 'error' | 'skipped';
  message?: string;
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

function extractDateFromContent(content: string): Date | null {
  // Normalize content
  const normalizedContent = content.toLowerCase();
  
  // Pattern 1: "27 JAN 2026" or "27 JANEIRO 2026" (most common in government sites)
  const pattern1 = /(\d{1,2})\s+(jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)\s+(\d{4})/i;
  
  // Pattern 2: "27/01/2026" or "27-01-2026" (dd/mm/yyyy format)
  const pattern2 = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/;
  
  // Pattern 3: "2026-01-27" (ISO format yyyy-mm-dd)
  const pattern3 = /(\d{4})-(\d{2})-(\d{2})/;
  
  // Pattern 4: "Publicado em 27 de janeiro de 2026" (formal Brazilian format)
  const pattern4 = /(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i;

  // Pattern 5: "27.01.2026" (dot separated)
  const pattern5 = /(\d{1,2})\.(\d{1,2})\.(\d{4})/;

  // Try pattern 1 - "27 JAN 2026"
  let match = content.match(pattern1);
  if (match) {
    const [, day, month, year] = match;
    const monthIndex = MONTH_MAP[month.toLowerCase()];
    if (monthIndex !== undefined) {
      console.log(`Pattern 1 matched: ${day} ${month} ${year}`);
      return new Date(parseInt(year), monthIndex, parseInt(day), 12, 0, 0);
    }
  }

  // Try pattern 4 - "27 de janeiro de 2026"
  match = content.match(pattern4);
  if (match) {
    const [, day, month, year] = match;
    const monthIndex = MONTH_MAP[month.toLowerCase()];
    if (monthIndex !== undefined) {
      console.log(`Pattern 4 matched: ${day} de ${month} de ${year}`);
      return new Date(parseInt(year), monthIndex, parseInt(day), 12, 0, 0);
    }
  }

  // Try pattern 2 - "27/01/2026"
  match = content.match(pattern2);
  if (match) {
    const [, day, month, year] = match;
    console.log(`Pattern 2 matched: ${day}/${month}/${year}`);
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  }

  // Try pattern 5 - "27.01.2026"
  match = content.match(pattern5);
  if (match) {
    const [, day, month, year] = match;
    console.log(`Pattern 5 matched: ${day}.${month}.${year}`);
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  }

  // Try pattern 3 - "2026-01-27"
  match = content.match(pattern3);
  if (match) {
    const [, year, month, day] = match;
    console.log(`Pattern 3 matched: ${year}-${month}-${day}`);
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0);
  }

  return null;
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

    // Extract date from the content
    const extractedDate = extractDateFromContent(markdown);
    
    if (extractedDate) {
      console.log(`Extracted date: ${extractedDate.toISOString()}`);
    } else {
      console.log('Could not extract date from content');
    }

    return extractedDate;
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
      targetDate = null // New: filter by specific published_at date (YYYY-MM-DD format)
    } = await req.json().catch(() => ({}));
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate date range dynamically
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

    console.log(`Options: dryRun=${dryRun}, limit=${limit}, onlyMissing=${onlyMissing}, targetDate=${targetDate}`);

    let query = supabase
      .from('news')
      .select('id, title, source, published_at, created_at, original_published_at')
      .not('source', 'is', null);

    // If targetDate provided, filter by that specific published_at date
    if (targetDate) {
      console.log(`Filtering by targetDate: ${targetDate}`);
      query = query
        .gte('published_at', `${targetDate}T00:00:00Z`)
        .lt('published_at', `${targetDate}T23:59:59Z`);
    } else {
      // Otherwise use created_at date range
      console.log(`Fetching news from ${startDate} to ${endDate}`);
      query = query
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    // Filter only news without original date (the ones that need correction)
    if (onlyMissing) {
      query = query.is('original_published_at', null);
    }

    const { data: newsItems, error: fetchError } = await query.limit(limit);

    if (fetchError) {
      throw new Error(`Error fetching news: ${fetchError.message}`);
    }

    console.log(`Found ${newsItems?.length || 0} news items to process`);

    if (!newsItems || newsItems.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No news items found for the specified date',
          processed: 0,
          results: [],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results: ProcessResult[] = [];

    for (const item of newsItems as NewsItem[]) {
      console.log(`\nProcessing: ${item.title}`);
      
      // Extract URL from source (may contain text like "Fonte: Portal da Prefeitura - https://...")
      const urlMatch = item.source.match(/https?:\/\/[^\s\]]+/);
      const sourceUrl = urlMatch ? urlMatch[0] : null;

      if (!sourceUrl) {
        results.push({
          id: item.id,
          title: item.title,
          source: item.source,
          originalDate: item.published_at,
          newDate: null,
          status: 'skipped',
          message: 'No valid URL found in source',
        });
        continue;
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1500));

      const extractedDate = await scrapeSourceDate(sourceUrl);

      if (!extractedDate) {
        results.push({
          id: item.id,
          title: item.title,
          source: sourceUrl,
          originalDate: item.published_at,
          newDate: null,
          status: 'error',
          message: 'Could not extract date from source',
        });
        continue;
      }

      const newDateIso = extractedDate.toISOString();

      if (!dryRun) {
        // Update the news item
        const { error: updateError } = await supabase
          .from('news')
          .update({ 
            published_at: newDateIso,
            original_published_at: newDateIso,
          })
          .eq('id', item.id);

        if (updateError) {
          results.push({
            id: item.id,
            title: item.title,
            source: sourceUrl,
            originalDate: item.published_at,
            newDate: newDateIso,
            status: 'error',
            message: `Update failed: ${updateError.message}`,
          });
          continue;
        }
      }

      results.push({
        id: item.id,
        title: item.title,
        source: sourceUrl,
        originalDate: item.published_at,
        newDate: newDateIso,
        status: 'success',
        message: dryRun ? 'Dry run - no update performed' : 'Updated successfully',
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
        summary: {
          success: successCount,
          errors: errorCount,
          skipped: skippedCount,
        },
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
