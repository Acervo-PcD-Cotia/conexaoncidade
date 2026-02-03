import { ResponsiveAdUnit } from '@/components/ads/ResponsiveAdUnit';
import { slotTypeToFormatKey } from '@/lib/adFormats';

interface AdSlotProps {
  slotType: string;
  className?: string;
}

/**
 * Legacy AdSlot wrapper - now uses the unified ResponsiveAdUnit component.
 * Maintains backwards compatibility with existing slot types.
 */
export function AdSlot({ slotType, className = "" }: AdSlotProps) {
  const formatKey = slotTypeToFormatKey(slotType);
  
  return (
    <ResponsiveAdUnit
      format={formatKey}
      slotId={slotType}
      source="ads"
      className={className}
    />
  );
}
