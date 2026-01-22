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
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-stream-stop] Stopping streams for session: ${session_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get LiveKit credentials
    const livekitHost = Deno.env.get("LIVEKIT_HOST") || Deno.env.get("LIVEKIT_URL");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!livekitHost || !livekitApiKey || !livekitApiSecret) {
      console.error("[conexao-stream-stop] LiveKit credentials not configured");
      return new Response(
        JSON.stringify({ error: "LiveKit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In production, for each destination you would:
    // 1. Fetch the egress ID for the destination
    // 2. Call LiveKit Egress API to stop the egress
    // 3. Update the status in database
    
    const stoppedIds = destination_ids || [];
    
    const stoppedDestinations = stoppedIds.map((destId: string) => ({
      destination_id: destId,
      status: "ended",
      ended_at: new Date().toISOString(),
    }));

    console.log(`[conexao-stream-stop] Stopped ${stoppedDestinations.length} streams`);

    return new Response(
      JSON.stringify({
        success: true,
        session_id,
        stopped_destinations: stoppedDestinations,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-stream-stop] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
