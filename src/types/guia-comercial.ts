/**
 * Guia Comercial - Complete Type Definitions
 * Business directory module with SEO focus
 */

// ========================
// ENUMS
// ========================

export type BusinessPlan = 'free' | 'pro' | 'premium';
export type LeadStatus = 'new' | 'contacted' | 'converted' | 'lost';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export const PLAN_LABELS: Record<BusinessPlan, string> = {
  free: 'Gratuito',
  pro: 'Profissional',
  premium: 'Premium',
};

export const PLAN_COLORS: Record<BusinessPlan, string> = {
  free: 'bg-muted text-muted-foreground',
  pro: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  premium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'Novo',
  contacted: 'Contatado',
  converted: 'Convertido',
  lost: 'Perdido',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  converted: 'bg-green-100 text-green-800',
  lost: 'bg-red-100 text-red-800',
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, string> = {
  pending: 'Pendente',
  verified: 'Verificado',
  rejected: 'Rejeitado',
};

// ========================
// MAIN INTERFACES
// ========================

export interface OpeningHours {
  monday?: { open: string; close: string; closed?: boolean };
  tuesday?: { open: string; close: string; closed?: boolean };
  wednesday?: { open: string; close: string; closed?: boolean };
  thursday?: { open: string; close: string; closed?: boolean };
  friday?: { open: string; close: string; closed?: boolean };
  saturday?: { open: string; close: string; closed?: boolean };
  sunday?: { open: string; close: string; closed?: boolean };
}

export interface Business {
  id: string;
  user_id: string | null;
  tenant_id: string | null;
  
  // Basic info
  name: string;
  slug: string;
  tagline: string | null;
  description_short: string | null;
  description_full: string | null;
  
  // Categories
  category_main: string;
  categories_secondary: string[];
  
  // Location
  city: string;
  state: string;
  neighborhoods: string[];
  address: string | null;
  address_complement: string | null;
  cep: string | null;
  latitude: number | null;
  longitude: number | null;
  service_radius_km: number;
  
  // Contact
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  google_maps_url: string | null;
  
  // Media
  logo_url: string | null;
  cover_url: string | null;
  gallery_urls: string[];
  video_url: string | null;
  
  // Business details
  opening_hours: OpeningHours;
  payment_methods: string[];
  amenities: string[];
  tags: string[];
  
  // Verification & Plan
  plan: BusinessPlan;
  plan_expires_at: string | null;
  verification_status: VerificationStatus;
  verified_at: string | null;
  
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  
  // Stats
  views_count: number;
  whatsapp_clicks: number;
  phone_clicks: number;
  website_clicks: number;
  leads_count: number;
  
  // Ratings
  avg_rating: number;
  review_count: number;
  
  // Status
  is_active: boolean;
  is_featured: boolean;
  featured_until: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;

  // Joined data
  category?: BusinessCategory;
  services?: BusinessService[];
  promotions?: BusinessPromotion[];
  reviews?: BusinessReview[];
}

export interface BusinessCategory {
  id: string;
  tenant_id: string | null;
  name: string;
  slug: string;
  icon: string | null;
  color: string | null;
  parent_id: string | null;
  seo_title: string | null;
  seo_description: string | null;
  page_content: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  
  // Joined
  parent?: BusinessCategory;
  children?: BusinessCategory[];
  business_count?: number;
}

export interface BusinessReview {
  id: string;
  business_id: string;
  user_id: string | null;
  author_name: string | null;
  author_email: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  pros: string[] | null;
  cons: string[] | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  is_featured: boolean;
  reply: string | null;
  replied_at: string | null;
  replied_by: string | null;
  created_at: string;
}

export interface BusinessLead {
  id: string;
  business_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  service_needed: string | null;
  message: string | null;
  preferred_contact: string;
  urgency: string;
  source: string;
  source_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  contacted_at: string | null;
  converted_at: string | null;
  
  // Joined
  business?: Pick<Business, 'id' | 'name' | 'slug' | 'logo_url'>;
}

export interface BusinessService {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
  price_unit: string | null;
  duration_minutes: number | null;
  is_highlighted: boolean;
  sort_order: number;
  created_at: string;
}

export interface BusinessFaq {
  id: string;
  business_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface BusinessPromotion {
  id: string;
  business_id: string;
  title: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed' | 'freebie' | null;
  discount_value: number | null;
  code: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface BusinessClick {
  id: string;
  business_id: string;
  click_type: 'whatsapp' | 'phone' | 'website' | 'directions' | 'instagram' | 'view';
  source_page: string | null;
  user_agent: string | null;
  ip_hash: string | null;
  created_at: string;
}

export interface GuiaSeoPage {
  id: string;
  tenant_id: string | null;
  page_type: 'category' | 'city' | 'neighborhood' | 'service';
  slug: string;
  title: string;
  h1_title: string | null;
  intro_text: string | null;
  content_html: string | null;
  category_slug: string | null;
  city: string | null;
  neighborhood: string | null;
  service_type: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[] | null;
  views_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessPlanFeature {
  id: string;
  plan: BusinessPlan;
  feature_key: string;
  feature_name: string;
  feature_value: string | null;
  is_enabled: boolean;
}

// ========================
// INPUT TYPES
// ========================

export interface CreateBusinessInput {
  name: string;
  category_main: string;
  city: string;
  description_short?: string;
  description_full?: string;
  neighborhoods?: string[];
  whatsapp?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  address?: string;
  opening_hours?: OpeningHours;
  payment_methods?: string[];
  tags?: string[];
}

export interface UpdateBusinessInput extends Partial<CreateBusinessInput> {
  id: string;
  logo_url?: string;
  cover_url?: string;
  gallery_urls?: string[];
  video_url?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface CreateLeadInput {
  business_id: string;
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  service_needed?: string;
  message?: string;
  preferred_contact?: string;
  urgency?: string;
  source?: string;
  source_url?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface CreateReviewInput {
  business_id: string;
  rating: number;
  author_name?: string;
  author_email?: string;
  title?: string;
  content?: string;
  pros?: string[];
  cons?: string[];
}

// ========================
// FILTER TYPES
// ========================

export interface BusinessFilters {
  category?: string;
  city?: string;
  neighborhood?: string;
  plan?: BusinessPlan;
  verified_only?: boolean;
  featured_only?: boolean;
  search?: string;
  min_rating?: number;
  sort?: 'relevance' | 'rating' | 'reviews' | 'newest' | 'name';
  limit?: number;
  offset?: number;
}

// ========================
// STATS TYPES
// ========================

export interface BusinessStats {
  total_views: number;
  total_whatsapp_clicks: number;
  total_phone_clicks: number;
  total_website_clicks: number;
  total_leads: number;
  period_views: number;
  period_clicks: number;
  period_leads: number;
}

export interface GuiaStats {
  total_businesses: number;
  total_categories: number;
  total_leads_today: number;
  total_views_today: number;
  by_category: { category: string; count: number }[];
  by_plan: { plan: BusinessPlan; count: number }[];
}

// ========================
// UTILITY FUNCTIONS
// ========================

export function getBusinessUrl(business: Pick<Business, 'slug'>): string {
  return `/guia/${business.slug}`;
}

export function getCategoryUrl(category: Pick<BusinessCategory, 'slug'>): string {
  return `/guia/categoria/${category.slug}`;
}

export function getCityUrl(city: string): string {
  return `/guia/cidade/${city.toLowerCase().replace(/\s+/g, '-')}`;
}

export function getNeighborhoodUrl(city: string, neighborhood: string): string {
  return `/guia/${city.toLowerCase().replace(/\s+/g, '-')}/${neighborhood.toLowerCase().replace(/\s+/g, '-')}`;
}

export function formatWhatsAppUrl(whatsapp: string, message?: string): string {
  const clean = whatsapp.replace(/\D/g, '');
  const phone = clean.startsWith('55') ? clean : `55${clean}`;
  const url = `https://wa.me/${phone}`;
  return message ? `${url}?text=${encodeURIComponent(message)}` : url;
}

export function formatPhoneUrl(phone: string): string {
  return `tel:${phone.replace(/\D/g, '')}`;
}

export function formatPrice(min?: number | null, max?: number | null, unit?: string | null): string {
  if (!min && !max) return 'Consulte';
  
  const format = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  if (min && max && min !== max) {
    return `${format(min)} - ${format(max)}${unit ? ` / ${unit}` : ''}`;
  }
  
  return `${format(min || max || 0)}${unit ? ` / ${unit}` : ''}`;
}

export function isBusinessOpen(hours: OpeningHours): boolean {
  const now = new Date();
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const today = days[now.getDay()];
  const dayHours = hours[today];
  
  if (!dayHours || dayHours.closed) return false;
  
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  return currentTime >= dayHours.open && currentTime <= dayHours.close;
}

export function getOpeningStatus(hours: OpeningHours): { isOpen: boolean; text: string } {
  const isOpen = isBusinessOpen(hours);
  
  if (isOpen) {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
    const today = days[now.getDay()];
    const dayHours = hours[today];
    
    return { 
      isOpen: true, 
      text: `Aberto até ${dayHours?.close}` 
    };
  }
  
  return { isOpen: false, text: 'Fechado' };
}

// Default categories for seeding
export const DEFAULT_CATEGORIES = [
  { name: 'Restaurantes e Alimentação', slug: 'restaurantes', icon: '🍽️' },
  { name: 'Saúde e Bem-estar', slug: 'saude', icon: '🏥' },
  { name: 'Beleza e Estética', slug: 'beleza', icon: '💇' },
  { name: 'Serviços para Casa', slug: 'servicos-casa', icon: '🏠' },
  { name: 'Automotivo', slug: 'automotivo', icon: '🚗' },
  { name: 'Educação', slug: 'educacao', icon: '📚' },
  { name: 'Pet Shop e Veterinário', slug: 'pets', icon: '🐾' },
  { name: 'Construção e Reforma', slug: 'construcao', icon: '🔨' },
  { name: 'Comércio e Varejo', slug: 'comercio', icon: '🛒' },
  { name: 'Tecnologia e Informática', slug: 'tecnologia', icon: '💻' },
  { name: 'Advocacia e Contabilidade', slug: 'juridico', icon: '⚖️' },
  { name: 'Imobiliárias', slug: 'imobiliarias', icon: '🏢' },
];

// Payment methods options
export const PAYMENT_METHODS = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'debito', label: 'Cartão de Débito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
];

// Amenities options
export const AMENITIES = [
  { value: 'wifi', label: 'Wi-Fi Gratuito', icon: '📶' },
  { value: 'estacionamento', label: 'Estacionamento', icon: '🅿️' },
  { value: 'acessibilidade', label: 'Acessibilidade', icon: '♿' },
  { value: 'ar_condicionado', label: 'Ar Condicionado', icon: '❄️' },
  { value: 'delivery', label: 'Delivery', icon: '🛵' },
  { value: 'agendamento_online', label: 'Agendamento Online', icon: '📅' },
  { value: 'cartao', label: 'Aceita Cartão', icon: '💳' },
  { value: 'pet_friendly', label: 'Pet Friendly', icon: '🐕' },
];
