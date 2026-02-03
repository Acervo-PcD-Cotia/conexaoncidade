/**
 * Image Correction Engine V2
 * Enhanced version with proportion-based matching and downscale support
 * 
 * Rules:
 * - Match by PROPORTION (aspect ratio) with 2% tolerance
 * - Downscale (larger images) ALWAYS allowed
 * - Upscale limited to 125% max
 * - Original ALWAYS preserved
 * - Derived marked: is_derived = true
 */

import { AD_SLOTS, IMAGE_CONFIG, type AdSlot, type SlotChannel } from './adSlots';

export interface ImageDimensions {
  width: number;
  height: number;
}

export type MatchType = 
  | 'exact'           // Exact size match
  | 'downscale'       // Image larger, will be reduced
  | 'upscale_ok'      // Image smaller but within 125% limit
  | 'upscale_warning' // Image smaller, above limit but manually selectable
  | 'proportion_mismatch'; // Aspect ratio doesn't match

export interface SlotMatchV2 {
  slotId: string;
  slotKey: string;
  slotLabel: string;
  channel: SlotChannel;
  width: number;
  height: number;
  matchType: MatchType;
  proportionDiff: number;     // Percentage difference in aspect ratio
  scaleFactor: number;        // <1 = downscale, >1 = upscale
  scalePercent: number;       // Scale factor as percentage (100 = original)
  statusText: string;         // Human-readable status
  statusVariant: 'success' | 'warning' | 'error';
  canAutoProcess: boolean;    // If true, can be processed automatically
}

/**
 * Calculate aspect ratio
 */
export function calculateAspect(width: number, height: number): number {
  if (height === 0) return 0;
  return width / height;
}

/**
 * Format aspect ratio for display
 */
export function formatAspectRatio(width: number, height: number): string {
  const aspect = calculateAspect(width, height);
  return aspect.toFixed(2) + ':1';
}

/**
 * Analyze if an image can match a specific slot
 */
export function analyzeSlotMatch(
  imageDimensions: ImageDimensions,
  slot: AdSlot
): SlotMatchV2 {
  const imageAspect = calculateAspect(imageDimensions.width, imageDimensions.height);
  const slotAspect = slot.aspect;
  
  // Calculate proportion difference (percentage)
  const proportionDiff = Math.abs(1 - imageAspect / slotAspect);
  
  // Calculate scale factor (how much we need to scale to fit)
  const scaleX = slot.width / imageDimensions.width;
  const scaleY = slot.height / imageDimensions.height;
  const scaleFactor = Math.max(scaleX, scaleY);
  const scalePercent = scaleFactor * 100;
  
  // Check if proportions match within tolerance
  const proportionMatches = proportionDiff <= IMAGE_CONFIG.PROPORTION_TOLERANCE;
  
  // Determine match type
  let matchType: MatchType;
  let statusText: string;
  let statusVariant: 'success' | 'warning' | 'error';
  let canAutoProcess = false;
  
  if (!proportionMatches) {
    matchType = 'proportion_mismatch';
    statusText = `Proporção incompatível (${(proportionDiff * 100).toFixed(1)}% diferença)`;
    statusVariant = 'error';
  } else if (scalePercent <= 100.5) {
    // Exact match or slight downscale (0.5% tolerance for rounding)
    if (scalePercent >= 99.5) {
      matchType = 'exact';
      statusText = 'Tamanho ideal';
    } else {
      matchType = 'downscale';
      statusText = `Será reduzido para ${slot.width}×${slot.height}`;
    }
    statusVariant = 'success';
    canAutoProcess = true;
  } else if (scalePercent <= IMAGE_CONFIG.MAX_UPSCALE_PERCENT) {
    matchType = 'upscale_ok';
    statusText = `Será ampliado ${scalePercent.toFixed(0)}%`;
    statusVariant = 'warning';
    canAutoProcess = true;
  } else {
    matchType = 'upscale_warning';
    statusText = `Ampliação de ${scalePercent.toFixed(0)}% excede limite (requer seleção manual)`;
    statusVariant = 'error';
  }
  
  return {
    slotId: slot.id,
    slotKey: slot.key,
    slotLabel: slot.label,
    channel: slot.channel,
    width: slot.width,
    height: slot.height,
    matchType,
    proportionDiff: proportionDiff * 100,
    scaleFactor,
    scalePercent,
    statusText,
    statusVariant,
    canAutoProcess,
  };
}

/**
 * Find all compatible slots for an image
 * Returns slots sorted by best match (exact > downscale > upscale_ok)
 */
export function findCompatibleSlots(
  imageDimensions: ImageDimensions,
  options?: {
    channelFilter?: SlotChannel;
    includeManualOnly?: boolean;
  }
): SlotMatchV2[] {
  const { channelFilter, includeManualOnly = false } = options || {};
  
  let slots = AD_SLOTS;
  if (channelFilter) {
    slots = slots.filter(slot => slot.channel === channelFilter);
  }
  
  const matches: SlotMatchV2[] = [];
  
  for (const slot of slots) {
    const match = analyzeSlotMatch(imageDimensions, slot);
    
    // Include if auto-processable OR if includeManualOnly is true
    if (match.canAutoProcess || (includeManualOnly && match.matchType !== 'proportion_mismatch')) {
      matches.push(match);
    }
  }
  
  // Sort by quality: exact > downscale > upscale_ok, then by scale factor
  return matches.sort((a, b) => {
    const typeOrder: Record<MatchType, number> = {
      exact: 0,
      downscale: 1,
      upscale_ok: 2,
      upscale_warning: 3,
      proportion_mismatch: 4,
    };
    
    const typeCompare = typeOrder[a.matchType] - typeOrder[b.matchType];
    if (typeCompare !== 0) return typeCompare;
    
    // For same type, prefer less scaling
    return a.scalePercent - b.scalePercent;
  });
}

/**
 * Auto-assign the best slot for an image
 * Returns null if no compatible slot found
 */
export function autoAssignSlot(imageDimensions: ImageDimensions): SlotMatchV2 | null {
  const matches = findCompatibleSlots(imageDimensions);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Find all slots where the image's proportion matches
 * Including those requiring manual selection
 */
export function findAllProportionMatches(imageDimensions: ImageDimensions): SlotMatchV2[] {
  const imageAspect = calculateAspect(imageDimensions.width, imageDimensions.height);
  
  return AD_SLOTS
    .map(slot => {
      const match = analyzeSlotMatch(imageDimensions, slot);
      return match;
    })
    .filter(match => match.matchType !== 'proportion_mismatch')
    .sort((a, b) => a.proportionDiff - b.proportionDiff);
}

/**
 * Get image dimensions from a File
 */
export function getImageDimensions(file: File): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Get image dimensions from a URL
 */
export function getImageDimensionsFromUrl(url: string): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image from URL'));
    };
    img.src = url;
  });
}

/**
 * Get badge configuration for UI display
 */
export function getMatchBadge(match: SlotMatchV2): {
  text: string;
  variant: 'success' | 'warning' | 'error';
  icon: 'check' | 'alert' | 'x';
} {
  switch (match.matchType) {
    case 'exact':
      return { text: 'Tamanho ideal', variant: 'success', icon: 'check' };
    case 'downscale':
      return { text: 'Será reduzido', variant: 'success', icon: 'check' };
    case 'upscale_ok':
      return { text: `Ampliado ${match.scalePercent.toFixed(0)}%`, variant: 'warning', icon: 'alert' };
    case 'upscale_warning':
      return { text: 'Ampliação excessiva', variant: 'error', icon: 'alert' };
    case 'proportion_mismatch':
      return { text: 'Proporção incompatível', variant: 'error', icon: 'x' };
  }
}

/**
 * Export functions that maintain backward compatibility
 */
export { AD_SLOTS, IMAGE_CONFIG };
