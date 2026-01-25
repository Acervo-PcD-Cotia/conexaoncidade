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

// Normalized Radio Status (VoxHD compatible)
interface RadioStatusV2 {
  ok: boolean;
  kind: "radio";
  isLive: boolean;
  listenersNow: number;
  bitrateKbps: number;
  nowPlaying: string | null;
  nextUp: string | null;
  stationName: string;
  genre: string | null;
  artworkUrl: string | null;
  plan: { maxListeners: number; ftp: string } | null;
  endpoints: { shoutcast?: string; rtmp?: string; rtsp?: string };
  latencyMs?: number;
  checkedAt: string;
  error?: { message: string; statusCode?: number };
}

// Normalized TV Status (VoxTV compatible)
interface TvStatusV2 {
  ok: boolean;
  kind: "tv";
  isLive: boolean;
  viewersNow: number;
  bitrateKbps: number;
  plan: { maxViewers: number; ftp: string } | null;
  serverIp: string | null;
  endpoints: { rtmp?: string; rtsp?: string };
  latencyMs?: number;
  checkedAt: string;
  error?: { message: string; statusCode?: number };
}

// Legacy compatibility interfaces
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

// Check if status is "online" from various providers
function isStatusOnline(status: unknown): boolean {
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  if (typeof status === "string") {
    const s = status.toLowerCase();
    return ["1", "on", "online", "true", "ligado", "ativo"].includes(s);
  }
  return false;
}

// Parse VoxHD Radio JSON response to normalized V2 format
function parseVoxHdRadioV2(data: Record<string, unknown>, latencyMs: number): RadioStatusV2 {
  const isLive = isStatusOnline(data.status) || isStatusOnline(data.online);
  
  return {
    ok: true,
    kind: "radio",
    isLive,
    listenersNow: Number(data.ouvintes_conectados || data.ouvintes || data.listeners || 0),
    bitrateKbps: Number(data.plano_bitrate || data.bitrate || 0),
    nowPlaying: data.musica_atual ? String(data.musica_atual) : 
                data.musica ? String(data.musica) : null,
    nextUp: data.proxima_musica ? String(data.proxima_musica) : 
            data.proxima ? String(data.proxima) : null,
    stationName: String(data.titulo || data.nome || data.title || "Rádio"),
    genre: data.genero ? String(data.genero) : null,
    artworkUrl: data.capa_musica ? String(data.capa_musica) : 
                data.capa ? String(data.capa) : null,
    plan: data.plano_ouvintes ? {
      maxListeners: Number(data.plano_ouvintes),
      ftp: String(data.plano_ftp || ""),
    } : null,
    endpoints: {
      shoutcast: data.shoutcast ? String(data.shoutcast) : undefined,
      rtmp: data.rtmp ? String(data.rtmp) : undefined,
      rtsp: data.rtsp ? String(data.rtsp) : undefined,
    },
    latencyMs,
    checkedAt: new Date().toISOString(),
  };
}

// Parse VoxTV JSON response to normalized V2 format
function parseVoxTvV2(data: Record<string, unknown>, latencyMs: number): TvStatusV2 {
  const viewersNow = Number(data.espectadores_conectados || data.espectadores || data.viewers || 0);
  const isLive = viewersNow > 0 || isStatusOnline(data.status) || isStatusOnline(data.online);
  
  return {
    ok: true,
    kind: "tv",
    isLive,
    viewersNow,
    bitrateKbps: Number(data.plano_bitrate || data.bitrate || 0),
    plan: data.plano_espectadores ? {
      maxViewers: Number(data.plano_espectadores),
      ftp: String(data.plano_ftp || ""),
    } : null,
    serverIp: data.ip ? String(data.ip) : null,
    endpoints: {
      rtmp: data.rtmp ? String(data.rtmp) : undefined,
      rtsp: data.rtsp ? String(data.rtsp) : undefined,
    },
    latencyMs,
    checkedAt: new Date().toISOString(),
  };
}

// Convert V2 to legacy format for backwards compatibility
function radioV2ToLegacy(v2: RadioStatusV2): RadioStatus {
  return {
    kind: "radio",
    isOnline: v2.isLive,
    statusText: v2.isLive ? "Ligado" : "Desligado",
    listeners: v2.listenersNow,
    title: v2.stationName,
    nowPlaying: v2.nowPlaying ? {
      track: v2.nowPlaying,
      artist: "",
      song: v2.nowPlaying,
      coverUrl: v2.artworkUrl,
      genre: v2.genre,
    } : null,
    nextPlaying: v2.nextUp ? { track: v2.nextUp } : null,
    endpoints: v2.endpoints,
    fetchedAt: v2.checkedAt,
  };
}

function tvV2ToLegacy(v2: TvStatusV2): TvStatus {
  return {
    kind: "tv",
    isOnline: v2.isLive,
    statusText: v2.isLive ? "Ligado" : "Desligado",
    viewers: v2.viewersNow,
    plan: v2.plan ? {
      viewersLimit: v2.plan.maxViewers,
      ftpLimit: v2.plan.ftp,
      bitrate: String(v2.bitrateKbps) + "kbps",
    } : null,
    endpoints: v2.endpoints,
    fetchedAt: v2.checkedAt,
  };
}

// Fetch status from external API with timeout
async function fetchExternalStatus(
  config: StreamingConfig
): Promise<{ v2: RadioStatusV2 | TvStatusV2; legacy: RadioStatus | TvStatus } | null> {
  if (!config.api_json_url) {
    return null;
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

  try {
    const response = await fetch(config.api_json_url, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "ConexaoStreaming/2.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    const data = await response.json();

    if (config.kind === "radio") {
      const v2 = parseVoxHdRadioV2(data, latencyMs);
      const legacy = radioV2ToLegacy(v2);
      return { v2, legacy };
    } else {
      const v2 = parseVoxTvV2(data, latencyMs);
      const legacy = tvV2ToLegacy(v2);
      return { v2, legacy };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`Error fetching external API for ${config.kind}:`, error);
    throw error;
  }
}

// Check if cache is still valid (30 seconds)
function isCacheValid(lastFetchedAt: string | null): boolean {
  if (!lastFetchedAt) return false;
  const elapsed = Date.now() - new Date(lastFetchedAt).getTime();
  return elapsed < 30000; // 30 seconds
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    
    console.log("[streaming-gateway] Request path:", url.pathname);
    console.log("[streaming-gateway] Path parts:", pathParts);
    
    // Expected paths: /streaming-gateway/radio/status or /streaming-gateway/tv/status
    // Supabase includes function name in path, so we need to skip it
    let offset = 0;
    if (pathParts[0] === "streaming-gateway") {
      offset = 1;
    }
    
    const kind = pathParts[offset] as "radio" | "tv";
    const action = pathParts[offset + 1] || "status";
    const format = url.searchParams.get("format") || "legacy"; // "v2" or "legacy"

    console.log("[streaming-gateway] Parsed - kind:", kind, "action:", action, "format:", format);

    if (!["radio", "tv"].includes(kind)) {
      console.error("[streaming-gateway] Invalid kind:", kind, "from path:", url.pathname);
      return new Response(
        JSON.stringify({ ok: false, error: { message: `Invalid kind '${kind}'. Use 'radio' or 'tv'. Path: ${url.pathname}` } }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get tenant ID from header or query param
    const tenantId = req.headers.get("x-tenant-id") || url.searchParams.get("tenant");

    if (!tenantId) {
      return new Response(
        JSON.stringify({ ok: false, error: { message: "Missing tenant ID" } }),
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
        JSON.stringify({ ok: false, error: { message: "Database error", statusCode: 500 } }),
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
      const cached = config.last_snapshot;
      return new Response(
        JSON.stringify({ 
          ...cached, 
          fromCache: true,
          cachedAt: config.last_fetched_at 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // If no API URL, return offline status
    if (!config.api_json_url) {
      const checkedAt = new Date().toISOString();
      
      if (format === "v2") {
        const offlineV2 = kind === "radio" ? {
          ok: true,
          kind: "radio",
          isLive: false,
          listenersNow: 0,
          bitrateKbps: 0,
          nowPlaying: null,
          nextUp: null,
          stationName: "Rádio",
          genre: null,
          artworkUrl: null,
          plan: null,
          endpoints: {},
          checkedAt,
        } : {
          ok: true,
          kind: "tv",
          isLive: false,
          viewersNow: 0,
          bitrateKbps: 0,
          plan: null,
          serverIp: null,
          endpoints: {},
          checkedAt,
        };
        return new Response(
          JSON.stringify(offlineV2),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const offlineStatus = kind === "radio" ? {
        kind: "radio",
        isOnline: false,
        statusText: "Sem API configurada",
        listeners: 0,
        title: "Rádio",
        nowPlaying: null,
        nextPlaying: null,
        endpoints: {},
        fetchedAt: checkedAt,
      } : {
        kind: "tv",
        isOnline: false,
        statusText: "Sem API configurada",
        viewers: 0,
        plan: null,
        endpoints: {},
        fetchedAt: checkedAt,
      };

      return new Response(
        JSON.stringify(offlineStatus),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from external API
    try {
      const result = await fetchExternalStatus(config);

      if (result) {
        // Update cache in database with legacy format for compatibility
        await supabase
          .from("external_streaming_configs")
          .update({
            last_snapshot: result.legacy as unknown as Record<string, unknown>,
            last_fetched_at: new Date().toISOString(),
            error_count: 0,
            last_error: null,
          })
          .eq("id", config.id);

        // Return format based on query param
        const responseData = format === "v2" ? result.v2 : result.legacy;
        return new Response(
          JSON.stringify(responseData),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (apiError) {
      const errorMessage = apiError instanceof Error ? apiError.message : "Unknown error";
      const isTimeout = errorMessage.includes("abort");
      
      // Update error count in database
      await supabase
        .from("external_streaming_configs")
        .update({
          error_count: config.error_count + 1,
          last_error: isTimeout ? "Timeout (8s)" : errorMessage,
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
            apiError: isTimeout ? "Timeout ao conectar à API" : errorMessage,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Return offline status with error
      const checkedAt = new Date().toISOString();
      
      if (format === "v2") {
        const errorV2 = kind === "radio" ? {
          ok: false,
          kind: "radio",
          isLive: false,
          listenersNow: 0,
          bitrateKbps: 0,
          nowPlaying: null,
          nextUp: null,
          stationName: "Rádio",
          genre: null,
          artworkUrl: null,
          plan: null,
          endpoints: {},
          checkedAt,
          error: { message: isTimeout ? "Timeout ao conectar à API" : errorMessage, statusCode: isTimeout ? 504 : 500 },
        } : {
          ok: false,
          kind: "tv",
          isLive: false,
          viewersNow: 0,
          bitrateKbps: 0,
          plan: null,
          serverIp: null,
          endpoints: {},
          checkedAt,
          error: { message: isTimeout ? "Timeout ao conectar à API" : errorMessage, statusCode: isTimeout ? 504 : 500 },
        };
        return new Response(
          JSON.stringify(errorV2),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const offlineStatus = kind === "radio" ? {
        kind: "radio",
        isOnline: false,
        statusText: "Indisponível",
        listeners: 0,
        title: "Rádio",
        nowPlaying: null,
        nextPlaying: null,
        endpoints: {},
        fetchedAt: checkedAt,
        error: isTimeout ? "Timeout ao conectar à API" : errorMessage,
      } : {
        kind: "tv",
        isOnline: false,
        statusText: "Indisponível",
        viewers: 0,
        plan: null,
        endpoints: {},
        fetchedAt: checkedAt,
        error: isTimeout ? "Timeout ao conectar à API" : errorMessage,
      };

      return new Response(
        JSON.stringify(offlineStatus),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fallback
    return new Response(
      JSON.stringify({ ok: false, error: { message: "Unexpected error" } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Gateway error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: { message: "Internal server error", statusCode: 500 } }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
