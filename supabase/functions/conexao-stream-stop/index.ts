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

// Stop LiveKit Egress
async function stopEgress(livekitHost: string, token: string, egressId: string): Promise<void> {
  const host = livekitHost.replace(/^wss?:\/\//, "https://").replace(/\/$/, "");
  const url = `${host}/twirp/livekit.Egress/StopEgress`;

  console.log(`[Egress] Stopping stream egress: ${egressId}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ egress_id: egressId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    // Don't throw if egress is already stopped
    if (!errorText.includes("not found") && !errorText.includes("already")) {
      console.error(`[Egress] Stop error: ${response.status} - ${errorText}`);
      throw new Error(`Failed to stop egress: ${response.status}`);
    }
    console.warn(`[Egress] Egress may already be stopped: ${errorText}`);
  } else {
    console.log(`[Egress] Stream stopped successfully`);
  }
}

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

    // Build query for destinations
    let query = supabase
      .from("illumina_destinations")
      .select("*")
      .eq("connection_status", "live");

    if (destination_ids?.length) {
      query = query.in("id", destination_ids);
    }

    const { data: destinations, error: destError } = await query;

    if (destError) {
      console.error("[conexao-stream-stop] Error fetching destinations:", destError);
    }

    const egressToken = await createEgressToken(livekitApiKey, livekitApiSecret);
    const stoppedDestinations: Array<{
      destination_id: string;
      status: string;
      ended_at: string;
    }> = [];
    const errors: Array<{ destination_id: string; error: string }> = [];

    // Stop each active stream
    for (const dest of destinations || []) {
      const egressId = dest.metadata_json?.egress_id;
      
      try {
        if (egressId) {
          await stopEgress(livekitHost, egressToken, egressId);
        }

        // Update destination status
        await supabase
          .from("illumina_destinations")
          .update({
            connection_status: "disconnected",
            metadata_json: {
              ...(dest.metadata_json || {}),
              egress_id: null,
              ended_at: new Date().toISOString(),
            },
          })
          .eq("id", dest.id);

        stoppedDestinations.push({
          destination_id: dest.id,
          status: "ended",
          ended_at: new Date().toISOString(),
        });

      } catch (stopError) {
        console.error(`[conexao-stream-stop] Error stopping stream ${dest.id}:`, stopError);
        
        // Still update status even if stop failed (egress might already be stopped)
        await supabase
          .from("illumina_destinations")
          .update({
            connection_status: "disconnected",
            metadata_json: {
              ...(dest.metadata_json || {}),
              egress_id: null,
            },
          })
          .eq("id", dest.id);

        errors.push({
          destination_id: dest.id,
          error: stopError instanceof Error ? stopError.message : "Unknown error",
        });
      }
    }

    console.log(`[conexao-stream-stop] Stopped ${stoppedDestinations.length} streams`);

    return new Response(
      JSON.stringify({
        success: true,
        session_id,
        stopped_destinations: stoppedDestinations,
        errors: errors.length > 0 ? errors : undefined,
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
