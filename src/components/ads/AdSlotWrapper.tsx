import React, { type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type AdPage = 'home' | 'article' | 'login' | 'webstories_feed' | 'webstories_viewer' | 'global';

interface AdSlotWrapperProps {
  slotId: string;
  channel: string;
  placement: string;
  expectedWidth: number;
  expectedHeight: number;
  page: AdPage;
  children?: ReactNode;
  className?: string;
  /**
   * Quando true, reserva espaço no layout (melhor para banners inline/sidebar/top).
   * Quando false, não força tamanho (bom para modais/popups que só aparecem quando ativos).
   */
  reserveSpace?: boolean;
  /**
   * Sinaliza que este slot é condicional (ex.: exit-intent, popup, floating).
   * Diagnóstico exibe como "Condicional" ao invés de quebrado.
   */
  conditional?: boolean;
}

/**
 * Standardized wrapper for all ad slots.
 * Injects data attributes for diagnostic scanning via iframe.
 * ALWAYS renders even without content — proves the insertion point.
 */
export function AdSlotWrapper({
  slotId,
  channel,
  placement,
  expectedWidth,
  expectedHeight,
  page,
  children,
  className,
  reserveSpace = true,
  conditional = false,
}: AdSlotWrapperProps) {
  const style: React.CSSProperties = reserveSpace
    ? {
        minWidth: expectedWidth ? `${expectedWidth}px` : undefined,
        minHeight: expectedHeight ? `${expectedHeight}px` : undefined,
      }
    : {
        minWidth: 1,
        minHeight: 1,
      };

  return (
    <div
      data-ad-slot={slotId}
      data-ad-channel={channel}
      data-ad-placement={placement}
      data-ad-expected={`${expectedWidth}x${expectedHeight}`}
      data-ad-page={page}
      data-ad-conditional={conditional ? 'true' : 'false'}
      className={cn('ad-slot-wrapper', className)}
      style={style}
    >
      {children}
    </div>
  );
}
