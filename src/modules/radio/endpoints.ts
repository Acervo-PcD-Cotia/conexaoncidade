// ============================================
// Módulo Rádio Web - Endpoints
// ============================================

export const RADIO_ENDPOINTS = {
  // Status
  STATUS: "/status",
  
  // Encoder
  ENCODER_CONFIG: "/encoder/config",
  ENCODER_REVEAL_PASSWORD: "/encoder/reveal-password",
  
  // AutoDJ
  AUTODJ_STATUS: "/autodj/status",
  AUTODJ_TOGGLE: "/autodj/toggle",
  PLAYLISTS: "/playlists",
  PLAYLIST_BY_ID: (id: string) => `/playlists/${id}`,
  PLAYLIST_TRACKS: (id: string) => `/playlists/${id}/tracks`,
  
  // Library
  TRACKS: "/library/tracks",
  TRACK_BY_ID: (id: string) => `/library/tracks/${id}`,
  TRACK_UPLOAD: "/library/upload",
  
  // Stats
  STATS: "/stats",
  STATS_REALTIME: "/stats/realtime",
  
  // Players
  PLAYERS: "/players",
  PLAYER_BY_ID: (id: string) => `/players/${id}`,
  PLAYER_GENERATE: "/players/generate",
  
  // Settings
  SETTINGS: "/settings",
} as const;
