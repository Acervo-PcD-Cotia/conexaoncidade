import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YouTubeChatMessage {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  avatarUrl?: string;
  authorChannelId?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { live_chat_id, page_token, check_only } = await req.json();
    
    if (!live_chat_id) {
      return new Response(
        JSON.stringify({ error: "live_chat_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const youtubeApiKey = Deno.env.get("YOUTUBE_API_KEY");
    const isConfigured = !!youtubeApiKey;
    
    // If only checking configuration status
    if (check_only) {
      return new Response(
        JSON.stringify({
          is_configured: isConfigured,
          platform: 'youtube',
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!youtubeApiKey) {
      console.log("[conexao-chat-youtube] No API key configured, returning mock data");
      // Return mock data if no API key configured
      const mockMessages: YouTubeChatMessage[] = [
        {
          id: `yt-mock-${Date.now()}-1`,
          author: "Usuário YouTube",
          message: "Ótimo conteúdo! 🎉",
          timestamp: new Date().toISOString(),
          avatarUrl: undefined,
        },
        {
          id: `yt-mock-${Date.now()}-2`,
          author: "Espectador",
          message: "Muito bom o programa!",
          timestamp: new Date(Date.now() - 30000).toISOString(),
          avatarUrl: undefined,
        },
      ];
      
      return new Response(
        JSON.stringify({
          messages: mockMessages,
          nextPageToken: null,
          pollingIntervalMillis: 5000,
          is_configured: false,
          is_demo: true,
          platform: 'youtube',
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build YouTube API URL
    let apiUrl = `https://www.googleapis.com/youtube/v3/liveChat/messages?liveChatId=${encodeURIComponent(live_chat_id)}&part=snippet,authorDetails&key=${youtubeApiKey}`;
    
    if (page_token) {
      apiUrl += `&pageToken=${encodeURIComponent(page_token)}`;
    }

    console.log(`[conexao-chat-youtube] Fetching messages for chat: ${live_chat_id}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[conexao-chat-youtube] YouTube API error:", errorData);
      
      // Return empty result with error info instead of throwing
      return new Response(
        JSON.stringify({
          messages: [],
          nextPageToken: null,
          pollingIntervalMillis: 10000,
          is_configured: true,
          error: `YouTube API error: ${response.status}`,
          error_details: errorData.error?.message || 'Unknown error',
          platform: 'youtube',
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Transform YouTube messages to our format
    const messages: YouTubeChatMessage[] = (data.items || []).map((item: any) => ({
      id: item.id,
      author: item.authorDetails?.displayName || "Anônimo",
      message: item.snippet?.displayMessage || "",
      timestamp: item.snippet?.publishedAt || new Date().toISOString(),
      avatarUrl: item.authorDetails?.profileImageUrl,
      authorChannelId: item.authorDetails?.channelId,
    }));

    console.log(`[conexao-chat-youtube] Fetched ${messages.length} messages`);

    return new Response(
      JSON.stringify({
        messages,
        nextPageToken: data.nextPageToken || null,
        pollingIntervalMillis: data.pollingIntervalMillis || 5000,
        is_configured: true,
        platform: 'youtube',
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-chat-youtube] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ 
        error: message,
        is_configured: !!Deno.env.get("YOUTUBE_API_KEY"),
        platform: 'youtube',
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
