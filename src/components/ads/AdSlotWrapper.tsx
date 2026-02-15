import { type ReactNode } from 'react';
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
}: AdSlotWrapperProps) {
  return (
    <div
      data-ad-slot={slotId}
      data-ad-channel={channel}
      data-ad-placement={placement}
      data-ad-expected={`${expectedWidth}x${expectedHeight}`}
      data-ad-page={page}
      className={cn('ad-slot-wrapper', className)}
      style={{ minWidth: 1, minHeight: 1 }}
    >
      {children}
    </div>
  );
}
