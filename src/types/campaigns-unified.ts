/**
 * Unified Campaign System Types
 * Central types for multi-channel advertising campaigns (360 System)
 */

// Status and type enums
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type ChannelType = 'ads' | 'publidoor' | 'webstories' | 'push' | 'newsletter' | 'exit_intent' | 'login_panel';
export type AssetType = 'banner' | 'publidoor' | 'story_cover' | 'story_slide' | 'logo';
export type EventType = 
  | 'impression' | 'click' | 'cta_click' 
  | 'story_open' | 'story_complete' | 'slide_view'
  | 'push_sent' | 'push_delivered' 
  | 'newsletter_sent' | 'newsletter_open';
export type CycleStatus = 'scheduled' | 'active' | 'completed' | 'cancelled';

// Channel-specific configurations
export interface AdsChannelConfig {
  slot_type: string;
  size: string;
  sort_order: number;
  link_target: string;
}

export interface PublidoorChannelConfig {
  location_id?: string;
  type: 'narrativo' | 'contextual' | 'geografico' | 'editorial' | 'impacto_total';
  phrase_1: string;
  phrase_2?: string;
  phrase_3?: string;
  template_id?: string;
}

export interface WebStoriesChannelConfig {
  story_type: 'external' | 'native';
  story_url?: string;
  story_id?: string;
}

export interface PushChannelConfig {
  title: string;
  body: string;
  icon_url?: string;
  action_url: string;
  send_at?: string;
  target_audience: 'all' | 'subscribers' | 'segment';
  segment_id?: string;
}

export interface NewsletterChannelConfig {
  subject: string;
  preview_text: string;
  template_id?: string;
  send_at?: string;
  target_list: string;
}

export interface ExitIntentChannelConfig {
  hero_type: 'publidoor' | 'banner';
  hero_asset_id?: string;
  secondary_1_asset_id?: string;
  secondary_2_asset_id?: string;
  cta_text: string;
  priority_type: 'institutional' | 'editorial' | 'commercial';
}

export interface LoginPanelChannelConfig {
  display_type: 'publidoor' | 'story';
  asset_id?: string;
  short_text?: string;
  cta_text?: string;
  cta_url?: string;
}

export type ChannelConfig = 
  | AdsChannelConfig 
  | PublidoorChannelConfig 
  | WebStoriesChannelConfig
  | PushChannelConfig
  | NewsletterChannelConfig
  | ExitIntentChannelConfig
  | LoginPanelChannelConfig;

// Campaign Cycle for distribution rounds
export interface CampaignCycle {
  id: string;
  campaign_id: string;
  name: string;
  starts_at?: string;
  ends_at?: string;
  active_channels: ChannelType[];
  status: CycleStatus;
  requires_confirmation: boolean;
  confirmed_at?: string;
  confirmed_by?: string;
  created_at: string;
  updated_at: string;
}

// Main entities
export interface CampaignUnified {
  id: string;
  tenant_id?: string;
  name: string;
  advertiser: string;
  description?: string;
  status: CampaignStatus;
  starts_at?: string;
  ends_at?: string;
  priority: number;
  cta_text?: string;
  cta_url?: string;
  frequency_cap_per_day: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
  
  // Joined data
  channels?: CampaignChannel[];
  assets?: CampaignAsset[];
  cycles?: CampaignCycle[];
}

export interface CampaignChannel {
  id: string;
  campaign_id: string;
  channel_type: ChannelType;
  enabled: boolean;
  config: ChannelConfig;
  created_at: string;
  updated_at: string;
}

export interface CampaignAsset {
  id: string;
  campaign_id: string;
  asset_type: AssetType;
  file_url: string;
  width?: number;
  height?: number;
  alt_text?: string;
  channel_type?: ChannelType;
  format_key?: string;
  created_at: string;
  // Derived asset fields
  is_original?: boolean;
  derived_from?: string;
  upscale_percent?: number;
  auto_corrected?: boolean;
}

export interface CampaignEvent {
  id: string;
  campaign_id: string;
  channel_type: ChannelType;
  event_type: EventType;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Form types for creating/updating
export interface CampaignFormData {
  name: string;
  advertiser: string;
  description?: string;
  status: CampaignStatus;
  starts_at?: string;
  ends_at?: string;
  priority: number;
  cta_text?: string;
  cta_url?: string;
  frequency_cap_per_day: number;
  
  // Channel selections
  enabledChannels: ChannelType[];
  adsConfig?: Partial<AdsChannelConfig>;
  publidoorConfig?: Partial<PublidoorChannelConfig>;
  webstoriesConfig?: Partial<WebStoriesChannelConfig>;
  pushConfig?: Partial<PushChannelConfig>;
  newsletterConfig?: Partial<NewsletterChannelConfig>;
  exitIntentConfig?: Partial<ExitIntentChannelConfig>;
  loginPanelConfig?: Partial<LoginPanelChannelConfig>;
  
  // Assets
  assets: Omit<CampaignAsset, 'id' | 'campaign_id' | 'created_at'>[];
}

export interface CycleFormData {
  name: string;
  starts_at?: string;
  ends_at?: string;
  active_channels: ChannelType[];
}

// Metrics types
export interface CampaignMetrics {
  campaign_id: string;
  total_impressions: number;
  total_clicks: number;
  total_cta_clicks: number;
  ctr: number;
  by_channel: {
    channel_type: ChannelType;
    impressions: number;
    clicks: number;
    ctr: number;
  }[];
  by_device: {
    device: string;
    impressions: number;
    clicks: number;
  }[];
  by_cycle?: Record<string, {
    cycle_name: string;
    impressions: number;
    clicks: number;
    push_sent: number;
    newsletter_sent: number;
  }>;
  push_metrics?: {
    total_sent: number;
    total_delivered: number;
  };
  newsletter_metrics?: {
    total_sent: number;
    total_opens: number;
    open_rate: number;
  };
}

// Filter types
export interface CampaignFilters {
  status?: CampaignStatus | CampaignStatus[];
  channel?: ChannelType | ChannelType[];
  advertiser?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

// Official slot dimensions
export const OFFICIAL_SLOTS = {
  ads: [
    { key: '728x90', label: 'Leaderboard', width: 728, height: 90 },
    { key: '970x250', label: 'Super Banner', width: 970, height: 250 },
    { key: '300x250', label: 'Retângulo Médio', width: 300, height: 250 },
    { key: '300x600', label: 'Arranha-céu', width: 300, height: 600 },
    { key: '580x400', label: 'Pop-up', width: 580, height: 400 },
  ],
  publidoor: [
    { key: '970x250', label: 'Banner Grande', width: 970, height: 250 },
    { key: '300x250', label: 'Retângulo', width: 300, height: 250 },
    { key: '300x600', label: 'Vertical', width: 300, height: 600 },
  ],
  webstories: [
    { key: '1080x1920', label: 'Capa Story', width: 1080, height: 1920 },
  ],
} as const;

export type SlotKey = typeof OFFICIAL_SLOTS[keyof typeof OFFICIAL_SLOTS][number]['key'];

// Constants for channel display
export const CHANNEL_LABELS: Record<ChannelType, string> = {
  ads: 'Ads (Banners)',
  publidoor: 'Publidoor',
  webstories: 'WebStories',
  push: 'Push Notification',
  newsletter: 'Newsletter',
  exit_intent: 'Exit-Intent Modal',
  login_panel: 'Painel de Login',
};

export const CHANNEL_ICONS: Record<ChannelType, string> = {
  ads: 'Layout',
  publidoor: 'Megaphone',
  webstories: 'Smartphone',
  push: 'Bell',
  newsletter: 'Mail',
  exit_intent: 'DoorOpen',
  login_panel: 'LogIn',
};

export const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  paused: 'Pausada',
  ended: 'Encerrada',
};

export const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  paused: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  ended: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
};

export const CYCLE_STATUS_LABELS: Record<CycleStatus, string> = {
  scheduled: 'Agendado',
  active: 'Ativo',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const CYCLE_STATUS_COLORS: Record<CycleStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

// Channels that require confirmation before sending
export const CHANNELS_REQUIRING_CONFIRMATION: ChannelType[] = ['push', 'newsletter'];
