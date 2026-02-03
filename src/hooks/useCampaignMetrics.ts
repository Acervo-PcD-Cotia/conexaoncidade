import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  CampaignMetrics, 
  ChannelType, 
  EventType 
} from '@/types/campaigns-unified';
import { CHANNEL_TYPES } from '@/types/campaigns-unified';
import { asJson, parseJsonObject } from '@/types/json';
import type { Json } from '@/integrations/supabase/types';

interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Fetch aggregated metrics for a campaign
 */
export function useCampaignMetrics(campaignId: string | undefined, dateRange?: DateRange) {
  return useQuery({
    queryKey: ['campaign-metrics', campaignId, dateRange],
    queryFn: async (): Promise<CampaignMetrics | null> => {
      if (!campaignId) return null;

      let query = supabase
        .from('campaign_events')
        .select('*')
        .eq('campaign_id', campaignId);

      if (dateRange?.startDate) {
        query = query.gte('created_at', dateRange.startDate);
      }
      if (dateRange?.endDate) {
        query = query.lte('created_at', dateRange.endDate);
      }

      const { data: events, error } = await query;
      if (error) throw error;

      // Transform events to internal type
      const transformedEvents: MetricEvent[] = (events || []).map(e => ({
        ...e,
        metadata: parseJsonObject(e.metadata as Json, {}),
      }));

      return calculateMetrics(campaignId, transformedEvents);
    },
    enabled: !!campaignId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Track a campaign event (impression, click, etc.)
 */
// Internal type for metrics calculation
interface MetricEvent {
  id: string;
  campaign_id: string;
  channel_type: ChannelType;
  event_type: EventType;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function useTrackCampaignEvent() {
  return useMutation({
    mutationFn: async ({
      campaignId,
      channelType,
      eventType,
      metadata = {},
    }: {
      campaignId: string;
      channelType: ChannelType;
      eventType: EventType;
      metadata?: Record<string, unknown>;
    }): Promise<void> => {
      const { error } = await supabase
        .from('campaign_events')
        .insert([{
          campaign_id: campaignId,
          channel_type: channelType,
          event_type: eventType,
          metadata: asJson(metadata),
        }]);

      if (error) throw error;
    },
  });
}

/**
 * Track impression with frequency cap check
 */
export function useTrackImpression() {
  const trackEvent = useTrackCampaignEvent();

  return {
    ...trackEvent,
    mutate: (params: {
      campaignId: string;
      channelType: ChannelType;
      frequencyCap?: number;
      metadata?: Record<string, unknown>;
    }) => {
      const { campaignId, frequencyCap, channelType, metadata } = params;

      // Check frequency cap
      if (frequencyCap && frequencyCap > 0) {
        if (!checkFrequencyCap(campaignId, frequencyCap)) {
          return; // Skip if cap reached
        }
      }

      trackEvent.mutate({
        campaignId,
        channelType,
        eventType: 'impression',
        metadata,
      });
    },
  };
}

// Helper functions
function calculateMetrics(campaignId: string, events: MetricEvent[]): CampaignMetrics {
  const impressions = events.filter(e => e.event_type === 'impression');
  const clicks = events.filter(e => e.event_type === 'click');
  const ctaClicks = events.filter(e => e.event_type === 'cta_click');
  const pushSent = events.filter(e => e.event_type === 'push_sent');
  const pushDelivered = events.filter(e => e.event_type === 'push_delivered');
  const newsletterSent = events.filter(e => e.event_type === 'newsletter_sent');
  const newsletterOpens = events.filter(e => e.event_type === 'newsletter_open');

  const totalImpressions = impressions.length;
  const totalClicks = clicks.length;
  const totalCtaClicks = ctaClicks.length;
  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  // Group by channel (using CHANNEL_TYPES as source of truth)
  const byChannel = CHANNEL_TYPES.map(channel => {
    const channelImpressions = impressions.filter(e => e.channel_type === channel).length;
    const channelClicks = clicks.filter(e => e.channel_type === channel).length;
    return {
      channel_type: channel,
      impressions: channelImpressions,
      clicks: channelClicks,
      ctr: channelImpressions > 0 ? (channelClicks / channelImpressions) * 100 : 0,
    };
  }).filter(c => c.impressions > 0 || c.clicks > 0);

  // Group by device (from metadata)
  const deviceMap = new Map<string, { impressions: number; clicks: number }>();
  
  impressions.forEach(e => {
    const device = (e.metadata as Record<string, unknown>)?.device as string || 'desktop';
    const current = deviceMap.get(device) || { impressions: 0, clicks: 0 };
    current.impressions++;
    deviceMap.set(device, current);
  });
  
  clicks.forEach(e => {
    const device = (e.metadata as Record<string, unknown>)?.device as string || 'desktop';
    const current = deviceMap.get(device) || { impressions: 0, clicks: 0 };
    current.clicks++;
    deviceMap.set(device, current);
  });

  const byDevice = Array.from(deviceMap.entries()).map(([device, stats]) => ({
    device,
    ...stats,
  }));

  // Group by cycle (from metadata)
  const cycleMap = new Map<string, { cycle_name: string; impressions: number; clicks: number; push_sent: number; newsletter_sent: number }>();
  
  events.forEach(e => {
    const cycleId = (e.metadata as Record<string, unknown>)?.cycle_id as string;
    const cycleName = (e.metadata as Record<string, unknown>)?.cycle_name as string || 'Default';
    if (cycleId) {
      const current = cycleMap.get(cycleId) || { cycle_name: cycleName, impressions: 0, clicks: 0, push_sent: 0, newsletter_sent: 0 };
      if (e.event_type === 'impression') current.impressions++;
      if (e.event_type === 'click') current.clicks++;
      if (e.event_type === 'push_sent') current.push_sent++;
      if (e.event_type === 'newsletter_sent') current.newsletter_sent++;
      cycleMap.set(cycleId, current);
    }
  });

  const byCycle = cycleMap.size > 0 
    ? Object.fromEntries(cycleMap.entries())
    : undefined;

  return {
    campaign_id: campaignId,
    total_impressions: totalImpressions,
    total_clicks: totalClicks,
    total_cta_clicks: totalCtaClicks,
    ctr,
    by_channel: byChannel,
    by_device: byDevice,
    by_cycle: byCycle,
    push_metrics: pushSent.length > 0 ? {
      total_sent: pushSent.length,
      total_delivered: pushDelivered.length,
    } : undefined,
    newsletter_metrics: newsletterSent.length > 0 ? {
      total_sent: newsletterSent.length,
      total_opens: newsletterOpens.length,
      open_rate: newsletterSent.length > 0 ? (newsletterOpens.length / newsletterSent.length) * 100 : 0,
    } : undefined,
  };
}

/**
 * Check if frequency cap has been reached for today
 */
function checkFrequencyCap(campaignId: string, cap: number): boolean {
  const key = `campaign_${campaignId}_views`;
  const today = new Date().toDateString();
  
  try {
    const stored = sessionStorage.getItem(key);
    const data = stored ? JSON.parse(stored) : { date: '', count: 0 };
    
    if (data.date !== today) {
      sessionStorage.setItem(key, JSON.stringify({ date: today, count: 1 }));
      return true;
    }
    
    if (data.count >= cap) {
      return false;
    }
    
    data.count++;
    sessionStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return true; // Allow on error
  }
}

/**
 * Get active campaigns for a specific channel and optional slot
 */
export function useActiveCampaigns(channel: ChannelType, slotId?: string) {
  return useQuery({
    queryKey: ['active-campaigns', channel, slotId],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('campaigns_unified')
        .select(`
          *,
          channels:campaign_channels!inner(*),
          assets:campaign_assets(*)
        `)
        .eq('status', 'active')
        .eq('channels.channel_type', channel)
        .eq('channels.enabled', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('priority', { ascending: false });

      if (error) throw error;

      // Filter by slot if provided (for ads channel)
      let campaigns = data || [];
      if (slotId && channel === 'ads') {
        campaigns = campaigns.filter(c => {
          const adsChannel = c.channels?.find(
            (ch: { channel_type: string }) => ch.channel_type === 'ads'
          );
          const config = adsChannel?.config as { slot_type?: string } | undefined;
          return config?.slot_type === slotId;
        });
      }

      return campaigns;
    },
    staleTime: 60000, // 1 minute
  });
}
