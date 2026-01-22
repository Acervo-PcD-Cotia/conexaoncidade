// Types for the White-Label Template System

export interface PortalTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  icon: string | null;
  preview_image: string | null;
  theme: TemplateTheme;
  default_modules: string[];
  vocabulary: VocabularyMap;
  initial_content: Record<string, unknown>;
  language_style: string | null;
  is_active: boolean;
  sort_order: number;
  home_sections: HomeSectionConfig[];
  created_at: string;
  updated_at: string;
}

export interface TemplateTheme {
  primary?: string;
  secondary?: string;
  accent?: string;
  layout?: 'news-grid' | 'worship-centered' | 'creator-hub' | 'corporate-clean';
  heroStyle?: 'headline-focus' | 'video-focus' | 'profile-focus' | 'banner-focus';
  typography?: 'editorial' | 'warm' | 'modern' | 'professional';
  [key: string]: string | undefined;
}

// Theme configuration for dynamic CSS variables
export interface ThemeConfig {
  primary?: string;
  secondary?: string;
  accent?: string;
  background?: string;
  foreground?: string;
  muted?: string;
  card?: string;
  border?: string;
  ring?: string;
  radius?: string;
  typography?: 'editorial' | 'warm' | 'modern' | 'professional' | 'corporate';
}

export interface SiteTemplateConfig {
  id: string;
  site_id: string;
  template_id: string | null;
  theme_overrides: Record<string, string>;
  vocabulary_overrides: VocabularyMap;
  modules_overrides: Record<string, boolean>;
  home_sections_overrides?: HomeSectionConfig[];
  branding: SiteBranding;
  radio_config: RadioConfig;
  tv_config: TVConfig;
  applied_at: string;
  created_at: string;
  updated_at: string;
}

export interface SiteBranding {
  logo?: {
    main?: string;
    icon?: string;
    white?: string;
  };
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  favicon?: string;
  seo?: {
    siteName?: string;
    defaultDescription?: string;
  };
}

export interface RadioConfig {
  stream_url?: string;
  name?: string;
  description?: string;
  enabled?: boolean;
  status_label?: string;
  fallback_message?: string;
  default_volume?: number;
}

export interface TVConfig {
  embed_url?: string;
  channel_id?: string;
  title?: string;
  enabled?: boolean;
  status_label?: string;
  cta_text?: string;
  cta_url?: string;
}

// ============================================
// HOME SECTIONS - Dynamic Home Page Structure
// ============================================

export type HomeSectionType = 
  | 'market_data'
  | 'super_banner'
  | 'video_block'
  | 'stories_bar'
  | 'ad_slot_top'
  | 'hero_headlines'
  | 'live_broadcast'
  | 'agora_na_cidade'
  | 'latest_news'
  | 'quick_notes'
  | 'most_read'
  | 'category_section'
  | 'radio_player'
  | 'tv_featured'
  | 'vod_library'
  | 'programs_grid'
  | 'social_embed'
  | 'newsletter_cta'
  | 'donations_cta'
  | 'members_cta';

export interface HomeSectionConfig {
  type: HomeSectionType;
  enabled: boolean;
  order: number;
  moduleKey?: ModuleKey;
  props?: Record<string, unknown>;
}

// ============================================
// VOCABULARY - Dynamic Labels/Translations
// ============================================

// Vocabulary keys that can be translated per template
export type VocabularyKey = 
  | 'home' | 'news' | 'radio' | 'tv' | 'lives' | 'programs' 
  | 'schedule' | 'podcast' | 'about' | 'contact' | 'search' 
  | 'latest' | 'featured' | 'breaking' | 'donate' | 'members'
  | 'exclusive' | 'internal' | 'opinion' | 'editorial' | 'devotional'
  | 'prayer' | 'events' | 'shop' | 'community' | 'reports' | 'training' | 'hr'
  // Navigation & UI
  | 'services' | 'admin' | 'dashboard' | 'webradiotv' | 'manage_news'
  // Service links
  | 'google_maps_cta' | 'fake_news' | 'school_transport' | 'pcd_census' 
  | 'civil_defense' | 'accessibility' | 'notifications'
  // Actions
  | 'login' | 'logout' | 'profile' | 'settings';

export type VocabularyMap = Partial<Record<VocabularyKey, string>>;

// Default vocabulary (Portuguese - Brazil)
export const DEFAULT_VOCABULARY: VocabularyMap = {
  // Navigation
  home: 'Início',
  news: 'Notícias',
  radio: 'Rádio',
  tv: 'WebTV',
  lives: 'Ao Vivo',
  programs: 'Programas',
  schedule: 'Agenda',
  podcast: 'Podcast',
  about: 'Sobre',
  contact: 'Contato',
  search: 'Buscar',
  
  // Content labels
  latest: 'Últimas',
  featured: 'Destaque',
  breaking: 'Urgente',
  donate: 'Contribua',
  members: 'Membros',
  exclusive: 'Exclusivo',
  internal: 'Interno',
  opinion: 'Opinião',
  editorial: 'Editorial',
  devotional: 'Devocional',
  prayer: 'Oração',
  events: 'Eventos',
  shop: 'Loja',
  community: 'Conexões',
  reports: 'Relatórios',
  training: 'Treinamentos',
  hr: 'RH',
  
  // UI & Navigation labels
  services: 'Serviços',
  admin: 'Administração',
  dashboard: 'Dashboard',
  webradiotv: 'WebRádioTV',
  manage_news: 'Cadastrar Notícia',
  
  // Service links (Header bar)
  google_maps_cta: 'Apareça no Google',
  fake_news: 'Fake News',
  school_transport: 'Transporte Escolar',
  pcd_census: 'Censo PcD',
  civil_defense: 'Defesa Civil',
  accessibility: 'Acessibilidade',
  notifications: 'Notificações',
  
  // Actions
  login: 'Entrar / Cadastrar',
  logout: 'Sair',
  profile: 'Perfil',
  settings: 'Configurações',
};

// ============================================
// MODULES - Feature Toggles
// ============================================

// Module keys that can be toggled on/off
export type ModuleKey = 
  | 'news_cms' | 'lives' | 'scheduling' | 'podcast' | 'audio_article'
  | 'headline_banner' | 'web_radio' | 'web_tv' | 'stories' | 'push'
  | 'schedule' | 'donations' | 'vod' | 'members' | 'chat'
  | 'exclusive_content' | 'monetization' | 'webinars' | 'internal_content'
  | 'reports' | 'player';

// Core modules that are always enabled
export const CORE_MODULES: ModuleKey[] = [
  'news_cms',
  'player',
];

// Module metadata for UI
export const MODULE_METADATA: Record<ModuleKey, { label: string; description: string; icon: string }> = {
  news_cms: { label: 'CMS de Notícias', description: 'Sistema de gestão de conteúdo', icon: 'Newspaper' },
  lives: { label: 'Lives', description: 'Transmissões ao vivo', icon: 'Radio' },
  scheduling: { label: 'Agendamento', description: 'Agendar publicações e transmissões', icon: 'Calendar' },
  podcast: { label: 'Podcast', description: 'Publicar e gerenciar podcasts', icon: 'Podcast' },
  audio_article: { label: 'Áudio da Matéria', description: 'Converter notícias em áudio', icon: 'Volume2' },
  headline_banner: { label: 'Banner de Manchetes', description: 'Ticker de notícias em destaque', icon: 'Flag' },
  web_radio: { label: 'Web Rádio', description: 'Transmissão de rádio 24h', icon: 'Radio' },
  web_tv: { label: 'Web TV', description: 'Canal de TV online', icon: 'Tv' },
  stories: { label: 'Stories', description: 'Conteúdo efêmero estilo stories', icon: 'Circle' },
  push: { label: 'Push Notifications', description: 'Notificações push para usuários', icon: 'Bell' },
  schedule: { label: 'Agenda/Programação', description: 'Grade de programação', icon: 'CalendarDays' },
  donations: { label: 'Doações', description: 'Receber contribuições online', icon: 'Heart' },
  vod: { label: 'VOD', description: 'Vídeos on demand (gravados)', icon: 'Film' },
  members: { label: 'Área de Membros', description: 'Conteúdo exclusivo para membros', icon: 'Users' },
  chat: { label: 'Chat', description: 'Chat em tempo real', icon: 'MessageSquare' },
  exclusive_content: { label: 'Conteúdo Exclusivo', description: 'Conteúdo pago/premium', icon: 'Lock' },
  monetization: { label: 'Monetização', description: 'Ferramentas de monetização', icon: 'DollarSign' },
  webinars: { label: 'Webinars', description: 'Eventos online ao vivo', icon: 'Video' },
  internal_content: { label: 'Conteúdo Interno', description: 'Conteúdo restrito a equipe', icon: 'Shield' },
  reports: { label: 'Relatórios', description: 'Relatórios e analytics', icon: 'BarChart3' },
  player: { label: 'Player Unificado', description: 'Player de áudio/vídeo', icon: 'Play' },
};

// ============================================
// ROUTE MODULE MAPPING
// ============================================

// Maps public routes to their required modules
export const ROUTE_MODULE_MAP: Record<string, ModuleKey> = {
  '/ao-vivo': 'lives',
  '/radio': 'web_radio',
  '/tv': 'web_tv',
  '/podcast': 'podcast',
  '/podcasts': 'podcast',
  '/membros': 'members',
  '/members': 'members',
  '/contribua': 'donations',
  '/doacoes': 'donations',
  '/vod': 'vod',
  '/videos': 'vod',
};
