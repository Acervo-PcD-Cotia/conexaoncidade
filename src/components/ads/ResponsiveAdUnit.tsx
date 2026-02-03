import { useAdUnit } from '@/hooks/useAdUnit';
import { AD_FORMATS, getEffectiveFormat, type AdFormatKey, type DeviceType } from '@/lib/adFormats';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface ResponsiveAdUnitProps {
  format: AdFormatKey;
  slotId: string;
  source?: 'publidoor' | 'ads';
  className?: string;
}

/**
 * Unified responsive ad component that serves both legacy ads and Publidoor items.
 * 
 * Features:
 * - Automatic device detection (mobile/tablet/desktop)
 * - Native CSS aspect-ratio for CLS prevention
 * - Lazy loading (except for preload formats like top banners)
 * - Safe area centered image positioning
 * - Automatic impression and click tracking
 */
export function ResponsiveAdUnit({
  format,
  slotId,
  source = 'ads',
  className,
}: ResponsiveAdUnitProps) {
  const { ad, isLoading, device, handleClick } = useAdUnit({
    format,
    slotId,
    source,
  });

  // Get effective format (with fallback for mobile if applicable)
  const effectiveFormat = getEffectiveFormat(format, device);
  const formatConfig = AD_FORMATS[effectiveFormat];

  // Get dimensions for current device
  const dimensions = formatConfig[device as DeviceType];

  if (isLoading) {
    return (
      <div className={cn('flex flex-col items-center justify-center', className)}>
        <Skeleton 
          className="w-full"
          style={{ 
            maxWidth: dimensions.width,
            aspectRatio: formatConfig.aspectRatio,
          }}
        />
      </div>
    );
  }

  if (!ad) return null;

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {/* Ad label for transparency */}
      <span className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
        Publicidade
      </span>
      
      <a
        href={ad.link_url || '#'}
        target={ad.link_target || '_blank'}
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="block overflow-hidden rounded-sm transition-opacity hover:opacity-95"
        style={{
          maxWidth: dimensions.width,
          width: '100%',
        }}
      >
        <div
          className="relative w-full overflow-hidden bg-muted"
          style={{ aspectRatio: formatConfig.aspectRatio }}
        >
          <img
            src={ad.image_url}
            alt={ad.alt_text || ad.name || ad.title || 'Anúncio'}
            className="h-full w-full object-cover object-center"
            loading={formatConfig.preload ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      </a>
    </div>
  );
}
