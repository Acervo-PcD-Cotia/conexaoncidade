// ============================================
// Módulo TV Web - Endpoints
// ============================================

export const TV_ENDPOINTS = {
  // Status
  LIVE_STATUS: "/live/status",
  LIVE_START: "/live/start",
  LIVE_STOP: "/live/stop",
  
  // Ingest
  INGEST_CREDENTIALS: "/ingest/credentials",
  INGEST_REVEAL_KEY: "/ingest/reveal-key",
  INGEST_REGENERATE: "/ingest/regenerate",
  
  // Schedule
  SCHEDULE: "/schedule",
  SCHEDULE_BY_ID: (id: string) => `/schedule/${id}`,
  SCHEDULE_WEEK: "/schedule/week",
  
  // VOD
  VODS: "/vod",
  VOD_BY_ID: (id: string) => `/vod/${id}`,
  VOD_CATEGORIES: "/vod/categories",
  
  // Uploads
  UPLOADS: "/uploads",
  UPLOAD_BY_ID: (id: string) => `/uploads/${id}`,
  UPLOAD_START: "/uploads/start",
  UPLOAD_CANCEL: (id: string) => `/uploads/${id}/cancel`,
  
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
