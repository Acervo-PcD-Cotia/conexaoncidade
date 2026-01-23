// ============================================
// Módulo Rádio Web - API Client (isolado)
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

const BASE_URL = import.meta.env.VITE_RADIO_API_BASE_URL || "";
const USE_MOCK = !BASE_URL;

class RadioApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (USE_MOCK) {
      return mockRadioServer.handle<T>(endpoint, options);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error ${response.status}: ${error}`);
    }

    return response.json();
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

  async deleteTrack(id: string): Promise<void> {
    return this.fetch<void>(RADIO_ENDPOINTS.TRACK_BY_ID(id), {
      method: "DELETE",
    });
  }

  async uploadTrack(file: File, metadata?: Partial<RadioTrack>): Promise<RadioTrackUpload> {
    // Para upload real, usaria FormData
    // No mock, simula o processo
    if (USE_MOCK) {
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

    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await fetch(`${BASE_URL}${RADIO_ENDPOINTS.TRACK_UPLOAD}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
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
