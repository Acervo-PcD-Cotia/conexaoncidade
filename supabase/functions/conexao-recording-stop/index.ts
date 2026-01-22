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
    const { session_id, egress_id } = await req.json();
    
    if (!session_id || !egress_id) {
      return new Response(
        JSON.stringify({ error: "session_id and egress_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-recording-stop] Stopping recording ${egress_id} for session: ${session_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get LiveKit credentials
    const livekitHost = Deno.env.get("LIVEKIT_HOST") || Deno.env.get("LIVEKIT_URL");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!livekitHost || !livekitApiKey || !livekitApiSecret) {
      console.error("[conexao-recording-stop] LiveKit credentials not configured");
      return new Response(
        JSON.stringify({ error: "LiveKit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // In production, you would:
    // 1. Call LiveKit Egress API to stop the egress
    // 2. Wait for the recording to be uploaded to S3/GCS
    // 3. Get the final URL from the egress info
    
    // For now, generate a mock recording URL
    const recordingUrl = `${supabaseUrl}/storage/v1/object/public/recordings/${session_id}/${egress_id}.mp4`;
    const durationSeconds = 0; // Would come from actual egress info

    // Update broadcast with recording URL
    const { error: updateError } = await supabase
      .from("broadcasts")
      .update({
        recording_url: recordingUrl,
      })
      .eq("id", session_id);

    if (updateError) {
      console.warn("[conexao-recording-stop] Failed to update broadcast:", updateError);
    }

    console.log(`[conexao-recording-stop] Recording stopped. URL: ${recordingUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        egress_id,
        recording_url: recordingUrl,
        duration_seconds: durationSeconds,
        ended_at: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-recording-stop] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
