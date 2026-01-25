import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id",
};

interface StreamingConfig {
  id: string;
  tenant_id: string;
  kind: "radio" | "tv";
  is_active: boolean;
  api_json_url: string | null;
  api_xml_url: string | null;
  embed_mode: "iframe" | "html" | "url";
  embed_code: string | null;
  player_url: string | null;
  external_panel_url: string | null;
  last_snapshot: Record<string, unknown> | null;
  last_fetched_at: string | null;
  error_count: number;
  last_error: string | null;
}

interface RadioStatus {
  kind: "radio";
  isOnline: boolean;
  statusText: string;
  listeners: number;
  title: string;
  nowPlaying: {
    track: string;
    artist: string;
    song: string;
    coverUrl: string | null;
    genre: string | null;
  } | null;
  nextPlaying: { track: string } | null;
  endpoints: {
    shoutcast?: string;
    rtmp?: string;
    rtsp?: string;
  };
  fetchedAt: string;
}

interface TvStatus {
  kind: "tv";
  isOnline: boolean;
  statusText: string;
  viewers: number;
  plan: {
    viewersLimit: number;
    ftpLimit: string;
    bitrate: string;
  } | null;
  endpoints: {
    rtmp?: string;
    rtsp?: string;
  };
  fetchedAt: string;
}

// Parse VoxHD Radio JSON response
function parseVoxHdRadio(data: Record<string, unknown>): RadioStatus {
  const isOnline = data.status === "Ligado" || data.status === "1" || data.online === true;
  
  return {
    kind: "radio",
    isOnline,
    statusText: isOnline ? "Ligado" : "Desligado",
    listeners: Number(data.ouvintes || data.listeners || 0),
    title: String(data.nome || data.title || "Rádio"),
    nowPlaying: data.musica ? {
      track: String(data.musica || ""),
      artist: String(data.artista || ""),
      song: String(data.titulo || data.musica || ""),
      coverUrl: data.capa ? String(data.capa) : null,
      genre: data.genero ? String(data.genero) : null,
    } : null,
    nextPlaying: data.proxima ? { track: String(data.proxima) } : null,
    endpoints: {
      shoutcast: data.shoutcast ? String(data.shoutcast) : undefined,
      rtmp: data.rtmp ? String(data.rtmp) : undefined,
      rtsp: data.rtsp ? String(data.rtsp) : undefined,
    },
    fetchedAt: new Date().toISOString(),
  };
}

// Parse VoxTV JSON response
function parseVoxTv(data: Record<string, unknown>): TvStatus {
  const isOnline = data.status === "Ligado" || data.status === "1" || data.online === true;
  
  return {
    kind: "tv",
    isOnline,
    statusText: isOnline ? "Ligado" : "Desligado",
    viewers: Number(data.espectadores || data.viewers || 0),
    plan: data.plano ? {
      viewersLimit: Number((data.plano as Record<string, unknown>).limite_espectadores || 0),
      ftpLimit: String((data.plano as Record<string, unknown>).limite_ftp || ""),
      bitrate: String((data.plano as Record<string, unknown>).bitrate || ""),
    } : null,
    endpoints: {
      rtmp: data.rtmp ? String(data.rtmp) : undefined,
      rtsp: data.rtsp ? String(data.rtsp) : undefined,
    },
    fetchedAt: new Date().toISOString(),
  };
}

// Fetch status from external API
async function fetchExternalStatus(
  config: StreamingConfig
): Promise<RadioStatus | TvStatus | null> {
  if (!config.api_json_url) {
    return null;
  }

  try {
    const response = await fetch(config.api_json_url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ConexaoStreaming/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (config.kind === "radio") {
      return parseVoxHdRadio(data);
    } else {
      return parseVoxTv(data);
    }
  } catch (error) {
    console.error(`Error fetching external API for ${config.kind}:`, error);
    throw error;
  }
}

// Check if cache is still valid (15 seconds)
function isCacheValid(lastFetchedAt: string | null): boolean {
  if (!lastFetchedAt) return false;
  const elapsed = Date.now() - new Date(lastFetchedAt).getTime();
  return elapsed < 15000; // 15 seconds
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    // Expected paths: /streaming-gateway/radio/status or /streaming-gateway/tv/status
    // After Supabase routing: /radio/status or /tv/status
    const kind = pathParts[0] as "radio" | "tv";
    const action = pathParts[1] || "status";

    if (!["radio", "tv"].includes(kind)) {
      return new Response(
        JSON.stringify({ error: "Invalid kind. Use 'radio' or 'tv'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get tenant ID from header or query param
    const tenantId = req.headers.get("x-tenant-id") || url.searchParams.get("tenant");

    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: "Missing tenant ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch config from database
    const { data: config, error: configError } = await supabase
      .from("external_streaming_configs")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("kind", kind)
      .eq("is_active", true)
      .maybeSingle();

    if (configError) {
      console.error("Error fetching config:", configError);
      return new Response(
        JSON.stringify({ error: "Database error", details: configError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle "config" action - return config without calling external API
    if (action === "config") {
      if (!config) {
        return new Response(
          JSON.stringify({ 
            code: "NOT_CONFIGURED", 
            kind,
            tenantId,
            message: `${kind === "radio" ? "Rádio" : "TV"} não configurada para este tenant`
          }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return config without sensitive data
      return new Response(
        JSON.stringify({
          id: config.id,
          kind: config.kind,
          is_active: config.is_active,
          embed_mode: config.embed_mode,
          embed_code: config.embed_code,
          player_url: config.player_url,
          external_panel_url: config.external_panel_url,
          has_api: !!config.api_json_url,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle "status" action - fetch from external API
    if (!config) {
      return new Response(
        JSON.stringify({ 
          code: "NOT_CONFIGURED", 
          kind,
          tenantId,
          useMock: false,
          message: `${kind === "radio" ? "Rádio" : "TV"} não configurada para este tenant`
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check cache first
    if (isCacheValid(config.last_fetched_at) && config.last_snapshot) {
      console.log(`Returning cached ${kind} status for tenant ${tenantId}`);
      return new Response(
        JSON.stringify({ 
          ...config.last_snapshot, 
          fromCache: true,
          cachedAt: config.last_fetched_at 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no API URL, return offline status
    if (!config.api_json_url) {
      const offlineStatus = kind === "radio" ? {
        kind: "radio",
        isOnline: false,
        statusText: "Sem API configurada",
        listeners: 0,
        title: "Rádio",
        nowPlaying: null,
        nextPlaying: null,
        endpoints: {},
        fetchedAt: new Date().toISOString(),
      } : {
        kind: "tv",
        isOnline: false,
        statusText: "Sem API configurada",
        viewers: 0,
        plan: null,
        endpoints: {},
        fetchedAt: new Date().toISOString(),
      };

      return new Response(
        JSON.stringify(offlineStatus),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from external API
    try {
      const status = await fetchExternalStatus(config);

      if (status) {
        // Update cache in database
        await supabase
          .from("external_streaming_configs")
          .update({
            last_snapshot: status,
            last_fetched_at: new Date().toISOString(),
            error_count: 0,
            last_error: null,
          })
          .eq("id", config.id);

        return new Response(
          JSON.stringify(status),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
      
      // Update error count in database
      await supabase
        .from("external_streaming_configs")
        .update({
          error_count: config.error_count + 1,
          last_error: errorMessage,
          last_fetched_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      // If we have a cached snapshot, return it with error flag
      if (config.last_snapshot) {
        return new Response(
          JSON.stringify({
            ...config.last_snapshot,
            fromCache: true,
            cachedAt: config.last_fetched_at,
            apiError: errorMessage,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return offline status with error
      const offlineStatus = kind === "radio" ? {
        kind: "radio",
        isOnline: false,
        statusText: "Indisponível",
        listeners: 0,
        title: "Rádio",
        nowPlaying: null,
        nextPlaying: null,
        endpoints: {},
        fetchedAt: new Date().toISOString(),
        error: errorMessage,
      } : {
        kind: "tv",
        isOnline: false,
        statusText: "Indisponível",
        viewers: 0,
        plan: null,
        endpoints: {},
        fetchedAt: new Date().toISOString(),
        error: errorMessage,
      };

      return new Response(
        JSON.stringify(offlineStatus),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({ error: "Unexpected error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Gateway error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
