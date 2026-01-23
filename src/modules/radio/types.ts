// ============================================
// Módulo Rádio Web - Types (API-first, isolado)
// ============================================

// Status do streaming
export interface RadioStreamStatus {
  state: "online" | "offline" | "starting" | "error";
  listenersNow: number;
  peakToday: number;
  bitrateKbps: number;
  mount: string;
  updatedAt: string;
}

// Configuração do encoder
export interface RadioEncoderConfig {
  server: string;
  port: number;
  passwordMasked: string;
  protocol: "shoutcast" | "icecast";
  mount: string;
  bitrate: number;
  format: "mp3" | "aac" | "ogg";
}

// Playlist/Scheduler do AutoDJ
export interface RadioPlaylist {
  id: string;
  name: string;
  description?: string;
  schedule: {
    days: number[]; // 0-6 (domingo-sábado)
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  };
  rules: {
    noRepeatArtistMins: number;
    noRepeatTrackMins: number;
    shuffle: boolean;
  };
  trackCount: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

// Track da biblioteca
export interface RadioTrack {
  id: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  durationSec: number;
  fileUrl?: string;
  fileSize?: number;
  bpm?: number;
  uploadedAt: string;
  playCount: number;
  lastPlayedAt?: string;
}

// Estatísticas
export interface RadioStats {
  summary: {
    totalListeners: number;
    peakListeners: number;
    avgSessionMinutes: number;
    totalHoursStreamed: number;
  };
  timeseries: Array<{ ts: string; listeners: number }>;
  topCountries: Array<{ country: string; code: string; count: number }>;
  devices: Array<{ device: string; count: number; percentage: number }>;
  topTracks: Array<{ trackId: string; title: string; artist: string; plays: number }>;
}

// Player embed
export interface RadioPlayerEmbed {
  id: string;
  name: string;
  kind: "bar" | "popup" | "floating" | "html5" | "minimal";
  theme: "light" | "dark" | "auto";
  primaryColor?: string;
  code: string;
  previewUrl?: string;
  createdAt: string;
}

// AutoDJ Status
export interface RadioAutoDJStatus {
  enabled: boolean;
  currentTrack?: {
    id: string;
    title: string;
    artist: string;
    elapsedSec: number;
    durationSec: number;
  };
  nextTrack?: {
    id: string;
    title: string;
    artist: string;
  };
  activePlaylist?: {
    id: string;
    name: string;
  };
}

// Upload de track
export interface RadioTrackUpload {
  id: string;
  filename: string;
  status: "queued" | "processing" | "done" | "error";
  progressPct: number;
  errorMessage?: string;
  track?: RadioTrack;
}

// Configurações gerais
export interface RadioSettings {
  stationName: string;
  stationDescription?: string;
  stationGenre?: string;
  stationWebsite?: string;
  stationLogo?: string;
  maxBitrate: number;
  enableAutoDJ: boolean;
  fallbackEnabled: boolean;
  fallbackPlaylistId?: string;
}
