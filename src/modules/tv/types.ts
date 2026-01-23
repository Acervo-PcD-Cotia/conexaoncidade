// ============================================
// Módulo TV Web - Types (API-first, isolado)
// ============================================

// Status do live
export interface TvLiveStatus {
  state: "online" | "offline" | "starting" | "error";
  viewersNow: number;
  peakToday: number;
  ingest: {
    rtmpUrl: string;
    streamKeyMasked: string;
    srtUrl?: string;
    hlsUrl?: string;
  };
  quality: {
    resolution: string;
    bitrate: number;
    fps: number;
  };
  startedAt?: string;
  updatedAt: string;
}

// Item da grade linear
export interface TvScheduleItem {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  source: "live" | "vod";
  vodId?: string;
  thumbnailUrl?: string;
  isRecurring: boolean;
  recurringPattern?: {
    days: number[];
    startTime: string;
    endTime: string;
  };
  createdAt: string;
  updatedAt: string;
}

// VOD
export interface TvVodItem {
  id: string;
  title: string;
  description?: string;
  durationSec: number;
  status: "ready" | "processing" | "error" | "uploading";
  thumbnailUrl?: string;
  videoUrl?: string;
  hlsUrl?: string;
  resolution?: string;
  fileSize?: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Job de upload/transcoding
export interface TvUploadJob {
  id: string;
  filename: string;
  progressPct: number;
  status: "queued" | "uploading" | "processing" | "done" | "error";
  stage?: "upload" | "transcode" | "thumbnail" | "finalize";
  errorMessage?: string;
  vodId?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}

// Estatísticas
export interface TvStats {
  summary: {
    totalViews: number;
    peakViewers: number;
    avgWatchMinutes: number;
    totalHoursWatched: number;
  };
  viewsTimeseries: Array<{ ts: string; views: number }>;
  topReferrers: Array<{ ref: string; count: number }>;
  devices: Array<{ device: string; count: number; percentage: number }>;
  topVods: Array<{ vodId: string; title: string; views: number }>;
  geoData: Array<{ country: string; code: string; count: number }>;
}

// Player embed
export interface TvPlayerEmbed {
  id: string;
  name: string;
  kind: "hls" | "iframe" | "smarttv" | "responsive";
  theme: "light" | "dark" | "auto";
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
  code: string;
  previewUrl?: string;
  createdAt: string;
}

// Credenciais de Ingest
export interface TvIngestCredentials {
  rtmpUrl: string;
  rtmpStreamKey: string;
  srtUrl?: string;
  srtStreamId?: string;
  backupRtmpUrl?: string;
  expiresAt?: string;
}

// Configurações gerais
export interface TvSettings {
  channelName: string;
  channelDescription?: string;
  channelLogo?: string;
  defaultQuality: "360p" | "480p" | "720p" | "1080p" | "auto";
  enableDVR: boolean;
  dvrWindowMinutes: number;
  enableChat: boolean;
  lowLatencyMode: boolean;
  transcodeProfiles: string[];
}

// Categoria de VOD
export interface TvVodCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  vodCount: number;
  createdAt: string;
}
