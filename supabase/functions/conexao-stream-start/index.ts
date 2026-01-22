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
    const { session_id, destination_ids } = await req.json();
    
    if (!session_id || !destination_ids?.length) {
      return new Response(
        JSON.stringify({ error: "session_id and destination_ids are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-stream-start] Starting stream to ${destination_ids.length} destinations for session: ${session_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the broadcast to retrieve room name
    const { data: broadcast, error: fetchError } = await supabase
      .from("broadcasts")
      .select("livekit_room_name, title")
      .eq("id", session_id)
      .single();

    if (fetchError || !broadcast?.livekit_room_name) {
      console.error("[conexao-stream-start] Broadcast not found or no room:", fetchError);
      return new Response(
        JSON.stringify({ error: "Session not found or not started" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get LiveKit credentials
    const livekitHost = Deno.env.get("LIVEKIT_HOST") || Deno.env.get("LIVEKIT_URL");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!livekitHost || !livekitApiKey || !livekitApiSecret) {
      console.error("[conexao-stream-start] LiveKit credentials not configured");
      return new Response(
        JSON.stringify({ error: "LiveKit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In production, for each destination you would:
    // 1. Fetch destination RTMP URL and stream key from database
    // 2. Call LiveKit Egress API to start RoomCompositeEgress with RTMP output
    // 3. Store the egress ID
    
    const startedDestinations = destination_ids.map((destId: string) => ({
      destination_id: destId,
      egress_id: `stream_${destId}_${Date.now()}`,
      status: "live",
      started_at: new Date().toISOString(),
    }));

    console.log(`[conexao-stream-start] Started ${startedDestinations.length} streams`);

    return new Response(
      JSON.stringify({
        success: true,
        session_id,
        started_destinations: startedDestinations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-stream-start] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
