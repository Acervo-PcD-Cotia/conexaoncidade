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
export const SLOT_CHANNELS = ['ads', 'publidoor', 'webstories'] as const;
export type SlotChannel = typeof SLOT_CHANNELS[number];

/**
 * Type guard to check if a ChannelType has visual slots
 */
export function isSlotChannel(channel: ChannelType | string): channel is SlotChannel {
  return (SLOT_CHANNELS as readonly string[]).includes(channel);
}

export type SlotPlacement = 'top' | 'inline' | 'sidebar' | 'modal' | 'hero' | 'fullscreen';

export interface AdSlot {
  id: string;
  key: string;
  label: string;
  width: number;
  height: number;
  aspect: number;
  channel: SlotChannel;
  placement: SlotPlacement;
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
    id: 'leaderboard', 
    key: '728x90', 
    label: 'Leaderboard', 
    width: 728, 
    height: 90, 
    aspect: calculateAspect(728, 90), // 8.0889
    channel: 'ads', 
    placement: 'top' 
  },
  { 
    id: 'super_banner', 
    key: '970x250', 
    label: 'Super Banner', 
    width: 970, 
    height: 250, 
    aspect: calculateAspect(970, 250), // 3.88
    channel: 'ads', 
    placement: 'top' 
  },
  { 
    id: 'retangulo_medio', 
    key: '300x250', 
    label: 'Retângulo Médio', 
    width: 300, 
    height: 250, 
    aspect: calculateAspect(300, 250), // 1.2
    channel: 'ads', 
    placement: 'inline' 
  },
  { 
    id: 'arranha_ceu', 
    key: '300x600', 
    label: 'Arranha-céu', 
    width: 300, 
    height: 600, 
    aspect: calculateAspect(300, 600), // 0.5
    channel: 'ads', 
    placement: 'sidebar' 
  },
  { 
    id: 'popup', 
    key: '580x400', 
    label: 'Pop-up', 
    width: 580, 
    height: 400, 
    aspect: calculateAspect(580, 400), // 1.45
    channel: 'ads', 
    placement: 'modal' 
  },
  
  // Publidoor
  { 
    id: 'publidoor_banner', 
    key: '970x250', 
    label: 'Banner Grande', 
    width: 970, 
    height: 250, 
    aspect: calculateAspect(970, 250), // 3.88
    channel: 'publidoor', 
    placement: 'hero' 
  },
  { 
    id: 'publidoor_retangulo', 
    key: '300x250', 
    label: 'Retângulo', 
    width: 300, 
    height: 250, 
    aspect: calculateAspect(300, 250), // 1.2
    channel: 'publidoor', 
    placement: 'inline' 
  },
  { 
    id: 'publidoor_vertical', 
    key: '300x600', 
    label: 'Vertical', 
    width: 300, 
    height: 600, 
    aspect: calculateAspect(300, 600), // 0.5
    channel: 'publidoor', 
    placement: 'sidebar' 
  },
  
  // WebStories - 9:16 vertical format (1080x1920)
  { 
    id: 'story_cover', 
    key: '1080x1920', 
    label: 'Capa Story (9:16)', 
    width: 1080, 
    height: 1920, 
    aspect: calculateAspect(1080, 1920), // 0.5625
    channel: 'webstories', 
    placement: 'fullscreen' 
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
