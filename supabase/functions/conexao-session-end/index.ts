import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-session-end] Ending session: ${session_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the broadcast/session
    const { data: broadcast, error: fetchError } = await supabase
      .from("broadcasts")
      .select("*")
      .eq("id", session_id)
      .single();

    if (fetchError || !broadcast) {
      console.error("[conexao-session-end] Broadcast not found:", fetchError);
      return new Response(
        JSON.stringify({ error: "Session not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate duration if we have actual_start
    let durationSeconds = 0;
    if (broadcast.actual_start) {
      const startTime = new Date(broadcast.actual_start);
      const endTime = new Date();
      durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }

    // Update the broadcast status
    const { error: updateError } = await supabase
      .from("broadcasts")
      .update({
        status: "ended",
        actual_end: new Date().toISOString(),
      })
      .eq("id", session_id);

    if (updateError) {
      console.error("[conexao-session-end] Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update session" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-session-end] Session ended. Duration: ${durationSeconds}s`);

    return new Response(
      JSON.stringify({
        success: true,
        session_id,
        duration_seconds: durationSeconds,
        peak_viewers: broadcast.peak_viewers || 0,
        total_views: broadcast.total_views || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-session-end] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
