/**
 * Unified Campaign System Types
 * Central types for multi-channel advertising campaigns
 */

// Status and type enums
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type ChannelType = 'ads' | 'publidoor' | 'webstories';
export type AssetType = 'banner' | 'publidoor' | 'story_cover' | 'story_slide' | 'logo';
export type EventType = 'impression' | 'click' | 'cta_click' | 'story_open' | 'story_complete' | 'slide_view';

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

export type ChannelConfig = AdsChannelConfig | PublidoorChannelConfig | WebStoriesChannelConfig;

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
  
  // Assets
  assets: Omit<CampaignAsset, 'id' | 'campaign_id' | 'created_at'>[];
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

// Constants for channel display
export const CHANNEL_LABELS: Record<ChannelType, string> = {
  ads: 'Ads (Banners)',
  publidoor: 'Publidoor',
  webstories: 'WebStories',
};

export const CHANNEL_ICONS: Record<ChannelType, string> = {
  ads: 'Layout',
  publidoor: 'Megaphone',
  webstories: 'Smartphone',
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
