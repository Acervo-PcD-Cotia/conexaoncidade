import { useState, useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AD_FORMATS, type DeviceType } from '@/lib/adFormats';
import { useDeviceType } from '@/hooks/useDeviceType';

interface AdPopupProps {
  imageUrl: string;
  linkUrl?: string;
  linkTarget?: string;
  altText?: string;
  /** Delay in ms before showing popup (default: 3000) */
  delay?: number;
  /** Session storage key for tracking shown state */
  storageKey?: string;
  onClose?: () => void;
  onImpression?: () => void;
  onClick?: () => void;
  className?: string;
}

/**
 * Smart popup ad component with session-based display limiting.
 * 
 * Features:
 * - Max 1 display per session (stored in sessionStorage)
 * - Delayed appearance (default 3s)
 * - Swipe to close on mobile
 * - Fullscreen adapted for mobile
 * - Non-intrusive close button
 */
export function AdPopup({
  imageUrl,
  linkUrl,
  linkTarget = '_blank',
  altText = 'Anúncio',
  delay = 3000,
  storageKey = 'ad_popup_shown',
  onClose,
  onImpression,
  onClick,
  className,
}: AdPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const device = useDeviceType();
  const touchStartY = useRef<number | null>(null);
  const hasTrackedImpression = useRef(false);

  const formatConfig = AD_FORMATS.POPUP_INTELIGENTE;
  const dimensions = formatConfig[device as DeviceType];
  const isMobile = device === 'mobile';

  // Check if popup was already shown this session
  useEffect(() => {
    const wasShown = sessionStorage.getItem(storageKey);
    if (wasShown) return;

    const timer = setTimeout(() => {
      setShouldRender(true);
      // Small delay for animation
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, storageKey]);

  // Track impression when visible
  useEffect(() => {
    if (isVisible && !hasTrackedImpression.current) {
      hasTrackedImpression.current = true;
      onImpression?.();
    }
  }, [isVisible, onImpression]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    sessionStorage.setItem(storageKey, 'true');
    
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setShouldRender(false);
      onClose?.();
    }, 300);
  }, [storageKey, onClose]);

  const handleClick = () => {
    onClick?.();
  };

  // Mobile swipe to close
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY.current;
    
    // Swipe down to close (threshold: 100px)
    if (diff > 100) {
      handleClose();
    }
    
    touchStartY.current = null;
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    if (isVisible) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll on mobile
      if (isMobile) {
        document.body.style.overflow = 'hidden';
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isVisible, handleClose, isMobile]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Popup container */}
      <div
        className={cn(
          'relative transition-all duration-300',
          isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0',
          isMobile ? 'h-full w-full' : ''
        )}
        style={isMobile ? undefined : { maxWidth: dimensions.width }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute z-10 h-10 w-10 rounded-full bg-black/60 text-white hover:bg-black/80 hover:text-white',
            isMobile ? 'right-4 top-4' : '-right-3 -top-3'
          )}
          onClick={handleClose}
          aria-label="Fechar anúncio"
        >
          <X className="h-5 w-5" />
        </Button>

        {/* Ad label */}
        <div className="absolute left-4 top-4 z-10">
          <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-white/80 backdrop-blur-sm">
            Publicidade
          </span>
        </div>

        {/* Swipe hint on mobile */}
        {isMobile && (
          <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2">
            <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs text-white/80 backdrop-blur-sm">
              Deslize para baixo para fechar
            </span>
          </div>
        )}

        {/* Ad content */}
        <a
          href={linkUrl || '#'}
          target={linkTarget}
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className={cn(
            'block overflow-hidden',
            isMobile ? 'flex h-full items-center justify-center bg-black p-4' : 'rounded-lg'
          )}
        >
          <img
            src={imageUrl}
            alt={altText}
            className={cn(
              'object-contain',
              isMobile ? 'max-h-full max-w-full' : 'h-auto w-full rounded-lg'
            )}
            style={isMobile ? undefined : { aspectRatio: formatConfig.aspectRatio }}
            loading="eager"
            decoding="async"
          />
        </a>
      </div>
    </div>
  );
}
