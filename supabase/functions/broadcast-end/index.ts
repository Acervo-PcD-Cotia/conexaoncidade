import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EndBroadcastRequest {
  broadcastId: string;
  generatePodcast?: boolean;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    
    // Create Supabase client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { broadcastId, generatePodcast = true }: EndBroadcastRequest = await req.json();

    if (!broadcastId) {
      return new Response(
        JSON.stringify({ error: "broadcastId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    const isAdmin = roleData?.role === "admin";

    // Get broadcast
    const { data: broadcast, error: broadcastError } = await supabaseAdmin
      .from("broadcasts")
      .select("*, channel:broadcast_channels(*), program:broadcast_programs(*)")
      .eq("id", broadcastId)
      .single();

    if (broadcastError || !broadcast) {
      return new Response(
        JSON.stringify({ error: "Broadcast not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check permissions (must be admin or creator)
    if (!isAdmin && broadcast.created_by !== user.id) {
      return new Response(
        JSON.stringify({ error: "Permission denied" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if broadcast is live
    if (broadcast.status !== "live") {
      return new Response(
        JSON.stringify({ error: "Broadcast is not live" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date();
    const actualStart = broadcast.actual_start ? new Date(broadcast.actual_start) : now;
    const durationMs = now.getTime() - actualStart.getTime();
    const durationMinutes = Math.round(durationMs / 60000);

    // Get analytics summary
    const { data: analytics } = await supabaseAdmin
      .from("broadcast_analytics")
      .select("id")
      .eq("broadcast_id", broadcastId);

    const totalViews = analytics?.length || 0;

    // Get transcripts for potential podcast generation
    const { data: transcripts } = await supabaseAdmin
      .from("broadcast_transcripts")
      .select("*")
      .eq("broadcast_id", broadcastId)
      .order("timestamp_start");

    // Combine all transcripts
    const fullTranscript = transcripts
      ?.map((t) => t.text)
      .join(" ")
      .trim();

    // Update broadcast status
    const { data: updatedBroadcast, error: updateError } = await supabaseAdmin
      .from("broadcasts")
      .update({
        status: "ended",
        actual_end: now.toISOString(),
        total_views: totalViews,
        updated_at: now.toISOString(),
      })
      .eq("id", broadcastId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating broadcast:", updateError);
      throw new Error("Failed to end broadcast");
    }

    // Close LiveKit room if configured
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
    
    if (livekitApiKey && livekitApiSecret && broadcast.livekit_room_name) {
      try {
        // In production, would use LiveKit Server SDK to close room
        console.log(`Closing LiveKit room: ${broadcast.livekit_room_name}`);
      } catch (lkError) {
        console.error("LiveKit room close error:", lkError);
      }
    }

    // Generate podcast if requested and we have a recording
    let podcastUrl = null;
    if (generatePodcast && broadcast.recording_url) {
      try {
        // Would call generate-podcast edge function here
        console.log("Podcast generation queued for broadcast:", broadcastId);
      } catch (podcastError) {
        console.error("Podcast generation error:", podcastError);
      }
    }

    console.log(`Broadcast ${broadcastId} ended by user ${user.id}. Duration: ${durationMinutes} minutes, Views: ${totalViews}`);

    return new Response(
      JSON.stringify({
        success: true,
        broadcast: updatedBroadcast,
        summary: {
          duration_minutes: durationMinutes,
          total_views: totalViews,
          peak_viewers: broadcast.peak_viewers,
          has_transcript: !!fullTranscript,
          transcript_length: fullTranscript?.length || 0,
        },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Broadcast end error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
