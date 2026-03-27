import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDeviceType } from './useDeviceType';
import { useAdMetrics } from './useAdMetrics';
import type { AdFormatKey } from '@/lib/adFormats';
import { slotTypeToFormatKey } from '@/lib/adFormats';

/**
 * Maps canonical slot IDs to all legacy aliases stored in the database.
 * Allows the query to find ads regardless of which naming convention was used.
 */
const SLOT_ALIASES: Record<string, string[]> = {
  leaderboard: ['leaderboard', 'home_top'],
  super_banner: ['super_banner', 'home_banner'],
  retangulo_medio: ['retangulo_medio', 'rectangle', 'sidebar', 'content'],
  arranha_ceu: ['arranha_ceu', 'skyscraper'],
  popup: ['popup'],
  'guia-below-ad': ['guia-below-ad', 'leaderboard', 'home_top'],
  banner_fullwidth: ['banner_fullwidth', 'guia-below-ad', 'leaderboard', 'home_top'],
};

function getSlotAliases(slotId: string): string[] {
  return SLOT_ALIASES[slotId] || [slotId];
}

interface AdData {
  id: string;
  image_url: string;
  alt_text?: string;
  link_url?: string;
  link_target?: string;
  name?: string;
  title?: string;
  campaignId?: string;
}

interface UseAdUnitOptions {
  format: AdFormatKey;
  slotId: string;
  source?: 'publidoor' | 'ads';
  enabled?: boolean;
}

/**
 * Hook to fetch and display ads from legacy 'ads' table, 'publidoor' system,
 * or from unified 360 campaigns (campaign_assets) as fallback.
 */
export function useAdUnit({ format, slotId, source = 'ads', enabled = true }: UseAdUnitOptions) {
  const device = useDeviceType();

  const { data: ad, isLoading, error } = useQuery({
    queryKey: ['ad-unit', slotId, source, device],
    queryFn: async (): Promise<AdData | null> => {
      const now = new Date().toISOString();

      if (source === 'ads') {
        // 1. Try legacy ads table first
        const { data: legacyAd, error: legacyError } = await supabase
          .from('ads')
          .select('id, image_url, alt_text, link_url, link_target, name')
          .in('slot_type', getSlotAliases(slotId))
          .eq('is_active', true)
          .or(`starts_at.is.null,starts_at.lte.${now}`)
          .or(`ends_at.is.null,ends_at.gte.${now}`)
          .order('sort_order')
          .limit(1)
          .maybeSingle();

        if (legacyError) console.warn('[useAdUnit] legacy error:', legacyError);
        if (legacyAd) return legacyAd;

        // 2. Fallback: fetch from campaigns_unified (360 system)
        const campaign360Ad = await fetchCampaign360Ad(slotId, now);
        if (campaign360Ad) return campaign360Ad;

        return null;
      } else {
        // Fetch from publidoor system
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
    staleTime: 60000,
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

/**
 * Fetch ad from campaigns_unified (360 system) matching the given slot.
 * Looks for active campaigns with 'ads' channel enabled and matching slot_type config.
 */
async function fetchCampaign360Ad(slotId: string, now: string): Promise<AdData | null> {
  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns_unified')
      .select(`
        id,
        name,
        cta_url,
        cta_text,
        priority,
        channels:campaign_channels!inner(
          channel_type,
          enabled,
          config
        ),
        assets:campaign_assets(
          id,
          file_url,
          alt_text,
          channel_type
        )
      `)
      .eq('status', 'active')
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gte.${now}`)
      .order('priority', { ascending: false })
      .limit(10);

    if (error || !campaigns) return null;

    // Pass 1: exact slot_type match
    for (const campaign of campaigns) {
      const adsChannel = campaign.channels?.find(
        (ch: any) => ch.channel_type === 'ads' && ch.enabled
      );
      if (!adsChannel) continue;

      const channelConfig = adsChannel.config as Record<string, any> | null;
      const configSlot = channelConfig?.slot_type;

      // Only exact match or no slot specified
      if (configSlot && configSlot !== slotId) continue;

      const asset = campaign.assets?.find(
        (a: any) => a.channel_type === 'ads'
      );

      if (asset?.file_url) {
        return {
          id: asset.id,
          image_url: asset.file_url,
          alt_text: asset.alt_text || campaign.name,
          link_url: campaign.cta_url || undefined,
          link_target: '_blank',
          name: campaign.name,
          campaignId: campaign.id,
        };
      }
    }

    // Pass 2: fallback — any active 360 campaign with ads channel (fill empty slots)
    for (const campaign of campaigns) {
      const adsChannel = campaign.channels?.find(
        (ch: any) => ch.channel_type === 'ads' && ch.enabled
      );
      if (!adsChannel) continue;

      const asset = campaign.assets?.find(
        (a: any) => a.channel_type === 'ads'
      );

      if (asset?.file_url) {
        return {
          id: asset.id,
          image_url: asset.file_url,
          alt_text: asset.alt_text || campaign.name,
          link_url: campaign.cta_url || undefined,
          link_target: '_blank',
          name: campaign.name,
          campaignId: campaign.id,
        };
      }
    }

    return null;
  } catch (err) {
    console.warn('[useAdUnit] campaign360 fallback error:', err);
    return null;
  }
}
