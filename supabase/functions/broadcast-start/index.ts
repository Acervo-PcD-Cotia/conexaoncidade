import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface StartBroadcastRequest {
  broadcastId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
    const livekitWsUrl = Deno.env.get("LIVEKIT_URL");

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
    const { broadcastId }: StartBroadcastRequest = await req.json();

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

    // Check if already live
    if (broadcast.status === "live") {
      return new Response(
        JSON.stringify({ error: "Broadcast is already live" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate room name
    const roomName = `broadcast_${broadcastId}`;
    const now = new Date().toISOString();

    // If LiveKit is configured, create room via API
    let livekitRoomId = null;
    if (livekitApiKey && livekitApiSecret && livekitWsUrl) {
      try {
        // LiveKit Server SDK would be used here in production
        // For now, we'll generate a room ID
        livekitRoomId = crypto.randomUUID();
        console.log(`Created LiveKit room: ${roomName}`);
      } catch (lkError) {
        console.error("LiveKit room creation error:", lkError);
        // Continue without LiveKit room - will be created on first connection
      }
    }

    // Update broadcast status
    const { data: updatedBroadcast, error: updateError } = await supabaseAdmin
      .from("broadcasts")
      .update({
        status: "live",
        actual_start: now,
        livekit_room_name: roomName,
        livekit_room_id: livekitRoomId,
        updated_at: now,
      })
      .eq("id", broadcastId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating broadcast:", updateError);
      throw new Error("Failed to start broadcast");
    }

    // Log analytics event
    await supabaseAdmin.from("broadcast_analytics").insert({
      broadcast_id: broadcastId,
      user_id: user.id,
      session_id: `start_${Date.now()}`,
      device_type: "admin",
      platform: "web",
    });

    console.log(`Broadcast ${broadcastId} started by user ${user.id}`);

    // TODO: Send push notifications to subscribers

    return new Response(
      JSON.stringify({
        success: true,
        broadcast: updatedBroadcast,
        roomName,
        wsUrl: livekitWsUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Broadcast start error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
