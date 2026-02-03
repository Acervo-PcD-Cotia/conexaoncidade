import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceType } from './useDeviceType';
import { useAdMetrics } from './useAdMetrics';
import type { AdFormatKey } from '@/lib/adFormats';
import { slotTypeToFormatKey } from '@/lib/adFormats';

interface AdData {
  id: string;
  image_url: string;
  alt_text?: string;
  link_url?: string;
  link_target?: string;
  name?: string;
  title?: string;
}

interface UseAdUnitOptions {
  format: AdFormatKey;
  slotId: string;
  source?: 'publidoor' | 'ads';
  enabled?: boolean;
}

/**
 * Hook to fetch and display ads from either legacy 'ads' table or 'publidoor' system
 */
export function useAdUnit({ format, slotId, source = 'ads', enabled = true }: UseAdUnitOptions) {
  const device = useDeviceType();

  const { data: ad, isLoading, error } = useQuery({
    queryKey: ['ad-unit', slotId, source, device],
    queryFn: async (): Promise<AdData | null> => {
      const now = new Date().toISOString();

      if (source === 'ads') {
        // Fetch from legacy ads table
        const { data, error } = await supabase
          .from('ads')
          .select('id, image_url, alt_text, link_url, link_target, name')
          .eq('slot_type', slotId)
          .eq('is_active', true)
          .or(`starts_at.is.null,starts_at.lte.${now}`)
          .or(`ends_at.is.null,ends_at.gte.${now}`)
          .order('sort_order')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        return data;
      } else {
        // Fetch from publidoor system
        // Note: publidoor_items uses different field names:
        // - media_url instead of image_url
        // - cta_link instead of link_url
        // - internal_name instead of title
        const { data, error } = await supabase
          .from('publidoor_items')
          .select('id, internal_name, media_url, cta_link, status')
          .eq('status', 'published')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (!data) return null;
        
        return {
          id: data.id,
          image_url: data.media_url || '',
          link_url: data.cta_link || undefined,
          link_target: '_blank',
          title: data.internal_name,
          name: data.internal_name,
        };
      }
    },
    enabled,
    staleTime: 60000, // 1 minute
  });

  // Metrics tracking
  const { trackImpression, trackClick } = useAdMetrics({
    adId: ad?.id || '',
    source,
    device,
  });

  // Track impression when ad is loaded
  useEffect(() => {
    if (ad?.id) {
      trackImpression();
    }
  }, [ad?.id, trackImpression]);

  // Click handler with coordinate tracking
  const handleClick = (e: React.MouseEvent<HTMLElement>) => {
    if (!ad) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    trackClick(x, y);
  };

  return {
    ad,
    isLoading,
    error,
    device,
    handleClick,
    formatKey: slotTypeToFormatKey(slotId),
  };
}
