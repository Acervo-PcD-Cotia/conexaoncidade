import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AD_FORMATS, type DeviceType } from '@/lib/adFormats';
import { useDeviceType } from '@/hooks/useDeviceType';

interface AdCarouselItem {
  id: string;
  image_url: string;
  link_url?: string;
  link_target?: string;
  alt_text?: string;
  title?: string;
}

interface AdCarouselProps {
  items: AdCarouselItem[];
  format?: keyof typeof AD_FORMATS;
  autoPlayInterval?: number;
  onImpression?: (item: AdCarouselItem) => void;
  onClick?: (item: AdCarouselItem, x: number, y: number) => void;
  className?: string;
}

/**
 * Ad carousel component for rotating multiple ads in a single slot.
 * 
 * Features:
 * - Smooth transitions with Tailwind
 * - Auto-play with pause on hover
 * - Position indicators
 * - Manual navigation
 * - Responsive dimensions based on format
 */
export function AdCarousel({
  items,
  format = 'SUPER_BANNER_TOPO',
  autoPlayInterval = 5000,
  onImpression,
  onClick,
  className,
}: AdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackedImpressions = useRef<Set<string>>(new Set());
  const device = useDeviceType();

  const formatConfig = AD_FORMATS[format];
  const dimensions = formatConfig[device as DeviceType];

  const goToNext = useCallback(() => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goToPrev = () => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Auto-play
  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const interval = setInterval(goToNext, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isPaused, goToNext, items.length, autoPlayInterval]);

  // Reset index when items change
  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) {
      setCurrentIndex(0);
    }
  }, [items.length, currentIndex]);

  // Track impressions
  useEffect(() => {
    if (items.length === 0) return;
    
    const currentItem = items[currentIndex];
    if (!currentItem) return;
    
    if (trackedImpressions.current.has(currentItem.id)) return;
    trackedImpressions.current.add(currentItem.id);
    
    onImpression?.(currentItem);
  }, [currentIndex, items, onImpression]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, item: AdCarouselItem) => {
    if (!onClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    
    onClick(item, x, y);
  };

  if (items.length === 0) return null;

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Ad label */}
      <div className="absolute left-2 top-2 z-10">
        <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
          Publicidade
        </span>
      </div>

      {/* Carousel container */}
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ 
          transform: `translateX(-${currentIndex * 100}%)`,
          maxWidth: dimensions.width,
          margin: '0 auto',
        }}
      >
        {items.map((item) => (
          <a
            key={item.id}
            href={item.link_url || '#'}
            target={item.link_target || '_blank'}
            rel="noopener noreferrer sponsored"
            className="relative w-full shrink-0"
            onClick={(e) => handleClick(e, item)}
          >
            <div
              className="w-full overflow-hidden bg-muted"
              style={{ aspectRatio: formatConfig.aspectRatio }}
            >
              <img
                src={item.image_url}
                alt={item.alt_text || item.title || 'Anúncio'}
                className="h-full w-full object-cover object-center"
                loading={formatConfig.preload ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          </a>
        ))}
      </div>

      {/* Navigation arrows */}
      {items.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              goToPrev();
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white"
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
              className={cn(
                'h-2 w-2 rounded-full transition-all duration-300',
                index === currentIndex
                  ? 'w-4 bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {items.length > 1 && (
        <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
          {currentIndex + 1} / {items.length}
        </div>
      )}
    </div>
  );
}
