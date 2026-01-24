import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create JWT for LiveKit Egress API
async function createEgressToken(apiKey: string, apiSecret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: apiKey,
    sub: apiKey,
    iat: now,
    exp: now + 600,
    video: {
      roomRecord: true,
    },
  };

  const encoder = new TextEncoder();
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  const signatureB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${data}.${signatureB64}`;
}

function base64UrlEncode(str: string): string {
  const b64 = btoa(str);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Start RTMP stream via LiveKit Egress API
async function startRtmpEgress(
  livekitHost: string,
  token: string,
  roomName: string,
  rtmpUrls: string[]
): Promise<{ egressId: string }> {
  const host = livekitHost.replace(/^wss?:\/\//, "https://").replace(/\/$/, "");
  const url = `${host}/twirp/livekit.Egress/StartRoomCompositeEgress`;

  console.log(`[Egress] Starting RTMP egress for room: ${roomName} to ${rtmpUrls.length} destinations`);

  const requestBody = {
    room_name: roomName,
    layout: "speaker",
    audio_only: false,
    video_only: false,
    stream_outputs: [{
      protocol: "RTMP",
      urls: rtmpUrls,
    }],
    preset: "H264_1080P_30",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Egress] RTMP API error: ${response.status} - ${errorText}`);
    throw new Error(`Egress RTMP API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`[Egress] RTMP stream started. Egress ID: ${result.egress_id}`);
  return { egressId: result.egress_id };
}

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

    // Try to get session from illumina_sessions first
    let session: { livekit_room_name: string; team_id: string | null } | null = null;

    const { data: illuminaSession } = await supabase
      .from("illumina_sessions")
      .select("livekit_room_name, team_id")
      .eq("id", session_id)
      .single();

    if (illuminaSession?.livekit_room_name) {
      session = illuminaSession;
    } else {
      // Fallback to broadcasts table
      const { data: broadcast } = await supabase
        .from("broadcasts")
        .select("livekit_room_name")
        .eq("id", session_id)
        .single();

      if (broadcast?.livekit_room_name) {
        session = { ...broadcast, team_id: null };
      }
    }

    if (!session?.livekit_room_name) {
      console.error("[conexao-stream-start] Session not found");
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

    // Fetch destinations from database
    const { data: destinations, error: destError } = await supabase
      .from("illumina_destinations")
      .select("*")
      .in("id", destination_ids);

    if (destError || !destinations?.length) {
      console.error("[conexao-stream-start] Destinations not found:", destError);
      return new Response(
        JSON.stringify({ error: "Destinations not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const egressToken = await createEgressToken(livekitApiKey, livekitApiSecret);
    const startedDestinations: Array<{
      destination_id: string;
      egress_id: string;
      status: string;
      started_at: string;
    }> = [];
    const errors: Array<{ destination_id: string; error: string }> = [];

    // Start RTMP egress for each destination
    // Note: LiveKit supports multiple RTMP URLs in a single egress
    // But for better control, we'll create separate egresses
    for (const dest of destinations) {
      try {
        // Construct RTMP URL
        const rtmpUrl = `${dest.rtmp_url}/${dest.stream_key_encrypted}`;
        
        console.log(`[conexao-stream-start] Starting stream to ${dest.platform}: ${dest.name}`);

        const egress = await startRtmpEgress(
          livekitHost,
          egressToken,
          session.livekit_room_name,
          [rtmpUrl]
        );

        // Update destination with egress ID and status
        await supabase
          .from("illumina_destinations")
          .update({
            connection_status: "live",
            last_used_at: new Date().toISOString(),
            metadata_json: { 
              ...(dest.metadata_json || {}),
              egress_id: egress.egressId,
              started_at: new Date().toISOString(),
            },
          })
          .eq("id", dest.id);

        startedDestinations.push({
          destination_id: dest.id,
          egress_id: egress.egressId,
          status: "live",
          started_at: new Date().toISOString(),
        });

      } catch (destError) {
        console.error(`[conexao-stream-start] Error starting stream to ${dest.id}:`, destError);
        
        // Update destination status to error
        await supabase
          .from("illumina_destinations")
          .update({
            connection_status: "error",
            metadata_json: {
              ...(dest.metadata_json || {}),
              error: destError instanceof Error ? destError.message : "Unknown error",
            },
          })
          .eq("id", dest.id);

        errors.push({
          destination_id: dest.id,
          error: destError instanceof Error ? destError.message : "Unknown error",
        });
      }
    }

    console.log(`[conexao-stream-start] Started ${startedDestinations.length}/${destinations.length} streams`);

    return new Response(
      JSON.stringify({
        success: startedDestinations.length > 0,
        session_id,
        started_destinations: startedDestinations,
        errors: errors.length > 0 ? errors : undefined,
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
