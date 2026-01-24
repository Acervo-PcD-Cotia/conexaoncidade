import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    console.log("[conexao-recording-check] Checking recording capabilities...");

    // Check LiveKit credentials
    const livekitHost = Deno.env.get("LIVEKIT_HOST") || Deno.env.get("LIVEKIT_URL");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
    const hasLiveKit = !!(livekitHost && livekitApiKey && livekitApiSecret);

    // Check S3 credentials for cloud recording
    const s3AccessKey = Deno.env.get("S3_ACCESS_KEY");
    const s3SecretKey = Deno.env.get("S3_SECRET_KEY");
    const s3Bucket = Deno.env.get("S3_BUCKET");
    const s3Region = Deno.env.get("S3_REGION");
    const hasS3 = !!(s3AccessKey && s3SecretKey && s3Bucket && s3Region);

    const cloudAvailable = hasLiveKit && hasS3;
    const localAvailable = true; // MediaRecorder is always available in browser

    console.log(`[conexao-recording-check] LiveKit: ${hasLiveKit}, S3: ${hasS3}, Cloud: ${cloudAvailable}`);

    return new Response(
      JSON.stringify({
        cloud_available: cloudAvailable,
        local_available: localAvailable,
        livekit_configured: hasLiveKit,
        s3_configured: hasS3,
        message: cloudAvailable 
          ? "Cloud recording is available" 
          : hasLiveKit 
            ? "S3 not configured - only local recording available"
            : "LiveKit not configured",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-recording-check] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: message,
        cloud_available: false,
        local_available: true,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
