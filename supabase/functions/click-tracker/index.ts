import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ClickTrackRequest {
  link_id?: string;
  bio_button_id?: string;
  referer?: string;
  user_agent?: string;
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

    const body: ClickTrackRequest = await req.json();
    const { link_id, bio_button_id, referer, user_agent } = body;

    console.log('[click-tracker] Tracking click:', { link_id, bio_button_id });

    if (!link_id && !bio_button_id) {
      return new Response(JSON.stringify({ error: 'link_id or bio_button_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse user agent
    const deviceInfo = parseUserAgent(user_agent || '');

    // Anonymize IP (get from headers and hash)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
      || req.headers.get('cf-connecting-ip') 
      || 'unknown';
    const ipHash = hashIP(clientIP);

    // Insert click event
    const { error: insertError } = await supabase
      .from('click_events')
      .insert({
        link_id: link_id || null,
        bio_button_id: bio_button_id || null,
        referer: referer || null,
        user_agent: user_agent || null,
        device_type: deviceInfo.device_type,
        browser: deviceInfo.browser,
        ip_hash: ipHash,
      });

    if (insertError) {
      console.error('[click-tracker] Insert error:', insertError);
    }

    // Increment counters
    if (link_id) {
      await supabase.rpc('increment_link_clicks', { p_link_id: link_id });
    }
    
    if (bio_button_id) {
      await supabase.rpc('increment_button_clicks', { p_button_id: bio_button_id });
    }

    console.log('[click-tracker] Click tracked successfully');

    // Return 204 No Content for async tracking
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });

  } catch (error) {
    console.error('[click-tracker] Error:', error);
    // Don't fail on tracking errors - return success anyway
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
});

function parseUserAgent(ua: string): { device_type: 'desktop' | 'mobile' | 'tablet'; browser: string } {
  const isMobile = /Mobile|Android|iPhone|iPod/i.test(ua);
  const isTablet = /Tablet|iPad/i.test(ua);
  
  let browser = 'Unknown';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';
  
  return {
    device_type: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
    browser,
  };
}

function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}
