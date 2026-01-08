import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ShareResolveRequest {
  site_domain?: string;
  entity_type: 'news' | 'story' | 'custom';
  entity_id?: string;
  canonical_url?: string;
  channel: string;
  title?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: ShareResolveRequest = await req.json();
    const { site_domain, entity_type, entity_id, canonical_url, channel, title } = body;

    console.log('[share-resolver] Request:', { site_domain, entity_type, entity_id, channel });

    // 1. Resolve site by domain (or create/use default)
    let site = null;
    if (site_domain) {
      const { data: existingSite } = await supabase
        .from('sites')
        .select('*')
        .eq('primary_domain', site_domain)
        .single();
      
      site = existingSite;
    }

    // If no site found, try to get first available or create default
    if (!site) {
      const { data: defaultSite } = await supabase
        .from('sites')
        .select('*')
        .limit(1)
        .single();
      
      site = defaultSite;
    }

    // 2. Build unique key for idempotency
    const entityKey = entity_id || (canonical_url ? hashString(canonical_url) : 'unknown');
    const siteId = site?.id || 'default';
    const uniqueKey = `${siteId}_${entityKey}_${channel}`;

    // 3. Check if link already exists
    const { data: existingLink } = await supabase
      .from('links')
      .select('*')
      .eq('unique_key', uniqueKey)
      .single();

    if (existingLink) {
      console.log('[share-resolver] Found existing link:', existingLink.id);
      return new Response(JSON.stringify({
        share_url: existingLink.final_url || existingLink.destination_url,
        short_url: existingLink.short_url,
        link_id: existingLink.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 4. Build destination URL
    let destinationUrl = canonical_url || '';
    
    if (!destinationUrl && entity_type === 'news' && entity_id) {
      // Try to get news URL from database
      const { data: news } = await supabase
        .from('news')
        .select('slug')
        .eq('id', entity_id)
        .single();
      
      if (news && site) {
        const prefix = site.news_path_prefix || '/noticia/';
        destinationUrl = `${site.base_url}${prefix}${news.slug}`;
      }
    }

    if (!destinationUrl) {
      // Fallback: use referrer or return error
      console.error('[share-resolver] No destination URL could be determined');
      return new Response(JSON.stringify({
        share_url: canonical_url || '',
        link_id: '',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 5. Apply UTM parameters
    const utmMediumMap = site?.default_utm_medium_map as Record<string, string> | null;
    const utmSource = site?.default_utm_source || site_domain || 'share';
    const utmMedium = utmMediumMap?.[channel] || 'social';
    const utmCampaign = 'share';

    const finalUrl = new URL(destinationUrl);
    finalUrl.searchParams.set('utm_source', utmSource);
    finalUrl.searchParams.set('utm_medium', utmMedium);
    finalUrl.searchParams.set('utm_campaign', utmCampaign);
    finalUrl.searchParams.set('utm_content', channel);

    // 6. Generate short slug
    const shortSlug = generateShortSlug();
    const shortDomain = site?.short_domain || site?.base_url || supabaseUrl.replace('https://', '').split('.')[0] + '.lovable.app';
    const shortUrl = `${shortDomain.startsWith('http') ? '' : 'https://'}${shortDomain}/r/${shortSlug}`;

    // 7. Create link
    const { data: newLink, error: insertError } = await supabase
      .from('links')
      .insert({
        site_id: site?.id,
        destination_url: destinationUrl,
        canonical_url: destinationUrl,
        slug: shortSlug,
        short_url: shortUrl,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: channel,
        final_url: finalUrl.toString(),
        entity_type: entity_type,
        entity_id: entity_id,
        channel: channel,
        unique_key: uniqueKey,
        status: 'active',
      })
      .select()
      .single();

    if (insertError) {
      console.error('[share-resolver] Insert error:', insertError);
      // Return canonical URL as fallback
      return new Response(JSON.stringify({
        share_url: finalUrl.toString(),
        link_id: '',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[share-resolver] Created new link:', newLink.id);

    return new Response(JSON.stringify({
      share_url: newLink.final_url,
      short_url: newLink.short_url,
      link_id: newLink.id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[share-resolver] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      share_url: '', // Always return share_url to prevent client errors
      link_id: '',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function generateShortSlug(length: number = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
