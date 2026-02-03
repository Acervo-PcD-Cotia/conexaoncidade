// PostSocial Module Types - Complete Social Media Automation

export const SOCIAL_PLATFORMS = [
  'instagram',
  'facebook',
  'x',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'whatsapp',
  'telegram',
] as const;

export type SocialPlatform = typeof SOCIAL_PLATFORMS[number];

export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  x: 'X (Twitter)',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  pinterest: 'Pinterest',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
};

export const PLATFORM_ICONS: Record<SocialPlatform, string> = {
  instagram: '📷',
  facebook: '📘',
  x: '𝕏',
  linkedin: '💼',
  tiktok: '🎵',
  youtube: '▶️',
  pinterest: '📌',
  whatsapp: '💬',
  telegram: '✈️',
};

export const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E4405F',
  facebook: '#1877F2',
  x: '#000000',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  youtube: '#FF0000',
  pinterest: '#E60023',
  whatsapp: '#25D366',
  telegram: '#26A5E4',
};

export type SocialAccountType = 'page' | 'business' | 'creator' | 'channel' | 'personal';

export type SocialPostStatus = 'draft' | 'scheduled' | 'processing' | 'done' | 'failed';

export type SocialTargetStatus = 'draft' | 'scheduled' | 'queued' | 'processing' | 'done' | 'failed' | 'assisted';

export type SocialOriginType = 'news' | 'ad' | 'publidoor' | 'campaign360' | 'manual';

export const ORIGIN_TYPE_LABELS: Record<SocialOriginType, string> = {
  news: 'Notícia',
  ad: 'Anúncio',
  publidoor: 'Publidoor',
  campaign360: 'Campanha 360',
  manual: 'Manual',
};

export const STATUS_LABELS: Record<SocialTargetStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  queued: 'Na Fila',
  processing: 'Publicando',
  done: 'Publicado',
  failed: 'Falhou',
  assisted: 'Assistido',
};

export const STATUS_COLORS: Record<SocialTargetStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  queued: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  done: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  assisted: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
};

// Database Row Types
export interface SocialAccount {
  id: string;
  user_id: string;
  platform: SocialPlatform;
  display_name: string;
  username: string | null;
  account_type: SocialAccountType;
  provider_account_id: string | null;
  token_ref: string | null;
  token_expires_at: string | null;
  is_active: boolean;
  default_enabled: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SocialMediaItem {
  url: string;
  type: 'image' | 'video';
  alt?: string;
}

export interface SocialPost {
  id: string;
  user_id: string;
  origin_type: SocialOriginType;
  origin_id: string | null;
  title: string;
  base_caption: string | null;
  link_url: string | null;
  media_json: SocialMediaItem[];
  status_global: SocialPostStatus;
  template_id: string | null;
  hashtags: string[] | null;
  utm_params: Record<string, string>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  targets?: SocialPostTarget[];
}

export interface SocialPostTarget {
  id: string;
  post_id: string;
  social_account_id: string;
  caption_override: string | null;
  media_override: SocialMediaItem[] | null;
  scheduled_at: string | null;
  status: SocialTargetStatus;
  provider_post_id: string | null;
  provider_post_url: string | null;
  attempts: number;
  max_attempts: number;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  error_message: string | null;
  assisted_at: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  social_account?: SocialAccount;
  post?: SocialPost;
}

export interface SocialPostLog {
  id: string;
  target_id: string;
  event: string;
  level: 'info' | 'warn' | 'error';
  message: string | null;
  payload_json: Record<string, unknown>;
  created_at: string;
}

export interface SocialTemplate {
  id: string;
  user_id: string;
  name: string;
  origin_type: SocialOriginType;
  caption_template: string;
  hashtags: string[] | null;
  platforms: SocialPlatform[] | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// Input types for mutations
export interface CreateSocialPostInput {
  origin_type?: SocialOriginType;
  origin_id?: string;
  title: string;
  base_caption?: string;
  link_url?: string;
  media_json?: SocialMediaItem[];
  hashtags?: string[];
  utm_params?: Record<string, string>;
  template_id?: string;
  targets: {
    social_account_id: string;
    caption_override?: string;
    scheduled_at?: string;
  }[];
}

export interface UpdateSocialPostInput {
  id: string;
  title?: string;
  base_caption?: string;
  link_url?: string;
  media_json?: SocialMediaItem[];
  hashtags?: string[];
}

export interface CreateSocialAccountInput {
  platform: SocialPlatform;
  display_name: string;
  username?: string;
  account_type?: SocialAccountType;
  provider_account_id?: string;
  default_enabled?: boolean;
  settings?: Record<string, unknown>;
}

// Filter types
export interface PostSocialFilters {
  status?: SocialTargetStatus | 'all';
  platform?: SocialPlatform | 'all';
  origin_type?: SocialOriginType | 'all';
  dateRange?: {
    from: Date;
    to: Date;
  };
  search?: string;
}

// Stats types
export interface PostSocialStats {
  total_posts: number;
  posts_today: number;
  scheduled: number;
  in_queue: number;
  posted: number;
  failed: number;
  assisted: number;
  by_platform: Record<SocialPlatform, number>;
}

// Utility functions
export function isPlatform(value: unknown): value is SocialPlatform {
  return typeof value === 'string' && SOCIAL_PLATFORMS.includes(value as SocialPlatform);
}

export function getPlatformUrl(platform: SocialPlatform): string {
  const urls: Record<SocialPlatform, string> = {
    instagram: 'https://instagram.com',
    facebook: 'https://facebook.com',
    x: 'https://x.com',
    linkedin: 'https://linkedin.com',
    tiktok: 'https://tiktok.com',
    youtube: 'https://youtube.com',
    pinterest: 'https://pinterest.com',
    whatsapp: 'https://web.whatsapp.com',
    telegram: 'https://web.telegram.org',
  };
  return urls[platform];
}

export function canAutoPost(platform: SocialPlatform): boolean {
  // Platforms that support API posting
  const autoPostable: SocialPlatform[] = ['facebook', 'linkedin', 'x', 'pinterest', 'telegram'];
  return autoPostable.includes(platform);
}

export function requiresAssistedMode(platform: SocialPlatform): boolean {
  // Platforms that always need manual/assisted posting
  const assistedOnly: SocialPlatform[] = ['instagram', 'tiktok', 'youtube', 'whatsapp'];
  return assistedOnly.includes(platform);
}
