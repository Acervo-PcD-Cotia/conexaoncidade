/**
 * Official Ad Slot Definitions
 * Single source of truth for all slot configurations across channels
 * 
 * NOTE: This file defines slots for VISUAL channels only.
 * For the full list of ChannelTypes, see src/types/campaigns-unified.ts
 */

import { type ChannelType } from '@/types/campaigns-unified';

/**
 * Channels that have visual ad slots
 * These are a subset of all ChannelTypes
 */
export const SLOT_CHANNELS = ['ads', 'publidoor', 'webstories', 'login', 'experience'] as const;
export type SlotChannel = typeof SLOT_CHANNELS[number];

/**
 * Type guard to check if a ChannelType has visual slots
 */
export function isSlotChannel(channel: ChannelType | string): channel is SlotChannel {
  return (SLOT_CHANNELS as readonly string[]).includes(channel);
}

export type SlotPlacement = 'top' | 'inline' | 'sidebar' | 'modal' | 'hero' | 'fullscreen' | 'login' | 'floating' | 'intro';

export interface AdSlot {
  id: string;
  key: string;
  label: string;
  width: number;
  height: number;
  aspect: number;
  channel: SlotChannel;
  placement: SlotPlacement;
  /** Sequência numérica oficial (1–15) */
  seq: number;
  /** Descrição comercial curta */
  description: string;
  /** Onde aparece no portal */
  location: string;
}

/**
 * Calculate aspect ratio from dimensions
 */
export function calculateAspect(width: number, height: number): number {
  return Number((width / height).toFixed(4));
}

/**
 * Official slot definitions
 */
export const AD_SLOTS: AdSlot[] = [
  // Ads (Banners)
  { 
    id: 'leaderboard', key: '728x90', label: 'Destaque Horizontal', 
    width: 728, height: 90, aspect: calculateAspect(728, 90),
    channel: 'ads', placement: 'top', seq: 1,
    description: 'Faixa horizontal de visibilidade contínua',
    location: 'Topo da Home, matérias, categorias',
  },
  { 
    id: 'super_banner', key: '970x250', label: 'Mega Destaque', 
    width: 970, height: 250, aspect: calculateAspect(970, 250),
    channel: 'ads', placement: 'top', seq: 2,
    description: 'Banner de grande impacto visual',
    location: 'Abaixo do menu, início da Home',
  },
  { 
    id: 'retangulo_medio', key: '300x250', label: 'Destaque Inteligente', 
    width: 300, height: 250, aspect: calculateAspect(300, 250),
    channel: 'ads', placement: 'inline', seq: 3,
    description: 'Formato focado em conversão',
    location: 'Meio de matérias, sidebar',
  },
  { 
    id: 'arranha_ceu', key: '300x600', label: 'Painel Vertical', 
    width: 300, height: 600, aspect: calculateAspect(300, 600),
    channel: 'ads', placement: 'sidebar', seq: 4,
    description: 'Formato vertical de alta exposição',
    location: 'Lateral da Home e matérias',
  },
  { 
    id: 'popup', key: '580x400', label: 'Alerta Comercial', 
    width: 580, height: 400, aspect: calculateAspect(580, 400),
    channel: 'ads', placement: 'modal', seq: 5,
    description: 'Banner modal de impacto imediato',
    location: 'Pop-up controlado por tempo/scroll',
  },
  
  // Publidoor
  { 
    id: 'publidoor_banner', key: '970x250', label: 'Destaque Premium', 
    width: 970, height: 250, aspect: calculateAspect(970, 250),
    channel: 'publidoor', placement: 'hero', seq: 6,
    description: 'Banner de destaque para telas urbanas',
    location: 'Telas digitais em vitrines',
  },
  { 
    id: 'publidoor_retangulo', key: '300x250', label: 'Destaque Editorial', 
    width: 300, height: 250, aspect: calculateAspect(300, 250),
    channel: 'publidoor', placement: 'inline', seq: 7,
    description: 'Formato editorial para telas',
    location: 'Telas urbanas inline',
  },
  { 
    id: 'publidoor_vertical', key: '300x600', label: 'Painel Vertical Editorial', 
    width: 300, height: 600, aspect: calculateAspect(300, 600),
    channel: 'publidoor', placement: 'sidebar', seq: 8,
    description: 'Formato vertical para telas digitais',
    location: 'Lateral de telas urbanas',
  },
  
  // WebStories - 9:16 vertical format (1080x1920)
  { 
    id: 'story_cover', key: '1080x1920', label: 'Story Premium', 
    width: 1080, height: 1920, aspect: calculateAspect(1080, 1920),
    channel: 'webstories', placement: 'fullscreen', seq: 9,
    description: 'Story vertical interativo fullscreen',
    location: 'Feed de stories mobile',
  },

  // Login - Formatos para tela de login
  { 
    id: 'login_formato_01', key: '800x500', label: 'Login 01 (Hero Login)', 
    width: 800, height: 500, aspect: calculateAspect(800, 500),
    channel: 'login', placement: 'login', seq: 10,
    description: 'Banner hero na tela de login',
    location: 'Tela de login — destaque principal',
  },
  { 
    id: 'login_formato_02', key: '200x500', label: 'Login 02 (Lateral Login)', 
    width: 200, height: 500, aspect: calculateAspect(200, 500),
    channel: 'login', placement: 'login', seq: 11,
    description: 'Banner vertical estreito',
    location: 'Tela de login — lateral',
  },
  { 
    id: 'login_formato_03', key: '400x500', label: 'Login 03 (Grid Login)', 
    width: 400, height: 500, aspect: calculateAspect(400, 500),
    channel: 'login', placement: 'login', seq: 12,
    description: 'Banner médio na tela de login',
    location: 'Tela de login — grid',
  },

  // Experience - Banners de experiência do site
  { 
    id: 'banner_intro', key: '970x250', label: 'Banner Intro', 
    width: 970, height: 250, aspect: calculateAspect(970, 250),
    channel: 'experience', placement: 'intro', seq: 13,
    description: 'Banner de entrada pós-carregamento',
    location: 'Primeira dobra da Home',
  },
  { 
    id: 'destaque_flutuante', key: '300x600', label: 'Destaque Flutuante', 
    width: 300, height: 600, aspect: calculateAspect(300, 600),
    channel: 'experience', placement: 'floating', seq: 14,
    description: 'Banner lateral fixo na tela',
    location: 'Lateral direita/esquerda, fixo ao scroll',
  },
  { 
    id: 'alerta_full_saida', key: '1280x720', label: 'Alerta Full Saída', 
    width: 1280, height: 720, aspect: calculateAspect(1280, 720),
    channel: 'experience', placement: 'modal', seq: 15,
    description: 'Banner de exit-intent fullscreen',
    location: 'Ao tentar sair do site',
  },
];

export type AdSlotId = typeof AD_SLOTS[number]['id'];

/**
 * Get slot by ID
 */
export function getSlotById(id: string): AdSlot | undefined {
  return AD_SLOTS.find(slot => slot.id === id);
}

/**
 * Get slot by key (e.g., "728x90")
 */
export function getSlotByKey(key: string): AdSlot | undefined {
  return AD_SLOTS.find(slot => slot.key === key);
}

/**
 * Get all slots for a specific channel
 */
export function getSlotsForChannel(channel: SlotChannel): AdSlot[] {
  return AD_SLOTS.filter(slot => slot.channel === channel);
}

/**
 * Configuration constants for image processing
 */
export const IMAGE_CONFIG = {
  MAX_UPSCALE_PERCENT: 125,
  PROPORTION_TOLERANCE: 0.02, // 2%
  MAX_FILE_SIZE_MB: 30,
};

/* ── Channel metadata for UI display ── */

export interface ChannelBlockMeta {
  channel: SlotChannel;
  title: string;
  color: string;        // tailwind badge class
  colorBorder: string;  // tailwind border class
  slots: AdSlot[];
}

const CHANNEL_META: Record<SlotChannel, { title: string; color: string; colorBorder: string }> = {
  ads:        { title: 'Ads (Banners)', color: 'bg-blue-500', colorBorder: 'border-blue-500' },
  publidoor:  { title: 'Publidoor', color: 'bg-purple-500', colorBorder: 'border-purple-500' },
  webstories: { title: 'WebStories', color: 'bg-pink-500', colorBorder: 'border-pink-500' },
  login:      { title: 'Login', color: 'bg-gray-500', colorBorder: 'border-gray-500' },
  experience: { title: 'Experiência', color: 'bg-orange-500', colorBorder: 'border-orange-500' },
};

/**
 * Returns slots grouped by channel with display metadata.
 * Used by MediaKit, Tutorial, BatchAssetUploader reference table, etc.
 */
export function getSlotBlocks(): ChannelBlockMeta[] {
  return SLOT_CHANNELS.map(ch => ({
    channel: ch,
    ...CHANNEL_META[ch],
    slots: getSlotsForChannel(ch),
  }));
}

/**
 * Slot definitions grouped by channel for image correction / validation.
 * Direct replacement for duplicated SLOT_DEFINITIONS in imageCorrection.ts
 */
export function getSlotDefinitionsByChannel(): Record<SlotChannel, { key: string; label: string; width: number; height: number }[]> {
  const result = {} as Record<SlotChannel, { key: string; label: string; width: number; height: number }[]>;
  for (const ch of SLOT_CHANNELS) {
    result[ch] = getSlotsForChannel(ch).map(s => ({
      key: s.key, label: s.label, width: s.width, height: s.height,
    }));
  }
  return result;
}
