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

  console.log(`[Egress] Stopping egress: ${egressId}`);

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
    console.error(`[Egress] Stop error: ${response.status} - ${errorText}`);
    throw new Error(`Failed to stop egress: ${response.status}`);
  }

  console.log(`[Egress] Stopped successfully`);
}

// Get Egress info to retrieve file location
async function getEgressInfo(livekitHost: string, token: string, egressId: string): Promise<{
  status: string;
  file_results?: Array<{
    filename: string;
    location: string;
    duration: number;
    size: number;
  }>;
}> {
  const host = livekitHost.replace(/^wss?:\/\//, "https://").replace(/\/$/, "");
  const url = `${host}/twirp/livekit.Egress/ListEgress`;

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
    console.error(`[Egress] List error: ${response.status} - ${errorText}`);
    throw new Error(`Failed to get egress info: ${response.status}`);
  }

  const result = await response.json();
  const egress = result.items?.[0];
  
  return {
    status: egress?.status || "unknown",
    file_results: egress?.file_results,
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { session_id, egress_id, recording_id, type = "cloud" } = await req.json();
    
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-recording-stop] Stopping ${type} recording for session: ${session_id}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find active recording
    let activeRecording: {
      id: string;
      type: string;
      metadata_json: { egress_id?: string; filepath?: string; s3_bucket?: string; s3_region?: string };
    } | null = null;

    if (recording_id) {
      const { data } = await supabase
        .from("illumina_recordings")
        .select("*")
        .eq("id", recording_id)
        .single();
      activeRecording = data;
    } else {
      const { data } = await supabase
        .from("illumina_recordings")
        .select("*")
        .eq("session_id", session_id)
        .eq("status", "recording")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      activeRecording = data;
    }

    // For local recording, just update the status
    if (type === "local" || activeRecording?.type === "local") {
      console.log(`[conexao-recording-stop] Completing local recording`);
      
      if (activeRecording) {
        await supabase
          .from("illumina_recordings")
          .update({
            status: "completed",
            ended_at: new Date().toISOString(),
          })
          .eq("id", activeRecording.id);
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: "local",
          ended_at: new Date().toISOString(),
          message: "Local recording completed - file saved by browser",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cloud recording - use LiveKit Egress API
    const realEgressId = egress_id || activeRecording?.metadata_json?.egress_id;

    if (!realEgressId) {
      return new Response(
        JSON.stringify({ error: "No active egress found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get LiveKit credentials
    const livekitHost = Deno.env.get("LIVEKIT_HOST") || Deno.env.get("LIVEKIT_URL");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!livekitHost || !livekitApiKey || !livekitApiSecret) {
      return new Response(
        JSON.stringify({ error: "LiveKit credentials not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const egressToken = await createEgressToken(livekitApiKey, livekitApiSecret);

    // Stop the egress
    await stopEgress(livekitHost, egressToken, realEgressId);

    // Wait a moment for file to be finalized
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Get egress info for file location
    let recordingUrl = "";
    let durationSeconds = 0;
    let sizeBytes = 0;

    try {
      const egressInfo = await getEgressInfo(livekitHost, egressToken, realEgressId);
      
      if (egressInfo.file_results?.length) {
        const fileResult = egressInfo.file_results[0];
        recordingUrl = fileResult.location;
        durationSeconds = Math.floor((fileResult.duration || 0) / 1e9); // nanoseconds to seconds
        sizeBytes = fileResult.size || 0;
      }
    } catch (infoError) {
      console.warn(`[conexao-recording-stop] Could not get egress info:`, infoError);
      
      // Construct URL from metadata if available
      const metadata = activeRecording?.metadata_json;
      if (metadata?.s3_bucket && metadata?.filepath) {
        const s3Region = metadata.s3_region || "us-east-1";
        recordingUrl = `https://${metadata.s3_bucket}.s3.${s3Region}.amazonaws.com/${metadata.filepath}.mp4`;
      }
    }

    // Update illumina_recordings
    if (activeRecording) {
      await supabase
        .from("illumina_recordings")
        .update({
          status: "completed",
          url_main: recordingUrl,
          duration_seconds: durationSeconds,
          size_bytes: sizeBytes,
          ended_at: new Date().toISOString(),
        })
        .eq("id", activeRecording.id);
    }

    // Also update broadcasts table for compatibility
    await supabase
      .from("broadcasts")
      .update({ recording_url: recordingUrl })
      .eq("id", session_id);

    console.log(`[conexao-recording-stop] Recording stopped. URL: ${recordingUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        egress_id: realEgressId,
        recording_url: recordingUrl,
        duration_seconds: durationSeconds,
        size_bytes: sizeBytes,
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
