/**
 * Image Correction Engine (Legacy V1)
 * 
 * NOTE: For new code, prefer using imageCorrectionV2.ts which has better
 * proportion matching and downscale support.
 * 
 * Rules:
 * - Auto-correction ACTIVE
 * - Max upscale: 125%
 * - Proportion tolerance: <= 2%
 * - NEVER distort
 * - NEVER stretch
 * - Original ALWAYS preserved
 * - Derived marked: is_derived = true
 */

import { type SlotChannel, getSlotDefinitionsByChannel } from './adSlots';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageCorrectionResult {
  canProcess: boolean;
  reason?: string;
  originalWidth: number;
  originalHeight: number;
  targetWidth: number;
  targetHeight: number;
  upscalePercent: number;
  proportionDiff: number;
}

export interface SlotMatch {
  slotKey: string;
  slotLabel: string;
  channel: SlotChannel;
  width: number;
  height: number;
  correctionResult: ImageCorrectionResult;
}

// Configuration constants
const MAX_UPSCALE_PERCENT = 125; // 125%
const MAX_PROPORTION_DIFF = 2; // 2%

/**
 * Analyze if an image can be processed for a target size
 */
export function analyzeImage(
  original: ImageDimensions,
  target: ImageDimensions
): ImageCorrectionResult {
  const originalRatio = original.width / original.height;
  const targetRatio = target.width / target.height;
  const proportionDiff = Math.abs(1 - originalRatio / targetRatio) * 100;
  
  // Calculate scale needed to fit target
  const scaleX = target.width / original.width;
  const scaleY = target.height / original.height;
  const upscalePercent = Math.max(scaleX, scaleY) * 100;
  
  const canProcess = 
    proportionDiff <= MAX_PROPORTION_DIFF && 
    upscalePercent <= MAX_UPSCALE_PERCENT;
  
  let reason: string | undefined;
  if (upscalePercent > MAX_UPSCALE_PERCENT) {
    reason = `Upscale de ${upscalePercent.toFixed(0)}% excede limite de ${MAX_UPSCALE_PERCENT}%`;
  } else if (proportionDiff > MAX_PROPORTION_DIFF) {
    reason = `Diferença de proporção ${proportionDiff.toFixed(1)}% excede ${MAX_PROPORTION_DIFF}%`;
  }
  
  return {
    canProcess,
    reason,
    originalWidth: original.width,
    originalHeight: original.height,
    targetWidth: target.width,
    targetHeight: target.height,
    upscalePercent,
    proportionDiff,
  };
}

/**
 * Get image dimensions from a file
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
 * Official slot definitions — derived from central adSlots.ts
 */
const SLOT_DEFINITIONS = getSlotDefinitionsByChannel();

/**
 * Find matching slots for an image
 * Returns all slots that the image can be processed for
 */
export function findMatchingSlots(imageDimensions: ImageDimensions): SlotMatch[] {
  const matches: SlotMatch[] = [];
  
  for (const [channel, slots] of Object.entries(SLOT_DEFINITIONS)) {
    for (const slot of slots) {
      const correctionResult = analyzeImage(imageDimensions, { 
        width: slot.width, 
        height: slot.height 
      });
      
      if (correctionResult.canProcess) {
        matches.push({
          slotKey: slot.key,
          slotLabel: slot.label,
          channel: channel as SlotChannel,
          width: slot.width,
          height: slot.height,
          correctionResult,
        });
      }
    }
  }
  
  // Sort by upscale percent (prefer exact matches)
  return matches.sort((a, b) => a.correctionResult.upscalePercent - b.correctionResult.upscalePercent);
}

/**
 * Find the best automatic slot assignment for an image
 * Returns the slot with the least upscaling needed
 */
export function autoAssignSlot(imageDimensions: ImageDimensions): SlotMatch | null {
  const matches = findMatchingSlots(imageDimensions);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Check if an image is an exact match for a slot (no correction needed)
 */
export function isExactMatch(imageDimensions: ImageDimensions, slotKey: string): boolean {
  for (const slots of Object.values(SLOT_DEFINITIONS)) {
    const slot = slots.find(s => s.key === slotKey);
    if (slot) {
      return imageDimensions.width === slot.width && imageDimensions.height === slot.height;
    }
  }
  return false;
}

/**
 * Get slot definition by key
 */
export function getSlotDefinition(slotKey: string): { width: number; height: number; label: string } | null {
  for (const slots of Object.values(SLOT_DEFINITIONS)) {
    const slot = slots.find(s => s.key === slotKey);
    if (slot) {
      return slot;
    }
  }
  return null;
}

/**
 * Format upscale percent for display
 */
export function formatUpscalePercent(percent: number): string {
  if (percent <= 100) {
    return 'Tamanho original';
  }
  return `Ampliado ${percent.toFixed(0)}%`;
}

/**
 * Get correction status badge info
 */
export function getCorrectionBadge(correctionResult: ImageCorrectionResult): {
  text: string;
  variant: 'success' | 'warning' | 'error';
} {
  if (!correctionResult.canProcess) {
    return {
      text: correctionResult.reason || 'Não pode ser processado',
      variant: 'error',
    };
  }
  
  if (correctionResult.upscalePercent <= 100) {
    return {
      text: 'Tamanho ideal',
      variant: 'success',
    };
  }
  
  if (correctionResult.upscalePercent <= 110) {
    return {
      text: `Ampliado ${correctionResult.upscalePercent.toFixed(0)}%`,
      variant: 'success',
    };
  }
  
  return {
    text: `Ampliado ${correctionResult.upscalePercent.toFixed(0)}%`,
    variant: 'warning',
  };
}
