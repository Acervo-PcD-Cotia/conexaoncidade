import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    
    const {
      news_id,
      session_id,
      user_id,
      time_on_page_seconds,
      scroll_depth_percent,
      scroll_depth_max,
      audio_played,
      audio_play_count,
      audio_total_listen_seconds,
      podcast_played,
      podcast_play_count,
      summary_expanded,
      toc_clicked,
      shared,
      share_platform,
      referrer,
      user_agent,
      device_type,
      viewport_width,
      read_completed,
    } = body;

    if (!news_id || !session_id) {
      return new Response(
        JSON.stringify({ error: "news_id and session_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get tenant_id from news
    const { data: newsData } = await supabase
      .from("news")
      .select("tenant_id")
      .eq("id", news_id)
      .single();

    const tenant_id = newsData?.tenant_id;

    // Upsert analytics data
    const { error } = await supabase
      .from("news_reading_analytics")
      .upsert(
        {
          news_id,
          session_id,
          tenant_id,
          user_id: user_id || null,
          time_on_page_seconds: time_on_page_seconds || 0,
          scroll_depth_percent: scroll_depth_percent || 0,
          scroll_depth_max: scroll_depth_max || 0,
          audio_played: audio_played || false,
          audio_play_count: audio_play_count || 0,
          audio_total_listen_seconds: audio_total_listen_seconds || 0,
          podcast_played: podcast_played || false,
          podcast_play_count: podcast_play_count || 0,
          summary_expanded: summary_expanded || false,
          toc_clicked: toc_clicked || false,
          shared: shared || false,
          share_platform: share_platform || null,
          referrer: referrer || null,
          user_agent: user_agent || null,
          device_type: device_type || null,
          viewport_width: viewport_width || null,
          read_completed: read_completed || false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "news_id,session_id",
        }
      );

    if (error) {
      console.error("[track-reading-analytics] Error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[track-reading-analytics] Tracked: news=${news_id}, session=${session_id}, time=${time_on_page_seconds}s, scroll=${scroll_depth_max}%`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("[track-reading-analytics] Error:", error);
    const errMsg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
