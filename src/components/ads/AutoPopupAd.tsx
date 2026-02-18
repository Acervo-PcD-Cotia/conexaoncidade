import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AdPopup } from './AdPopup';
import { useAdMetrics } from '@/hooks/useAdMetrics';
import { useDeviceType } from '@/hooks/useDeviceType';

/**
 * Self-fetching popup ad component.
 * Queries the `ads` table for active popup ads and renders AdPopup automatically.
 */
export function AutoPopupAd() {
  const device = useDeviceType();

  const { data: ad } = useQuery({
    queryKey: ['auto-popup-ad'],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('ads')
        .select('id, image_url, alt_text, link_url, link_target, name')
        .eq('slot_type', 'popup')
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('sort_order')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[AutoPopupAd] error:', error);
        return null;
      }
      return data;
    },
    staleTime: 60000,
  });

  const { trackImpression, trackClick } = useAdMetrics({
    adId: ad?.id || '',
    source: 'ads',
    device,
  });

  if (!ad) return null;

  return (
    <AdPopup
      imageUrl={ad.image_url}
      linkUrl={ad.link_url || undefined}
      linkTarget={ad.link_target || '_blank'}
      altText={ad.alt_text || ad.name || 'Anúncio'}
      delay={5000}
      storageKey="auto_popup_ad_shown"
      onImpression={trackImpression}
      onClick={() => trackClick(50, 50)}
    />
  );
}
