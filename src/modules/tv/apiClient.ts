// ============================================
// Módulo TV Web - API Client (isolado)
// ============================================

import type {
  TvLiveStatus,
  TvScheduleItem,
  TvVodItem,
  TvUploadJob,
  TvStats,
  TvPlayerEmbed,
  TvIngestCredentials,
  TvSettings,
} from "./types";
import { TV_ENDPOINTS } from "./endpoints";
import { mockTvServer } from "./mockServer";

const BASE_URL = import.meta.env.VITE_TV_API_BASE_URL || "";
const USE_MOCK = !BASE_URL;

class TvApiClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (USE_MOCK) {
      return mockTvServer.handle<T>(endpoint, options);
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

  // ============= Live Status =============
  async getLiveStatus(): Promise<TvLiveStatus> {
    return this.fetch<TvLiveStatus>(TV_ENDPOINTS.LIVE_STATUS);
  }

  async startLive(): Promise<TvLiveStatus> {
    return this.fetch<TvLiveStatus>(TV_ENDPOINTS.LIVE_START, {
      method: "POST",
    });
  }

  async stopLive(): Promise<TvLiveStatus> {
    return this.fetch<TvLiveStatus>(TV_ENDPOINTS.LIVE_STOP, {
      method: "POST",
    });
  }

  // ============= Ingest =============
  async getIngestCredentials(): Promise<TvIngestCredentials> {
    return this.fetch<TvIngestCredentials>(TV_ENDPOINTS.INGEST_CREDENTIALS);
  }

  async revealStreamKey(): Promise<{ streamKey: string }> {
    return this.fetch<{ streamKey: string }>(TV_ENDPOINTS.INGEST_REVEAL_KEY, {
      method: "POST",
    });
  }

  async regenerateCredentials(): Promise<TvIngestCredentials> {
    return this.fetch<TvIngestCredentials>(TV_ENDPOINTS.INGEST_REGENERATE, {
      method: "POST",
    });
  }

  // ============= Schedule =============
  async getSchedule(): Promise<TvScheduleItem[]> {
    return this.fetch<TvScheduleItem[]>(TV_ENDPOINTS.SCHEDULE);
  }

  async getWeekSchedule(): Promise<TvScheduleItem[]> {
    return this.fetch<TvScheduleItem[]>(TV_ENDPOINTS.SCHEDULE_WEEK);
  }

  async getScheduleItem(id: string): Promise<TvScheduleItem> {
    return this.fetch<TvScheduleItem>(TV_ENDPOINTS.SCHEDULE_BY_ID(id));
  }

  async createScheduleItem(data: Partial<TvScheduleItem>): Promise<TvScheduleItem> {
    return this.fetch<TvScheduleItem>(TV_ENDPOINTS.SCHEDULE, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateScheduleItem(id: string, data: Partial<TvScheduleItem>): Promise<TvScheduleItem> {
    return this.fetch<TvScheduleItem>(TV_ENDPOINTS.SCHEDULE_BY_ID(id), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteScheduleItem(id: string): Promise<void> {
    return this.fetch<void>(TV_ENDPOINTS.SCHEDULE_BY_ID(id), {
      method: "DELETE",
    });
  }

  // ============= VOD =============
  async getVods(params?: {
    page?: number;
    limit?: number;
    status?: TvVodItem["status"];
    search?: string;
  }): Promise<{ items: TvVodItem[]; total: number }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);

    const query = searchParams.toString();
    const endpoint = query ? `${TV_ENDPOINTS.VODS}?${query}` : TV_ENDPOINTS.VODS;

    return this.fetch<{ items: TvVodItem[]; total: number }>(endpoint);
  }

  async getVod(id: string): Promise<TvVodItem> {
    return this.fetch<TvVodItem>(TV_ENDPOINTS.VOD_BY_ID(id));
  }

  async updateVod(id: string, data: Partial<TvVodItem>): Promise<TvVodItem> {
    return this.fetch<TvVodItem>(TV_ENDPOINTS.VOD_BY_ID(id), {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteVod(id: string): Promise<void> {
    return this.fetch<void>(TV_ENDPOINTS.VOD_BY_ID(id), {
      method: "DELETE",
    });
  }

  // ============= Uploads =============
  async getUploadJobs(): Promise<TvUploadJob[]> {
    return this.fetch<TvUploadJob[]>(TV_ENDPOINTS.UPLOADS);
  }

  async getUploadJob(id: string): Promise<TvUploadJob> {
    return this.fetch<TvUploadJob>(TV_ENDPOINTS.UPLOAD_BY_ID(id));
  }

  async startUpload(file: File, metadata?: { title?: string; description?: string }): Promise<TvUploadJob> {
    if (USE_MOCK) {
      return {
        id: `upload-${Date.now()}`,
        filename: file.name,
        progressPct: 0,
        status: "uploading",
        stage: "upload",
        createdAt: new Date().toISOString(),
      };
    }

    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await fetch(`${BASE_URL}${TV_ENDPOINTS.UPLOAD_START}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    return response.json();
  }

  async cancelUpload(id: string): Promise<void> {
    return this.fetch<void>(TV_ENDPOINTS.UPLOAD_CANCEL(id), {
      method: "POST",
    });
  }

  // ============= Stats =============
  async getStats(period: "day" | "week" | "month" = "day"): Promise<TvStats> {
    return this.fetch<TvStats>(`${TV_ENDPOINTS.STATS}?period=${period}`);
  }

  // ============= Players =============
  async getPlayers(): Promise<TvPlayerEmbed[]> {
    return this.fetch<TvPlayerEmbed[]>(TV_ENDPOINTS.PLAYERS);
  }

  async generatePlayer(config: {
    name: string;
    kind: TvPlayerEmbed["kind"];
    theme: TvPlayerEmbed["theme"];
    autoplay?: boolean;
    muted?: boolean;
    controls?: boolean;
  }): Promise<TvPlayerEmbed> {
    return this.fetch<TvPlayerEmbed>(TV_ENDPOINTS.PLAYER_GENERATE, {
      method: "POST",
      body: JSON.stringify(config),
    });
  }

  async deletePlayer(id: string): Promise<void> {
    return this.fetch<void>(TV_ENDPOINTS.PLAYER_BY_ID(id), {
      method: "DELETE",
    });
  }

  // ============= Settings =============
  async getSettings(): Promise<TvSettings> {
    return this.fetch<TvSettings>(TV_ENDPOINTS.SETTINGS);
  }

  async updateSettings(data: Partial<TvSettings>): Promise<TvSettings> {
    return this.fetch<TvSettings>(TV_ENDPOINTS.SETTINGS, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

export const tvApiClient = new TvApiClient();
