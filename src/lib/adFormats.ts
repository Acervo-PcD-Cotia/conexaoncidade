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
    label: 'Mega Destaque',
    labelPt: 'Mega Destaque',
    desktop: { width: 970, height: 250 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
    aspectRatio: '97/25',
    preload: true,
  },
  ANUNCIO_HOME: {
    id: 'anuncio_home',
    label: 'Destaque Horizontal',
    labelPt: 'Destaque Horizontal',
    desktop: { width: 970, height: 250 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
    aspectRatio: '97/25',
    preload: false,
  },
  RETANGULO_MEDIO: {
    id: 'retangulo_medio',
    label: 'Destaque Inteligente',
    labelPt: 'Destaque Inteligente',
    desktop: { width: 300, height: 250 },
    tablet: { width: 300, height: 250 },
    mobile: { width: 300, height: 250 },
    aspectRatio: '6/5',
    preload: false,
  },
  ARRANHA_CEU: {
    id: 'arranha_ceu',
    label: 'Painel Vertical',
    labelPt: 'Painel Vertical',
    desktop: { width: 300, height: 600 },
    tablet: { width: 300, height: 600 },
    mobile: { width: 300, height: 250 },
    aspectRatio: '1/2',
    preload: false,
    fallbackFormat: 'RETANGULO_MEDIO',
  },
  POPUP_INTELIGENTE: {
    id: 'popup_inteligente',
    label: 'Alerta Comercial',
    labelPt: 'Alerta Comercial',
    desktop: { width: 580, height: 400 },
    tablet: { width: 580, height: 400 },
    mobile: { width: 320, height: 480 },
    aspectRatio: '29/20',
    preload: false,
  },
  BANNER_INTRO: {
    id: 'banner_intro',
    label: 'Banner Intro',
    labelPt: 'Banner Intro',
    desktop: { width: 970, height: 250 },
    tablet: { width: 728, height: 90 },
    mobile: { width: 320, height: 100 },
    aspectRatio: '97/25',
    preload: false,
  },
  DESTAQUE_FLUTUANTE: {
    id: 'destaque_flutuante',
    label: 'Destaque Flutuante',
    labelPt: 'Destaque Flutuante',
    desktop: { width: 300, height: 600 },
    tablet: { width: 300, height: 600 },
    mobile: { width: 300, height: 250 },
    aspectRatio: '1/2',
    preload: false,
    fallbackFormat: 'RETANGULO_MEDIO',
  },
  ALERTA_FULL_SAIDA: {
    id: 'alerta_full_saida',
    label: 'Alerta Full Saída',
    labelPt: 'Alerta Full Saída',
    desktop: { width: 1280, height: 720 },
    tablet: { width: 1280, height: 720 },
    mobile: { width: 640, height: 360 },
    aspectRatio: '16/9',
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
  { value: 'super_banner_topo', label: 'Mega Destaque (970×250)', description: 'Grande impacto visual para branding e lançamentos. Exibido abaixo do menu e entre blocos da home.' },
  { value: 'anuncio_home', label: 'Destaque Horizontal (728×90)', description: 'Faixa horizontal no topo das páginas, ideal para visibilidade constante em matérias e categorias.' },
  { value: 'retangulo_medio', label: 'Destaque Inteligente (300×250)', description: 'Formato versátil e performático para conversão. Exibido no meio do conteúdo e sidebar.' },
  { value: 'arranha_ceu', label: 'Painel Vertical (300×600)', description: 'Formato vertical com grande área visual, excelente para campanhas institucionais na barra lateral.' },
  { value: 'popup_inteligente', label: 'Alerta Comercial (580×400)', description: 'Chamada direta com forte atenção do usuário. Controle de frequência e botão de fechar.' },
  { value: 'banner_intro', label: 'Banner Intro (970×250)', description: 'Banner de entrada na primeira dobra da Home. Exibição programada por campanha.' },
  { value: 'destaque_flutuante', label: 'Destaque Flutuante (300×600)', description: 'Banner lateral flutuante fixo na tela. Permanece ao rolar a página.' },
  { value: 'alerta_full_saida', label: 'Alerta Full Saída (1280×720)', description: 'Banner exibido quando o usuário tenta sair do site. Fundo escurecido com CTA.' },
] as const;

/**
 * Map slot_type to format key
 */
export function slotTypeToFormatKey(slotType: string): AdFormatKey {
  const mapping: Record<string, AdFormatKey> = {
    // Official slot IDs (from adSlots.ts)
    'leaderboard': 'ANUNCIO_HOME',
    'super_banner': 'SUPER_BANNER_TOPO',
    'retangulo_medio': 'RETANGULO_MEDIO',
    'arranha_ceu': 'ARRANHA_CEU',
    'popup': 'POPUP_INTELIGENTE',
    // Legacy aliases (still in the database)
    'home_top': 'ANUNCIO_HOME',
    'home_banner': 'SUPER_BANNER_TOPO',
    'rectangle': 'RETANGULO_MEDIO',
    'sidebar': 'RETANGULO_MEDIO',
    'content': 'RETANGULO_MEDIO',
    'skyscraper': 'ARRANHA_CEU',
    // Size-based legacy mappings
    '728x90': 'ANUNCIO_HOME',
    '970x250': 'SUPER_BANNER_TOPO',
    '300x250': 'RETANGULO_MEDIO',
    '300x600': 'ARRANHA_CEU',
    '580x400': 'POPUP_INTELIGENTE',
    // Experience formats
    'banner_intro': 'BANNER_INTRO',
    'destaque_flutuante': 'DESTAQUE_FLUTUANTE',
    'floating': 'DESTAQUE_FLUTUANTE',
    'alerta_full_saida': 'ALERTA_FULL_SAIDA',
    'exit_full': 'ALERTA_FULL_SAIDA',
    '1280x720': 'ALERTA_FULL_SAIDA',
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
