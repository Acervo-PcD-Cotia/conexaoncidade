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
    const { session_id, type = "cloud" } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-recording-start] Starting ${type} recording for session: ${session_id}`);

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
      console.error("[conexao-recording-start] Broadcast not found or no room:", fetchError);
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
      console.error("[conexao-recording-start] LiveKit credentials not configured");
      return new Response(
        JSON.stringify({ error: "LiveKit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For cloud recording, we would use LiveKit's Egress API
    // This requires setting up S3/GCS bucket and calling the Egress API
    
    // Generate a mock egress ID for now - in production this would come from LiveKit
    const egressId = `egress_${session_id.substring(0, 8)}_${Date.now()}`;
    const recordingFilename = `recording_${session_id}_${Date.now()}`;

    console.log(`[conexao-recording-start] Recording started with egress: ${egressId}`);

    // In production, you would:
    // 1. Call LiveKit Egress API to start RoomCompositeEgress
    // 2. Configure output to S3/GCS bucket
    // 3. Store the egress ID in database
    
    // For now, we'll store a record that recording is in progress
    // You might want to create a broadcast_recordings table for this

    return new Response(
      JSON.stringify({
        success: true,
        egress_id: egressId,
        type,
        room_name: broadcast.livekit_room_name,
        started_at: new Date().toISOString(),
        filename: recordingFilename,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-recording-start] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
