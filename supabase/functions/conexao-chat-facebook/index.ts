import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FacebookComment {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  avatarUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { video_id, access_token, after_cursor } = await req.json();
    
    if (!video_id) {
      return new Response(
        JSON.stringify({ error: "video_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fbAccessToken = access_token || Deno.env.get("FACEBOOK_ACCESS_TOKEN");
    
    if (!fbAccessToken) {
      console.log("[conexao-chat-facebook] No access token, returning mock data");
      // Return mock data if no access token
      const mockComments: FacebookComment[] = [
        {
          id: `fb-mock-${Date.now()}-1`,
          author: "Usuário Facebook",
          message: "Muito bom! 👍",
          timestamp: new Date().toISOString(),
          avatarUrl: undefined,
        },
      ];
      
      return new Response(
        JSON.stringify({
          comments: mockComments,
          nextCursor: null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Facebook Graph API URL
    let apiUrl = `https://graph.facebook.com/v18.0/${video_id}/comments?fields=id,message,created_time,from{name,picture}&access_token=${fbAccessToken}`;
    
    if (after_cursor) {
      apiUrl += `&after=${encodeURIComponent(after_cursor)}`;
    }

    console.log(`[conexao-chat-facebook] Fetching comments for video: ${video_id}`);

    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("[conexao-chat-facebook] Facebook API error:", errorData);
      throw new Error(`Facebook API error: ${response.status}`);
    }

    const data = await response.json();

    // Transform Facebook comments to our format
    const comments: FacebookComment[] = (data.data || []).map((item: any) => ({
      id: item.id,
      author: item.from?.name || "Anônimo",
      message: item.message || "",
      timestamp: item.created_time || new Date().toISOString(),
      avatarUrl: item.from?.picture?.data?.url,
    }));

    console.log(`[conexao-chat-facebook] Fetched ${comments.length} comments`);

    return new Response(
      JSON.stringify({
        comments,
        nextCursor: data.paging?.cursors?.after || null,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[conexao-chat-facebook] Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
