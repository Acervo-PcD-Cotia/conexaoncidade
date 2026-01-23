// ============================================
// Módulo Rádio Web - Mock Server
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
} from "./types";

// Dados mock coerentes
const mockStatus: RadioStreamStatus = {
  state: "offline",
  listenersNow: 0,
  peakToday: 0,
  bitrateKbps: 128,
  mount: "/live",
  updatedAt: new Date().toISOString(),
};

const mockEncoderConfig: RadioEncoderConfig = {
  server: "stream.suaradio.com.br",
  port: 8000,
  passwordMasked: "••••••••••••",
  protocol: "icecast",
  mount: "/live",
  bitrate: 128,
  format: "mp3",
};

const mockPlaylists: RadioPlaylist[] = [
  {
    id: "pl-1",
    name: "Programação Diurna",
    description: "Músicas para o período da manhã e tarde",
    schedule: {
      days: [1, 2, 3, 4, 5],
      startTime: "06:00",
      endTime: "18:00",
    },
    rules: {
      noRepeatArtistMins: 60,
      noRepeatTrackMins: 180,
      shuffle: true,
    },
    trackCount: 150,
    enabled: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T15:30:00Z",
  },
  {
    id: "pl-2",
    name: "Programação Noturna",
    description: "Músicas mais calmas para a noite",
    schedule: {
      days: [0, 1, 2, 3, 4, 5, 6],
      startTime: "18:00",
      endTime: "06:00",
    },
    rules: {
      noRepeatArtistMins: 90,
      noRepeatTrackMins: 240,
      shuffle: true,
    },
    trackCount: 80,
    enabled: true,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z",
  },
];

const mockTracks: RadioTrack[] = [
  {
    id: "track-1",
    title: "Aquarela",
    artist: "Toquinho",
    album: "Aquarela",
    genre: "MPB",
    durationSec: 234,
    bpm: 120,
    uploadedAt: "2024-01-10T08:00:00Z",
    playCount: 45,
    lastPlayedAt: "2024-01-20T14:30:00Z",
  },
  {
    id: "track-2",
    title: "Garota de Ipanema",
    artist: "Tom Jobim",
    album: "Bossa Nova",
    genre: "Bossa Nova",
    durationSec: 312,
    bpm: 140,
    uploadedAt: "2024-01-10T08:00:00Z",
    playCount: 38,
    lastPlayedAt: "2024-01-20T12:15:00Z",
  },
  {
    id: "track-3",
    title: "Construção",
    artist: "Chico Buarque",
    album: "Construção",
    genre: "MPB",
    durationSec: 378,
    bpm: 95,
    uploadedAt: "2024-01-12T10:00:00Z",
    playCount: 22,
    lastPlayedAt: "2024-01-19T18:45:00Z",
  },
];

const mockStats: RadioStats = {
  summary: {
    totalListeners: 1250,
    peakListeners: 89,
    avgSessionMinutes: 12,
    totalHoursStreamed: 720,
  },
  timeseries: Array.from({ length: 24 }, (_, i) => ({
    ts: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
    listeners: Math.floor(Math.random() * 50) + 10,
  })),
  topCountries: [
    { country: "Brasil", code: "BR", count: 1100 },
    { country: "Portugal", code: "PT", count: 85 },
    { country: "Estados Unidos", code: "US", count: 45 },
    { country: "Argentina", code: "AR", count: 20 },
  ],
  devices: [
    { device: "Desktop", count: 600, percentage: 48 },
    { device: "Mobile", count: 500, percentage: 40 },
    { device: "Tablet", count: 100, percentage: 8 },
    { device: "Smart Speaker", count: 50, percentage: 4 },
  ],
  topTracks: [
    { trackId: "track-1", title: "Aquarela", artist: "Toquinho", plays: 45 },
    { trackId: "track-2", title: "Garota de Ipanema", artist: "Tom Jobim", plays: 38 },
    { trackId: "track-3", title: "Construção", artist: "Chico Buarque", plays: 22 },
  ],
};

const mockPlayers: RadioPlayerEmbed[] = [
  {
    id: "player-1",
    name: "Player Barra",
    kind: "bar",
    theme: "dark",
    primaryColor: "#3b82f6",
    code: '<iframe src="https://player.radio/bar/abc123" width="100%" height="60"></iframe>',
    previewUrl: "https://player.radio/preview/bar/abc123",
    createdAt: "2024-01-15T10:00:00Z",
  },
  {
    id: "player-2",
    name: "Player Popup",
    kind: "popup",
    theme: "light",
    primaryColor: "#10b981",
    code: '<script src="https://player.radio/popup/def456.js"></script>',
    previewUrl: "https://player.radio/preview/popup/def456",
    createdAt: "2024-01-16T14:00:00Z",
  },
];

const mockAutoDJStatus: RadioAutoDJStatus = {
  enabled: false,
  currentTrack: undefined,
  nextTrack: undefined,
  activePlaylist: undefined,
};

const mockSettings: RadioSettings = {
  stationName: "Rádio Conexão",
  stationDescription: "A melhor programação musical da cidade",
  stationGenre: "MPB / Pop",
  stationWebsite: "https://conexaonacidade.com.br",
  maxBitrate: 320,
  enableAutoDJ: true,
  fallbackEnabled: true,
  fallbackPlaylistId: "pl-1",
};

// Simula latência de rede
const delay = (ms: number = 300) => new Promise((r) => setTimeout(r, ms));

// Router mock
export const mockRadioServer = {
  handle: async <T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    await delay(Math.random() * 200 + 100);

    const method = options?.method || "GET";

    // Status
    if (endpoint === "/status") {
      return mockStatus as T;
    }

    // Encoder
    if (endpoint === "/encoder/config") {
      return mockEncoderConfig as T;
    }
    if (endpoint === "/encoder/reveal-password" && method === "POST") {
      return { password: "minha-senha-secreta-123" } as T;
    }

    // AutoDJ
    if (endpoint === "/autodj/status") {
      return mockAutoDJStatus as T;
    }
    if (endpoint === "/autodj/toggle" && method === "POST") {
      mockAutoDJStatus.enabled = !mockAutoDJStatus.enabled;
      return mockAutoDJStatus as T;
    }

    // Playlists
    if (endpoint === "/playlists") {
      return mockPlaylists as T;
    }
    if (endpoint.startsWith("/playlists/") && !endpoint.includes("/tracks")) {
      const id = endpoint.split("/")[2];
      const playlist = mockPlaylists.find((p) => p.id === id);
      if (playlist) return playlist as T;
      throw new Error("Playlist não encontrada");
    }

    // Library
    if (endpoint === "/library/tracks") {
      return { items: mockTracks, total: mockTracks.length } as T;
    }

    // Stats
    if (endpoint === "/stats") {
      return mockStats as T;
    }

    // Players
    if (endpoint === "/players") {
      return mockPlayers as T;
    }
    if (endpoint === "/players/generate" && method === "POST") {
      const body = JSON.parse(options?.body as string || "{}");
      const newPlayer: RadioPlayerEmbed = {
        id: `player-${Date.now()}`,
        name: body.name || "Novo Player",
        kind: body.kind || "bar",
        theme: body.theme || "dark",
        primaryColor: body.primaryColor || "#3b82f6",
        code: `<iframe src="https://player.radio/${body.kind}/${Date.now()}" width="100%" height="60"></iframe>`,
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
