import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      newsId, 
      durationListenedSeconds, 
      completed = false,
      platform = 'web',
      fingerprint,
      referrer 
    } = await req.json();

    if (!newsId) {
      throw new Error('newsId is required');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get tenant_id from news
    const { data: news } = await supabase
      .from('news')
      .select('tenant_id')
      .eq('id', newsId)
      .single();

    // Get user agent from headers
    const userAgent = req.headers.get('user-agent') || '';

    // Insert analytics record
    const { error: insertError } = await supabase
      .from('news_audio_analytics')
      .insert({
        news_id: newsId,
        tenant_id: news?.tenant_id,
        duration_listened_seconds: durationListenedSeconds || 0,
        completed,
        platform,
        user_fingerprint: fingerprint,
        referrer,
        user_agent: userAgent,
      });

    if (insertError) {
      console.error('Analytics insert error:', insertError);
      throw new Error(`Failed to track analytics: ${insertError.message}`);
    }

    console.log(`Tracked audio listen: news=${newsId}, duration=${durationListenedSeconds}s, completed=${completed}`);

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in track-audio-analytics:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
