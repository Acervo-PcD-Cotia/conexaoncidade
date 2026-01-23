// ============================================
// Módulo TV Web - Mock Server
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

// Dados mock coerentes
const mockLiveStatus: TvLiveStatus = {
  state: "offline",
  viewersNow: 0,
  peakToday: 0,
  ingest: {
    rtmpUrl: "rtmp://ingest.suatv.com.br/live",
    streamKeyMasked: "••••••••••••",
    srtUrl: "srt://ingest.suatv.com.br:9000",
    hlsUrl: "https://cdn.suatv.com.br/live/playlist.m3u8",
  },
  quality: {
    resolution: "1920x1080",
    bitrate: 6000,
    fps: 30,
  },
  updatedAt: new Date().toISOString(),
};

const mockIngestCredentials: TvIngestCredentials = {
  rtmpUrl: "rtmp://ingest.suatv.com.br/live",
  rtmpStreamKey: "••••••••••••••••",
  srtUrl: "srt://ingest.suatv.com.br:9000",
  srtStreamId: "••••••••",
  backupRtmpUrl: "rtmp://backup.suatv.com.br/live",
};

const mockSchedule: TvScheduleItem[] = [
  {
    id: "sch-1",
    title: "Jornal da Manhã",
    description: "Notícias locais e regionais",
    startAt: new Date(Date.now() + 3600000).toISOString(),
    endAt: new Date(Date.now() + 7200000).toISOString(),
    source: "live",
    isRecurring: true,
    recurringPattern: {
      days: [1, 2, 3, 4, 5],
      startTime: "07:00",
      endTime: "08:00",
    },
    createdAt: "2024-01-10T08:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "sch-2",
    title: "Especial: Festas da Cidade",
    description: "Cobertura completa dos eventos",
    startAt: new Date(Date.now() + 10800000).toISOString(),
    endAt: new Date(Date.now() + 14400000).toISOString(),
    source: "vod",
    vodId: "vod-1",
    thumbnailUrl: "https://picsum.photos/seed/tv1/320/180",
    isRecurring: false,
    createdAt: "2024-01-18T14:00:00Z",
    updatedAt: "2024-01-18T14:00:00Z",
  },
];

const mockVods: TvVodItem[] = [
  {
    id: "vod-1",
    title: "Especial: Festas da Cidade 2024",
    description: "Cobertura completa das festas juninas",
    durationSec: 3600,
    status: "ready",
    thumbnailUrl: "https://picsum.photos/seed/vod1/320/180",
    hlsUrl: "https://cdn.suatv.com.br/vod/festas-2024/playlist.m3u8",
    resolution: "1080p",
    fileSize: 2147483648,
    views: 1520,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "vod-2",
    title: "Entrevista: Prefeito Municipal",
    description: "Entrevista exclusiva sobre os projetos da cidade",
    durationSec: 1800,
    status: "ready",
    thumbnailUrl: "https://picsum.photos/seed/vod2/320/180",
    hlsUrl: "https://cdn.suatv.com.br/vod/entrevista-prefeito/playlist.m3u8",
    resolution: "1080p",
    fileSize: 1073741824,
    views: 890,
    createdAt: "2024-01-12T14:00:00Z",
    updatedAt: "2024-01-12T15:30:00Z",
  },
  {
    id: "vod-3",
    title: "Documentário: História da Cidade",
    description: "A história e evolução do município",
    durationSec: 5400,
    status: "processing",
    thumbnailUrl: "https://picsum.photos/seed/vod3/320/180",
    resolution: "720p",
    views: 0,
    createdAt: "2024-01-20T08:00:00Z",
    updatedAt: "2024-01-20T08:00:00Z",
  },
];

const mockUploadJobs: TvUploadJob[] = [
  {
    id: "upload-1",
    filename: "documentario-historia.mp4",
    progressPct: 75,
    status: "processing",
    stage: "transcode",
    vodId: "vod-3",
    startedAt: "2024-01-20T08:00:00Z",
    createdAt: "2024-01-20T07:55:00Z",
  },
];

const mockStats: TvStats = {
  summary: {
    totalViews: 15420,
    peakViewers: 234,
    avgWatchMinutes: 18,
    totalHoursWatched: 4628,
  },
  viewsTimeseries: Array.from({ length: 24 }, (_, i) => ({
    ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    views: Math.floor(Math.random() * 150) + 20,
  })),
  topReferrers: [
    { ref: "Acesso Direto", count: 8500 },
    { ref: "Google", count: 3200 },
    { ref: "Facebook", count: 2100 },
    { ref: "Instagram", count: 1200 },
    { ref: "WhatsApp", count: 420 },
  ],
  devices: [
    { device: "Mobile", count: 8500, percentage: 55 },
    { device: "Desktop", count: 4000, percentage: 26 },
    { device: "Smart TV", count: 2000, percentage: 13 },
    { device: "Tablet", count: 920, percentage: 6 },
  ],
  topVods: [
    { vodId: "vod-1", title: "Especial: Festas da Cidade 2024", views: 1520 },
    { vodId: "vod-2", title: "Entrevista: Prefeito Municipal", views: 890 },
  ],
  geoData: [
    { country: "Brasil", code: "BR", count: 14200 },
    { country: "Portugal", code: "PT", count: 680 },
    { country: "Estados Unidos", code: "US", count: 320 },
    { country: "Argentina", code: "AR", count: 220 },
  ],
};

const mockPlayers: TvPlayerEmbed[] = [
  {
    id: "player-1",
    name: "Player Responsivo",
    kind: "responsive",
    theme: "dark",
    autoplay: false,
    muted: false,
    controls: true,
    code: '<iframe src="https://player.tv/embed/abc123" width="100%" height="auto" style="aspect-ratio: 16/9;"></iframe>',
    previewUrl: "https://player.tv/preview/abc123",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "player-2",
    name: "Player Smart TV",
    kind: "smarttv",
    theme: "dark",
    autoplay: true,
    muted: true,
    controls: false,
    code: '<script src="https://player.tv/smarttv/def456.js"></script>',
    previewUrl: "https://player.tv/preview/def456",
    createdAt: "2024-01-16T14:00:00Z",
  },
];

const mockSettings: TvSettings = {
  channelName: "TV Conexão",
  channelDescription: "A TV da sua cidade",
  defaultQuality: "720p",
  enableDVR: true,
  dvrWindowMinutes: 120,
  enableChat: true,
  lowLatencyMode: false,
  transcodeProfiles: ["360p", "480p", "720p", "1080p"],
};

// Simula latência de rede
const delay = (ms: number = 300) => new Promise((r) => setTimeout(r, ms));

// Router mock
export const mockTvServer = {
  handle: async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    await delay(Math.random() * 200 + 100);

    const method = options?.method || "GET";

    // Live Status
    if (endpoint === "/live/status") {
      return mockLiveStatus as T;
    }
    if (endpoint === "/live/start" && method === "POST") {
      mockLiveStatus.state = "starting";
      setTimeout(() => {
        mockLiveStatus.state = "online";
        mockLiveStatus.startedAt = new Date().toISOString();
      }, 2000);
      return mockLiveStatus as T;
    }
    if (endpoint === "/live/stop" && method === "POST") {
      mockLiveStatus.state = "offline";
      mockLiveStatus.startedAt = undefined;
      return mockLiveStatus as T;
    }

    // Ingest
    if (endpoint === "/ingest/credentials") {
      return mockIngestCredentials as T;
    }
    if (endpoint === "/ingest/reveal-key" && method === "POST") {
      return { streamKey: "sk_live_abc123xyz789" } as T;
    }
    if (endpoint === "/ingest/regenerate" && method === "POST") {
      return { ...mockIngestCredentials, rtmpStreamKey: "new_key_generated" } as T;
    }

    // Schedule
    if (endpoint === "/schedule" || endpoint === "/schedule/week") {
      return mockSchedule as T;
    }
    if (endpoint.startsWith("/schedule/") && method === "GET") {
      const id = endpoint.split("/")[2];
      const item = mockSchedule.find((s) => s.id === id);
      if (item) return item as T;
      throw new Error("Item não encontrado");
    }

    // VOD
    if (endpoint === "/vod") {
      return { items: mockVods, total: mockVods.length } as T;
    }
    if (endpoint.startsWith("/vod/") && !endpoint.includes("/categories")) {
      const id = endpoint.split("/")[2];
      const vod = mockVods.find((v) => v.id === id);
      if (vod) return vod as T;
      throw new Error("VOD não encontrado");
    }

    // Uploads
    if (endpoint === "/uploads") {
      return mockUploadJobs as T;
    }

    // Stats
    if (endpoint === "/stats" || endpoint.startsWith("/stats?")) {
      return mockStats as T;
    }

    // Players
    if (endpoint === "/players") {
      return mockPlayers as T;
    }
    if (endpoint === "/players/generate" && method === "POST") {
      const body = JSON.parse(options?.body as string || "{}");
      const newPlayer: TvPlayerEmbed = {
        id: `player-${Date.now()}`,
        name: body.name || "Novo Player",
        kind: body.kind || "responsive",
        theme: body.theme || "dark",
        autoplay: body.autoplay ?? false,
        muted: body.muted ?? false,
        controls: body.controls ?? true,
        code: `<iframe src="https://player.tv/embed/${Date.now()}" width="100%" height="auto"></iframe>`,
        createdAt: new Date().toISOString(),
      };
      mockPlayers.push(newPlayer);
      return newPlayer as T;
    }

    // Settings
    if (endpoint === "/settings") {
      return mockSettings as T;
    }

    throw new Error(`Mock: endpoint não implementado: ${endpoint}`);
  },
};
