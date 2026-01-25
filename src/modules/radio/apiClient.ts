// ============================================
// Módulo Rádio Web - API Client (isolado)
// Conecta via Edge Function radio-gateway para backend real
// ============================================

import type {
  RadioStreamStatus,
  RadioEncoderConfig,
  RadioPlaylist,
  RadioTrack,
  RadioStats,
  RadioPlayerEmbed,
  RadioAutoDJStatus,
  RadioSettings,
  RadioTrackUpload,
} from "./types";
import { RADIO_ENDPOINTS } from "./endpoints";
import { mockRadioServer } from "./mockServer";

// Use Edge Function as gateway
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const GATEWAY_URL = `${SUPABASE_URL}/functions/v1/radio-gateway`;

// Get current tenant ID from context (will be injected)
let currentTenantId: string | null = null;

export function setRadioTenantId(tenantId: string | null) {
  currentTenantId = tenantId;
}

class RadioApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // If no tenant configured, use mock
    if (!currentTenantId) {
      console.log("Radio: No tenant configured, using mock");
      return mockRadioServer.handle<T>(endpoint, options);
    }

    try {
      // Map endpoint to gateway endpoint
      const gatewayEndpoint = this.mapEndpoint(endpoint);
      
      const response = await fetch(`${GATEWAY_URL}${gatewayEndpoint}`, {
        headers: {
          "Content-Type": "application/json",
          "x-tenant-id": currentTenantId,
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If not configured, fallback to mock
        if (errorData.useMock || errorData.code === "NOT_CONFIGURED") {
          console.log("Radio: Backend not configured, using mock");
          return mockRadioServer.handle<T>(endpoint, options);
        }
        
        throw new Error(`API Error ${response.status}: ${errorData.error || "Unknown error"}`);
      }

      return response.json();
    } catch (error) {
      console.error("Radio API error, falling back to mock:", error);
      // Fallback to mock on any error
      return mockRadioServer.handle<T>(endpoint, options);
    }
  }

  private mapEndpoint(endpoint: string): string {
    // Map internal endpoints to gateway endpoints
    if (endpoint.includes("/status")) return "/status";
    if (endpoint.includes("/encoder")) return "/encoder";
    if (endpoint.includes("/autodj/toggle")) return "/autodj/toggle";
    if (endpoint.includes("/autodj")) return "/autodj";
    if (endpoint.includes("/playlists")) return "/playlists";
    if (endpoint.includes("/tracks") || endpoint.includes("/library")) return "/tracks";
    if (endpoint.includes("/stats")) return `/stats${endpoint.includes("?") ? endpoint.substring(endpoint.indexOf("?")) : ""}`;
    if (endpoint.includes("/players")) return "/players";
    if (endpoint.includes("/settings")) return "/settings";
    return endpoint;
  }

  // ============= Status =============
  async getStatus(): Promise<RadioStreamStatus> {
    return this.fetch<RadioStreamStatus>(RADIO_ENDPOINTS.STATUS);
  }

  // ============= Encoder =============
  async getEncoderConfig(): Promise<RadioEncoderConfig> {
    return this.fetch<RadioEncoderConfig>(RADIO_ENDPOINTS.ENCODER_CONFIG);
  }

  async revealPassword(): Promise<{ password: string }> {
    return this.fetch<{ password: string }>(RADIO_ENDPOINTS.ENCODER_REVEAL_PASSWORD, {
      method: "POST",
    });
  }

  // ============= AutoDJ =============
  async getAutoDJStatus(): Promise<RadioAutoDJStatus> {
    return this.fetch<RadioAutoDJStatus>(RADIO_ENDPOINTS.AUTODJ_STATUS);
  }

  async toggleAutoDJ(): Promise<RadioAutoDJStatus> {
    return this.fetch<RadioAutoDJStatus>(RADIO_ENDPOINTS.AUTODJ_TOGGLE, {
      method: "POST",
    });
  }

  // ============= Playlists =============
  async getPlaylists(): Promise<RadioPlaylist[]> {
    return this.fetch<RadioPlaylist[]>(RADIO_ENDPOINTS.PLAYLISTS);
  }

  async getPlaylist(id: string): Promise<RadioPlaylist> {
    return this.fetch<RadioPlaylist>(RADIO_ENDPOINTS.PLAYLIST_BY_ID(id));
  }

  async createPlaylist(data: Partial<RadioPlaylist>): Promise<RadioPlaylist> {
    return this.fetch<RadioPlaylist>(RADIO_ENDPOINTS.PLAYLISTS, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updatePlaylist(id: string, data: Partial<RadioPlaylist>): Promise<RadioPlaylist> {
    return this.fetch<RadioPlaylist>(RADIO_ENDPOINTS.PLAYLIST_BY_ID(id), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deletePlaylist(id: string): Promise<void> {
    return this.fetch<void>(RADIO_ENDPOINTS.PLAYLIST_BY_ID(id), {
      method: "DELETE",
    });
  }

  // ============= Library =============
  async getTracks(params?: {
    page?: number;
    limit?: number;
    search?: string;
    genre?: string;
  }): Promise<{ items: RadioTrack[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.search) searchParams.set("search", params.search);
    if (params?.genre) searchParams.set("genre", params.genre);

    const query = searchParams.toString();
    const endpoint = query ? `${RADIO_ENDPOINTS.TRACKS}?${query}` : RADIO_ENDPOINTS.TRACKS;

    return this.fetch<{ items: RadioTrack[]; total: number }>(endpoint);
  }

  async getTrack(id: string): Promise<RadioTrack> {
    return this.fetch<RadioTrack>(RADIO_ENDPOINTS.TRACK_BY_ID(id));
  }

  async updateTrack(id: string, data: Partial<RadioTrack>): Promise<RadioTrack> {
    return this.fetch<RadioTrack>(RADIO_ENDPOINTS.TRACK_BY_ID(id), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteTrack(id: string): Promise<void> {
    return this.fetch<void>(RADIO_ENDPOINTS.TRACK_BY_ID(id), {
      method: "DELETE",
    });
  }

  async uploadTrack(file: File, metadata?: Partial<RadioTrack>): Promise<RadioTrackUpload> {
    // Para upload, sempre usa mock por enquanto (gateway não suporta upload direto ainda)
    return {
      id: `upload-${Date.now()}`,
      filename: file.name,
      status: "done",
      progressPct: 100,
      track: {
        id: `track-${Date.now()}`,
        title: metadata?.title || file.name.replace(/\.[^/.]+$/, ""),
        artist: metadata?.artist || "Artista Desconhecido",
        durationSec: 180,
        uploadedAt: new Date().toISOString(),
        playCount: 0,
      },
    };
  }

  // ============= Stats =============
  async getStats(period: "day" | "week" | "month" = "day"): Promise<RadioStats> {
    return this.fetch<RadioStats>(`${RADIO_ENDPOINTS.STATS}?period=${period}`);
  }

  // ============= Players =============
  async getPlayers(): Promise<RadioPlayerEmbed[]> {
    return this.fetch<RadioPlayerEmbed[]>(RADIO_ENDPOINTS.PLAYERS);
  }

  async generatePlayer(config: {
    name: string;
    kind: RadioPlayerEmbed["kind"];
    theme: RadioPlayerEmbed["theme"];
    primaryColor?: string;
  }): Promise<RadioPlayerEmbed> {
    return this.fetch<RadioPlayerEmbed>(RADIO_ENDPOINTS.PLAYER_GENERATE, {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  async deletePlayer(id: string): Promise<void> {
    return this.fetch<void>(RADIO_ENDPOINTS.PLAYER_BY_ID(id), {
      method: "DELETE",
    });
  }

  // ============= Settings =============
  async getSettings(): Promise<RadioSettings> {
    return this.fetch<RadioSettings>(RADIO_ENDPOINTS.SETTINGS);
  }

  async updateSettings(data: Partial<RadioSettings>): Promise<RadioSettings> {
    return this.fetch<RadioSettings>(RADIO_ENDPOINTS.SETTINGS, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const radioApiClient = new RadioApiClient();
