// =============================================
// PUBLIDOOR - TypeScript Types
// =============================================

export type PublidoorItemType = 'narrativo' | 'contextual' | 'geografico' | 'editorial' | 'impacto_total';
export type PublidoorItemStatus = 'draft' | 'review' | 'approved' | 'published';
export type PublidoorCampaignStatus = 'draft' | 'active' | 'paused' | 'ended';
export type PublidoorScheduleType = 'specific_dates' | 'weekdays' | 'time_range' | 'business_hours' | 'weekends' | 'holidays';
export type PublidoorDeviceTarget = 'all' | 'desktop' | 'mobile';
export type PublidoorApprovalAction = 'submitted' | 'approved' | 'rejected' | 'revision_requested';

export interface PublidoorColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

export interface PublidoorAdvertiser {
  id: string;
  tenant_id?: string | null;
  user_id?: string | null; // Linked auth user (for partner access)
  company_name: string;
  neighborhood?: string | null;
  city?: string | null;
  category?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  google_maps_url?: string | null;
  logo_url?: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PublidoorTemplate {
  id: string;
  tenant_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  font_family: string;
  font_size: string;
  color_palette: PublidoorColorPalette;
  has_animations: boolean;
  preview_url?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PublidoorLocation {
  id: string;
  tenant_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  max_items: number;
  allows_rotation: boolean;
  device_target: PublidoorDeviceTarget;
  is_premium: boolean;
  is_active: boolean;
  created_at: string;
}

export interface PublidoorCampaign {
  id: string;
  tenant_id?: string | null;
  name: string;
  theme?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  priority: number;
  is_exclusive: boolean;
  status: PublidoorCampaignStatus;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublidoorItem {
  id: string;
  tenant_id?: string | null;
  internal_name: string;
  type: PublidoorItemType;
  advertiser_id?: string | null;
  category_id?: string | null;
  phrase_1: string;
  phrase_2?: string | null;
  phrase_3?: string | null;
  media_url?: string | null;
  media_type: 'image' | 'video';
  logo_url?: string | null;
  cta_text: string;
  cta_link?: string | null;
  status: PublidoorItemStatus;
  campaign_id?: string | null;
  template_id?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  // Joined relations
  advertiser?: PublidoorAdvertiser | null;
  campaign?: PublidoorCampaign | null;
  template?: PublidoorTemplate | null;
  locations?: PublidoorLocationAssignment[];
}

export interface PublidoorLocationAssignment {
  id: string;
  publidoor_id: string;
  location_id: string;
  is_exclusive: boolean;
  sort_order: number;
  created_at: string;
  // Joined relation
  location?: PublidoorLocation | null;
}

export interface PublidoorSchedule {
  id: string;
  publidoor_id: string;
  schedule_type: PublidoorScheduleType;
  days_of_week: number[];
  time_start?: string | null;
  time_end?: string | null;
  specific_dates: string[];
  is_active: boolean;
  created_at: string;
}

export interface PublidoorMetric {
  id: string;
  publidoor_id: string;
  date: string;
  impressions: number;
  clicks: number;
  device?: 'desktop' | 'mobile' | 'tablet' | null;
  avg_time_on_screen: number;
  created_at: string;
}

export interface PublidoorApproval {
  id: string;
  publidoor_id: string;
  reviewer_id?: string | null;
  action: PublidoorApprovalAction;
  comment?: string | null;
  created_at: string;
}

export interface PublidoorSetting {
  id: string;
  tenant_id?: string | null;
  key: string;
  value: unknown;
  description?: string | null;
  created_at: string;
  updated_at: string;
}

// Form types
export interface PublidoorItemFormData {
  internal_name: string;
  type: PublidoorItemType;
  advertiser_id?: string | null;
  category_id?: string | null;
  phrase_1: string;
  phrase_2?: string | null;
  phrase_3?: string | null;
  media_url?: string | null;
  media_type: 'image' | 'video';
  logo_url?: string | null;
  cta_text: string;
  cta_link?: string | null;
  campaign_id?: string | null;
  template_id?: string | null;
}

export interface PublidoorCampaignFormData {
  name: string;
  theme?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  priority: number;
  is_exclusive: boolean;
}

export interface PublidoorAdvertiserFormData {
  company_name: string;
  neighborhood?: string | null;
  city?: string | null;
  category?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  google_maps_url?: string | null;
  logo_url?: string | null;
}

// Dashboard stats
export interface PublidoorDashboardStats {
  activeCount: number;
  scheduledCount: number;
  availableSpaces: number;
  activeCampaigns: number;
  totalImpressions: number;
  totalClicks: number;
  ctr: number;
  estimatedRevenue: number;
}

// Type labels for UI
export const PUBLIDOOR_TYPE_LABELS: Record<PublidoorItemType, string> = {
  narrativo: 'Narrativo',
  contextual: 'Contextual',
  geografico: 'Geográfico',
  editorial: 'Editorial',
  impacto_total: 'Impacto Total',
};

export const PUBLIDOOR_STATUS_LABELS: Record<PublidoorItemStatus, string> = {
  draft: 'Rascunho',
  review: 'Em Análise',
  approved: 'Aprovado',
  published: 'Publicado',
};

export const PUBLIDOOR_CAMPAIGN_STATUS_LABELS: Record<PublidoorCampaignStatus, string> = {
  draft: 'Rascunho',
  active: 'Ativa',
  paused: 'Pausada',
  ended: 'Encerrada',
};

export const PUBLIDOOR_SCHEDULE_TYPE_LABELS: Record<PublidoorScheduleType, string> = {
  specific_dates: 'Datas Específicas',
  weekdays: 'Dias da Semana',
  time_range: 'Faixa de Horário',
  business_hours: 'Horário Comercial',
  weekends: 'Finais de Semana',
  holidays: 'Feriados',
};
