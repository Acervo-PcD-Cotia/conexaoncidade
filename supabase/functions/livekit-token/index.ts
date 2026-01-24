import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple JWT creation for LiveKit (without external library)
function base64UrlEncode(data: string): string {
  return btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createLiveKitToken(
  apiKey: string,
  apiSecret: string,
  roomName: string,
  identity: string,
  name: string,
  metadata: string,
  canPublish: boolean,
  canSubscribe: boolean,
  ttl: number = 3600
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + ttl;

  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    iss: apiKey,
    sub: identity,
    name: name,
    exp: exp,
    nbf: now,
    iat: now,
    jti: crypto.randomUUID(),
    video: {
      roomJoin: true,
      room: roomName,
      canPublish: canPublish,
      canSubscribe: canSubscribe,
      canPublishData: true,
    },
    metadata: metadata,
  };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const message = `${headerB64}.${payloadB64}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(apiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const signatureB64 = base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));

  return `${message}.${signatureB64}`;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");
    const livekitUrl = Deno.env.get("LIVEKIT_URL");

    if (!livekitApiKey || !livekitApiSecret || !livekitUrl) {
      console.error("Missing LiveKit configuration");
      return new Response(
        JSON.stringify({ error: "LiveKit não configurado" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get auth header
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id || null;
    }

    const { broadcastId, participantRole, displayName, titleLabel, inviteToken } = await req.json();

    console.log("Token request:", { broadcastId, participantRole, displayName, inviteToken: !!inviteToken });

    if (!broadcastId) {
      return new Response(
        JSON.stringify({ error: "broadcastId é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch broadcast
    const { data: broadcast, error: broadcastError } = await supabase
      .from("broadcasts")
      .select("*")
      .eq("id", broadcastId)
      .single();

    if (broadcastError || !broadcast) {
      console.error("Broadcast not found:", broadcastError);
      return new Response(
        JSON.stringify({ error: "Transmissão não encontrada" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate room name if not exists
    const roomName = broadcast.livekit_room_name || `broadcast-${broadcast.id}`;

    // Determine role and permissions
    let role = participantRole || "viewer";
    let canPublish = false;
    let canSubscribe = true;
    let identity = userId || crypto.randomUUID();
    let name = displayName || "Espectador";

    // Check if host/co-host via user permissions
    if (userId && (role === "host" || role === "co_host" || role === "producer")) {
      const { data: isAdmin } = await supabase.rpc("is_admin_or_editor", { _user_id: userId });
      
      if (isAdmin || broadcast.created_by === userId) {
        canPublish = true;
      } else {
        role = "viewer";
      }
    }

    // Check invite token for guests
    if (inviteToken && role === "guest") {
      const { data: participant } = await supabase
        .from("broadcast_participants")
        .select("*")
        .eq("invite_token", inviteToken)
        .eq("broadcast_id", broadcastId)
        .single();

      if (participant && (!participant.invite_expires_at || new Date(participant.invite_expires_at) > new Date())) {
        canPublish = true;
        name = participant.display_name;
        role = participant.role;
        
        // Update participant joined status
        await supabase
          .from("broadcast_participants")
          .update({ joined_at: new Date().toISOString(), user_id: userId })
          .eq("id", participant.id);
      } else {
        return new Response(
          JSON.stringify({ error: "Convite inválido ou expirado" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Create or update participant record
    if (canPublish && userId) {
      const { data: existingParticipant } = await supabase
        .from("broadcast_participants")
        .select("id")
        .eq("broadcast_id", broadcastId)
        .eq("user_id", userId)
        .maybeSingle();

      if (!existingParticipant) {
        await supabase.from("broadcast_participants").insert({
          broadcast_id: broadcastId,
          user_id: userId,
          role: role,
          display_name: name,
          title_label: titleLabel,
          joined_at: new Date().toISOString(),
        });
      } else {
        await supabase
          .from("broadcast_participants")
          .update({ joined_at: new Date().toISOString() })
          .eq("id", existingParticipant.id);
      }
    }

    // Update broadcast room name if needed
    if (!broadcast.livekit_room_name) {
      await supabase
        .from("broadcasts")
        .update({ livekit_room_name: roomName })
        .eq("id", broadcastId);
    }

    // Generate token
    const metadata = JSON.stringify({
      role,
      titleLabel: titleLabel || "",
      userId: userId || "",
    });

    const token = await createLiveKitToken(
      livekitApiKey,
      livekitApiSecret,
      roomName,
      identity,
      name,
      metadata,
      canPublish,
      canSubscribe,
      7200 // 2 hours
    );

    console.log("Token generated successfully for:", { identity, role, canPublish });

    return new Response(
      JSON.stringify({
        token,
        roomName,
        wsUrl: livekitUrl, // Primary field expected by useLiveKit
        livekitUrl, // Backward compatibility
        identity,
        role,
        canPublish,
        canSubscribe,
        permissions: {
          canPublish,
          canSubscribe,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error generating token:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: "Erro ao gerar token", details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
