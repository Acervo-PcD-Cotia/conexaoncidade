import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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
    exp: now + 600, // 10 minutes
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

// Call LiveKit Egress API
async function startRoomCompositeEgress(
  livekitHost: string,
  token: string,
  roomName: string,
  s3Config: { accessKey: string; secret: string; bucket: string; region: string; endpoint?: string },
  filepath: string
): Promise<{ egressId: string }> {
  const host = livekitHost.replace(/^wss?:\/\//, "https://").replace(/\/$/, "");
  const url = `${host}/twirp/livekit.Egress/StartRoomCompositeEgress`;

  console.log(`[Egress] Starting room composite egress for room: ${roomName}`);
  console.log(`[Egress] S3 Bucket: ${s3Config.bucket}, Region: ${s3Config.region}`);

  const requestBody = {
    room_name: roomName,
    layout: "speaker",
    audio_only: false,
    video_only: false,
    custom_base_url: "",
    file_outputs: [{
      file_type: "MP4",
      filepath: filepath,
      disable_manifest: false,
      s3: {
        access_key: s3Config.accessKey,
        secret: s3Config.secret,
        bucket: s3Config.bucket,
        region: s3Config.region,
        endpoint: s3Config.endpoint || "",
        force_path_style: !!s3Config.endpoint, // true for S3-compatible like R2, Spaces
      },
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
    console.error(`[Egress] API error: ${response.status} - ${errorText}`);
    throw new Error(`Egress API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log(`[Egress] Started successfully. Egress ID: ${result.egress_id}`);
  return { egressId: result.egress_id };
}

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

    // Try to get session from illumina_sessions first (Conexão Studio)
    let session: { livekit_room_name: string; team_id: string | null; title?: string } | null = null;
    let sessionSource = "illumina_sessions";

    const { data: illuminaSession, error: illuminaError } = await supabase
      .from("illumina_sessions")
      .select("livekit_room_name, team_id, title")
      .eq("id", session_id)
      .single();

    if (illuminaSession?.livekit_room_name) {
      session = illuminaSession;
    } else {
      // Fallback to broadcasts table
      const { data: broadcast, error: broadcastError } = await supabase
        .from("broadcasts")
        .select("livekit_room_name, title")
        .eq("id", session_id)
        .single();

      if (broadcast?.livekit_room_name) {
        session = { ...broadcast, team_id: null };
        sessionSource = "broadcasts";
      }
    }

    if (!session?.livekit_room_name) {
      console.error("[conexao-recording-start] Session not found");
      return new Response(
        JSON.stringify({ error: "Session not found or not started" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[conexao-recording-start] Found session in ${sessionSource}: ${session.livekit_room_name}`);

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

    // Check S3 configuration for cloud recording
    const s3AccessKey = Deno.env.get("S3_ACCESS_KEY");
    const s3SecretKey = Deno.env.get("S3_SECRET_KEY");
    const s3Bucket = Deno.env.get("S3_BUCKET");
    const s3Region = Deno.env.get("S3_REGION");
    const s3Endpoint = Deno.env.get("S3_ENDPOINT");

    const hasS3Config = !!(s3AccessKey && s3SecretKey && s3Bucket && s3Region);

    // If cloud recording requested but S3 not configured
    if (type === "cloud" && !hasS3Config) {
      console.warn("[conexao-recording-start] S3 not configured, suggesting local recording");
      return new Response(
        JSON.stringify({ 
          error: "S3 credentials not configured for cloud recording",
          suggestion: "local",
          cloud_available: false,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // For local recording, just return success (client handles MediaRecorder)
    if (type === "local") {
      const localRecordingId = `local_${session_id}_${Date.now()}`;
      console.log(`[conexao-recording-start] Local recording initiated: ${localRecordingId}`);
      
      // Insert record in illumina_recordings
      const { data: recordingData, error: insertError } = await supabase
        .from("illumina_recordings")
        .insert({
          session_id,
          team_id: session.team_id,
          type: "local",
          status: "recording",
          metadata_json: { local_id: localRecordingId },
        })
        .select()
        .single();

      if (insertError) {
        console.error("[conexao-recording-start] Failed to insert recording:", insertError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          egress_id: localRecordingId,
          recording_id: recordingData?.id,
          type: "local",
          room_name: session.livekit_room_name,
          started_at: new Date().toISOString(),
          cloud_available: hasS3Config,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cloud recording - use LiveKit Egress API
    const egressToken = await createEgressToken(livekitApiKey, livekitApiSecret);
    const timestamp = Date.now();
    const filepath = `recordings/${session_id}/${timestamp}`;

    const egress = await startRoomCompositeEgress(
      livekitHost,
      egressToken,
      session.livekit_room_name,
      {
        accessKey: s3AccessKey!,
        secret: s3SecretKey!,
        bucket: s3Bucket!,
        region: s3Region!,
        endpoint: s3Endpoint,
      },
      filepath
    );

    // Insert record in illumina_recordings
    const { data: recordingData, error: insertError } = await supabase
      .from("illumina_recordings")
      .insert({
        session_id,
        team_id: session.team_id,
        type: "cloud",
        status: "recording",
        metadata_json: { 
          egress_id: egress.egressId,
          filepath,
          s3_bucket: s3Bucket,
          s3_region: s3Region,
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error("[conexao-recording-start] Failed to insert recording:", insertError);
    }

    console.log(`[conexao-recording-start] Cloud recording started. Egress ID: ${egress.egressId}`);

    return new Response(
      JSON.stringify({
        success: true,
        egress_id: egress.egressId,
        recording_id: recordingData?.id,
        type: "cloud",
        room_name: session.livekit_room_name,
        started_at: new Date().toISOString(),
        filepath,
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
