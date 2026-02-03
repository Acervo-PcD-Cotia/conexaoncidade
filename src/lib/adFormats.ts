/**
 * Sistema Padronizado de Publicidade - Portal Conexão na Cidade
 * Formatos oficiais únicos para Portal, Admin, Publidoor, Mobile e Desktop
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface AdDimensions {
  width: number;
  height: number;
}

export interface AdFormatBase {
  id: string;
  label: string;
  labelPt: string;
  desktop: AdDimensions;
  tablet: AdDimensions;
  mobile: AdDimensions;
  aspectRatio: string;
  preload: boolean;
}

export interface AdFormatWithFallback extends AdFormatBase {
  fallbackFormat: string;
}

export type AdFormat = AdFormatBase | AdFormatWithFallback;

function hasFallback(format: AdFormat): format is AdFormatWithFallback {
  return 'fallbackFormat' in format;
}

export const AD_FORMATS: Record<string, AdFormat> = {
  SUPER_BANNER_TOPO: {
    id: 'super_banner_topo',
    label: 'Super Banner Top',
    labelPt: 'Super Banner Topo',
    desktop: { width: 970, height: 250 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
    aspectRatio: '97/25',
    preload: true,
  },
  ANUNCIO_HOME: {
    id: 'anuncio_home',
    label: 'Home Ad',
    labelPt: 'Anúncio Home',
    desktop: { width: 970, height: 250 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
    aspectRatio: '97/25',
    preload: false,
  },
  RETANGULO_MEDIO: {
    id: 'retangulo_medio',
    label: 'Medium Rectangle',
    labelPt: 'Retângulo Médio',
    desktop: { width: 300, height: 250 },
    tablet: { width: 300, height: 250 },
    mobile: { width: 300, height: 250 },
    aspectRatio: '6/5',
    preload: false,
  },
  ARRANHA_CEU: {
    id: 'arranha_ceu',
    label: 'Skyscraper',
    labelPt: 'Arranha-céu',
    desktop: { width: 300, height: 600 },
    tablet: { width: 300, height: 600 },
    mobile: { width: 300, height: 250 },
    aspectRatio: '1/2',
    preload: false,
    fallbackFormat: 'RETANGULO_MEDIO',
  },
  POPUP_INTELIGENTE: {
    id: 'popup_inteligente',
    label: 'Smart Popup',
    labelPt: 'Pop-up Inteligente',
    desktop: { width: 580, height: 400 },
    tablet: { width: 580, height: 400 },
    mobile: { width: 320, height: 480 },
    aspectRatio: '29/20',
    preload: false,
  },
};

export type AdFormatKey = keyof typeof AD_FORMATS;

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 1024,
} as const;

/**
 * Get current device type based on window width
 */
export function getDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const width = window.innerWidth;
  if (width <= BREAKPOINTS.mobile) return 'mobile';
  if (width <= BREAKPOINTS.tablet) return 'tablet';
  return 'desktop';
}

/**
 * Get dimensions for a format based on device type
 */
export function getFormatDimensions(
  formatKey: AdFormatKey,
  device: DeviceType
): AdDimensions {
  const format = AD_FORMATS[formatKey];
  return format[device];
}

/**
 * Get CSS aspect ratio string for a format
 */
export function getAspectRatioStyle(formatKey: AdFormatKey): string {
  return AD_FORMATS[formatKey].aspectRatio;
}

/**
 * Check if format should use fallback on mobile
 */
export function shouldUseFallback(formatKey: AdFormatKey, device: DeviceType): boolean {
  if (device !== 'mobile') return false;
  const format = AD_FORMATS[formatKey];
  return hasFallback(format);
}

/**
 * Get the effective format key considering fallbacks
 */
export function getEffectiveFormat(formatKey: AdFormatKey, device: DeviceType): AdFormatKey {
  if (!shouldUseFallback(formatKey, device)) return formatKey;
  const format = AD_FORMATS[formatKey];
  if (hasFallback(format)) {
    return format.fallbackFormat as AdFormatKey;
  }
  return formatKey;
}

/**
 * Format type options for admin dropdowns
 */
export const FORMAT_OPTIONS = [
  { value: 'super_banner_topo', label: 'Topo (Super Banner)', description: 'Principal, topo do site' },
  { value: 'anuncio_home', label: 'Home (Destaque)', description: 'Área de destaque na home' },
  { value: 'retangulo_medio', label: 'Conteúdo (Retângulo)', description: 'Meio de matérias, sidebar' },
  { value: 'arranha_ceu', label: 'Impacto (Arranha-céu)', description: 'Laterais, alta visibilidade' },
  { value: 'popup_inteligente', label: 'Pop-up', description: 'Máx. 1x por sessão' },
] as const;

/**
 * Map slot_type to format key
 */
export function slotTypeToFormatKey(slotType: string): AdFormatKey {
  const mapping: Record<string, AdFormatKey> = {
    'home_top': 'SUPER_BANNER_TOPO',
    'home_banner': 'ANUNCIO_HOME',
    'sidebar': 'RETANGULO_MEDIO',
    'content': 'RETANGULO_MEDIO',
    'skyscraper': 'ARRANHA_CEU',
    'popup': 'POPUP_INTELIGENTE',
    // Legacy mappings
    '728x90': 'SUPER_BANNER_TOPO',
    '970x250': 'SUPER_BANNER_TOPO',
    '300x250': 'RETANGULO_MEDIO',
    '300x600': 'ARRANHA_CEU',
    '580x400': 'POPUP_INTELIGENTE',
  };
  
  return mapping[slotType] || 'RETANGULO_MEDIO';
}

/**
 * Safe area percentage (central area that won't be cropped)
 */
export const SAFE_AREA_PERCENT = 80;

/**
 * Maximum file size in bytes (500KB)
 */
export const MAX_FILE_SIZE = 500 * 1024;

/**
 * Accepted image formats
 */
export const ACCEPTED_IMAGE_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];
