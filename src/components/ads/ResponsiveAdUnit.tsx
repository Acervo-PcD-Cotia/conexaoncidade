import { useAdUnit } from '@/hooks/useAdUnit';
import { AD_FORMATS, getEffectiveFormat, type AdFormatKey, type DeviceType } from '@/lib/adFormats';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { AdSlotWrapper, type AdPage } from './AdSlotWrapper';

interface ResponsiveAdUnitProps {
  format: AdFormatKey;
  slotId: string;
  source?: 'publidoor' | 'ads';
  className?: string;
  page?: AdPage;
}

/**
 * Unified responsive ad component that serves both legacy ads and Publidoor items.
 */
export function ResponsiveAdUnit({
  format,
  slotId,
  source = 'ads',
  className,
  page = 'home',
}: ResponsiveAdUnitProps) {
  const { ad, isLoading, device, handleClick } = useAdUnit({
    format,
    slotId,
    source,
  });

  const effectiveFormat = getEffectiveFormat(format, device);
  const formatConfig = AD_FORMATS[effectiveFormat];
  const dimensions = formatConfig[device as DeviceType];

  // Map format to slot metadata
  const slotMap: Record<string, { channel: string; placement: string; w: number; h: number }> = {
    SUPER_BANNER_TOPO: { channel: 'ads', placement: 'top', w: 970, h: 250 },
    ANUNCIO_HOME: { channel: 'ads', placement: 'top', w: 728, h: 90 },
    RETANGULO_MEDIO: { channel: 'ads', placement: 'inline', w: 300, h: 250 },
    ARRANHA_CEU: { channel: 'ads', placement: 'sidebar', w: 300, h: 600 },
    POPUP_INTELIGENTE: { channel: 'ads', placement: 'modal', w: 580, h: 400 },
    BANNER_INTRO: { channel: 'experience', placement: 'intro', w: 970, h: 250 },
    DESTAQUE_FLUTUANTE: { channel: 'experience', placement: 'floating', w: 300, h: 600 },
    ALERTA_FULL_SAIDA: { channel: 'experience', placement: 'modal', w: 1280, h: 720 },
  };

  const meta = slotMap[format as string] || { channel: source, placement: 'inline', w: dimensions.width, h: dimensions.height };

  if (isLoading) {
    return (
      <AdSlotWrapper
        slotId={slotId}
        channel={meta.channel}
        placement={meta.placement}
        expectedWidth={meta.w}
        expectedHeight={meta.h}
        page={page}
        className={cn('flex flex-col items-center justify-center', className)}
      >
        <Skeleton 
          className="w-full"
          style={{ 
            maxWidth: dimensions.width,
            aspectRatio: formatConfig.aspectRatio,
          }}
        />
      </AdSlotWrapper>
    );
  }

  if (!ad) {
    return (
      <AdSlotWrapper
        slotId={slotId}
        channel={meta.channel}
        placement={meta.placement}
        expectedWidth={meta.w}
        expectedHeight={meta.h}
        page={page}
        className={className}
      />
    );
  }

  return (
    <AdSlotWrapper
      slotId={slotId}
      channel={meta.channel}
      placement={meta.placement}
      expectedWidth={meta.w}
      expectedHeight={meta.h}
      page={page}
      className={cn('flex flex-col items-center justify-center', className)}
    >
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
    </AdSlotWrapper>
  );
}
