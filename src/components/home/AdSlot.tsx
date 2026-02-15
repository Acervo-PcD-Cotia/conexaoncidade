import { ResponsiveAdUnit } from '@/components/ads/ResponsiveAdUnit';
import { slotTypeToFormatKey } from '@/lib/adFormats';
import { type AdPage } from '@/components/ads/AdSlotWrapper';

interface AdSlotProps {
  slotType: string;
  className?: string;
  page?: AdPage;
}

/**
 * Legacy AdSlot wrapper - now uses the unified ResponsiveAdUnit component.
 */
export function AdSlot({ slotType, className = "", page = 'home' }: AdSlotProps) {
  const formatKey = slotTypeToFormatKey(slotType);
  
  return (
    <ResponsiveAdUnit
      format={formatKey}
      slotId={slotType}
      source="ads"
      className={className}
      page={page}
    />
  );
}
