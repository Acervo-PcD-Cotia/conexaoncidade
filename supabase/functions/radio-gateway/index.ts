// ============================================
// Radio Gateway - Proxy for AzuraCast and other radio providers
// ============================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-tenant-id",
};

interface RadioTenantConfig {
  id: string;
  tenant_id: string;
  provider: string;
  base_url: string;
  station_id: string;
  api_key: string | null;
  stream_public_url: string;
  mount_point: string;
  is_active: boolean;
  metadata: Record<string, unknown>;
}

interface AzuraCastNowPlaying {
  station: {
    name: string;
    listen_url: string;
    is_public: boolean;
  };
  listeners: {
    current: number;
    unique: number;
    total: number;
  };
  live: {
    is_live: boolean;
    streamer_name: string;
  };
  now_playing: {
    song: {
      title: string;
      artist: string;
      album: string;
      art: string;
    };
    elapsed: number;
    remaining: number;
    duration: number;
  };
  playing_next?: {
    song: {
      title: string;
      artist: string;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.replace("/radio-gateway", "").split("/").filter(Boolean);
    
    // Extract tenant from header or query
    const tenantId = req.headers.get("x-tenant-id") || url.searchParams.get("tenant");
    
    if (!tenantId) {
      return new Response(
        JSON.stringify({ error: "Missing tenant ID", code: "MISSING_TENANT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch tenant radio config
    const { data: config, error: configError } = await supabase
      .from("radio_tenant_configs")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("is_active", true)
      .single();

    if (configError || !config) {
      console.log("Radio config not found for tenant:", tenantId, configError);
      return new Response(
        JSON.stringify({ 
          error: "Radio not configured for this tenant",
          code: "NOT_CONFIGURED",
          // Return mock data flag
          useMock: true
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const radioConfig = config as RadioTenantConfig;
    const endpoint = pathParts[0] || "status";

    console.log(`Radio Gateway: ${endpoint} for tenant ${tenantId} (${radioConfig.provider})`);

    // Route to appropriate handler
    let responseData: unknown;
    
    switch (endpoint) {
      case "status":
        responseData = await getStatus(radioConfig);
        break;
      case "stats":
        responseData = await getStats(radioConfig, url.searchParams.get("period") || "day");
        break;
      case "encoder":
        responseData = await getEncoderConfig(radioConfig);
        break;
      case "autodj":
        if (pathParts[1] === "toggle" && req.method === "POST") {
          responseData = await toggleAutoDJ(radioConfig);
        } else {
          responseData = await getAutoDJStatus(radioConfig);
        }
        break;
      case "playlists":
        responseData = await getPlaylists(radioConfig);
        break;
      case "tracks":
        responseData = await getTracks(radioConfig, url.searchParams);
        break;
      case "settings":
        if (req.method === "PATCH") {
          const body = await req.json();
          responseData = await updateSettings(supabase, tenantId, body);
        } else {
          responseData = await getSettings(radioConfig);
        }
        break;
      case "players":
        responseData = await getPlayers(radioConfig);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown endpoint: ${endpoint}` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    console.error("Radio Gateway Error:", errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        useMock: true 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ============= AzuraCast API Handlers =============

async function fetchAzuraCast(config: RadioTenantConfig, endpoint: string): Promise<unknown> {
  const url = `${config.base_url}/api/station/${config.station_id}${endpoint}`;
  const headers: Record<string, string> = {
    "Accept": "application/json",
  };
  
  if (config.api_key) {
    headers["X-API-Key"] = config.api_key;
  }

  console.log(`Fetching AzuraCast: ${url}`);
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const text = await response.text();
    console.error(`AzuraCast error ${response.status}: ${text}`);
    throw new Error(`AzuraCast API error: ${response.status}`);
  }
  
  return response.json();
}

async function getStatus(config: RadioTenantConfig) {
  try {
    // AzuraCast nowplaying endpoint
    const data = await fetchAzuraCast(config, "/nowplaying") as AzuraCastNowPlaying;
    
    return {
      isOnline: true,
      isLive: data.live?.is_live || false,
      streamerName: data.live?.streamer_name || null,
      listeners: data.listeners?.current || 0,
      listenersUnique: data.listeners?.unique || 0,
      listenersTotal: data.listeners?.total || 0,
      currentTrack: data.now_playing?.song ? {
        title: data.now_playing.song.title,
        artist: data.now_playing.song.artist,
        album: data.now_playing.song.album,
        artUrl: data.now_playing.song.art,
        elapsed: data.now_playing.elapsed,
        remaining: data.now_playing.remaining,
        duration: data.now_playing.duration,
      } : null,
      nextTrack: data.playing_next?.song ? {
        title: data.playing_next.song.title,
        artist: data.playing_next.song.artist,
      } : null,
      streamUrl: config.stream_public_url,
      stationName: data.station?.name || "Rádio",
    };
  } catch (error) {
    console.error("Error fetching status:", error);
    return {
      isOnline: false,
      isLive: false,
      streamerName: null,
      listeners: 0,
      currentTrack: null,
      nextTrack: null,
      streamUrl: config.stream_public_url,
      stationName: "Rádio",
      error: "Não foi possível conectar ao servidor de rádio",
    };
  }
}

async function getStats(config: RadioTenantConfig, period: string) {
  try {
    // AzuraCast listeners history
    const data = await fetchAzuraCast(config, `/listeners?start=-${period === "month" ? "30" : period === "week" ? "7" : "1"} days`) as unknown[];
    
    return {
      period,
      totalListeners: data.length,
      averageListeners: Math.round(data.length / (period === "month" ? 30 : period === "week" ? 7 : 1)),
      peakListeners: data.length,
      history: [],
    };
  } catch (error) {
    console.error("Error fetching stats:", error);
    return {
      period,
      totalListeners: 0,
      averageListeners: 0,
      peakListeners: 0,
      history: [],
    };
  }
}

async function getEncoderConfig(config: RadioTenantConfig) {
  // Return configuration for broadcasting
  return {
    server: config.base_url.replace("https://", "").replace("http://", ""),
    port: 8000,
    mountPoint: config.mount_point || "/radio",
    username: "source",
    password: "••••••••", // Masked - reveal via separate endpoint
    format: "MP3",
    bitrate: "128kbps",
    sampleRate: "44100Hz",
    streamUrl: config.stream_public_url,
  };
}

async function getAutoDJStatus(config: RadioTenantConfig) {
  try {
    const data = await fetchAzuraCast(config, "") as { automation_enabled?: boolean };
    return {
      enabled: data.automation_enabled || false,
      currentPlaylist: null,
      queue: [],
    };
  } catch (error) {
    console.error("Error fetching AutoDJ status:", error);
    return {
      enabled: false,
      currentPlaylist: null,
      queue: [],
    };
  }
}

async function toggleAutoDJ(config: RadioTenantConfig) {
  try {
    // AzuraCast toggle automation
    const url = `${config.base_url}/api/station/${config.station_id}/automation/run`;
    const headers: Record<string, string> = {
      "Accept": "application/json",
      "Content-Type": "application/json",
    };
    
    if (config.api_key) {
      headers["X-API-Key"] = config.api_key;
    }
    
    await fetch(url, { method: "POST", headers });
    
    return { enabled: true, message: "AutoDJ toggled" };
  } catch (error) {
    console.error("Error toggling AutoDJ:", error);
    throw error;
  }
}

async function getPlaylists(config: RadioTenantConfig) {
  try {
    const data = await fetchAzuraCast(config, "/playlists") as Array<Record<string, unknown>>;
    return data.map((pl) => ({
      id: pl.id,
      name: pl.name,
      isEnabled: pl.is_enabled,
      type: pl.type,
      order: pl.weight,
      tracksCount: (pl.num_songs as number) || 0,
    }));
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
}

async function getTracks(config: RadioTenantConfig, searchParams: URLSearchParams) {
  try {
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    
    let endpoint = `/files?page=${page}&limit=${limit}`;
    if (search) {
      endpoint += `&search=${encodeURIComponent(search)}`;
    }
    
    const data = await fetchAzuraCast(config, endpoint) as Array<Record<string, unknown>>;
    
    return {
      items: data.map((track) => ({
        id: track.unique_id || track.id,
        title: (track.title as string) || "Sem título",
        artist: (track.artist as string) || "Artista desconhecido",
        album: track.album,
        genre: track.genre,
        durationSec: (track.length as number) || 0,
        playCount: (track.play_count as number) || 0,
        uploadedAt: track.uploaded_at,
        artUrl: track.art,
      })),
      total: data.length,
    };
  } catch (error) {
    console.error("Error fetching tracks:", error);
    return { items: [], total: 0 };
  }
}

async function getSettings(config: RadioTenantConfig) {
  return {
    stationName: "Rádio Conexão",
    streamUrl: config.stream_public_url,
    provider: config.provider,
    baseUrl: config.base_url,
    stationId: config.station_id,
    mountPoint: config.mount_point,
    isActive: config.is_active,
    metadata: config.metadata,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function updateSettings(
  supabase: any, 
  tenantId: string, 
  data: Record<string, unknown>
) {
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  };
  
  const { error } = await supabase
    .from("radio_tenant_configs")
    .update(updateData)
    .eq("tenant_id", tenantId);
    
  if (error) {
    throw new Error(`Failed to update settings: ${error.message}`);
  }
  
  return { success: true, message: "Settings updated" };
}

async function getPlayers(config: RadioTenantConfig) {
  return [
    {
      id: "default",
      name: "Player Padrão",
      kind: "mini",
      theme: "dark",
      embedCode: `<iframe src="${config.stream_public_url}/player" width="400" height="100" frameborder="0"></iframe>`,
      streamUrl: config.stream_public_url,
    },
  ];
}
