import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { EventType } from '@/types/campaigns-unified';

interface ExitIntentAsset {
  id: string;
  file_url: string;
  alt_text?: string;
  width?: number;
  height?: number;
}

interface ExitIntentCampaign {
  id: string;
  name: string;
  advertiser: string;
  priority: number;
  cta_text?: string;
  cta_url?: string;
  heroAsset?: ExitIntentAsset;
}

/**
 * Hook to fetch active campaigns configured for exit-intent channel
 * Sorted by priority: institutional > editorial > commercial
 */
export function useExitIntentCampaigns() {
  const query = useQuery({
    queryKey: ['exit-intent-campaigns'],
    queryFn: async () => {
      // Fetch active campaigns with exit_intent channel enabled
      const { data: campaigns, error } = await supabase
        .from('campaigns_unified')
        .select(`
          id,
          name,
          advertiser,
          priority,
          cta_text,
          cta_url,
          channels:campaign_channels!inner(
            channel_type,
            enabled
          ),
          assets:campaign_assets(
            id,
            asset_type,
            file_url,
            alt_text,
            width,
            height,
            channel_type
          )
        `)
        .eq('status', 'active')
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('priority', { ascending: false });

      if (error) throw error;

      // Filter for exit_intent channel and transform
      const exitIntentCampaigns: ExitIntentCampaign[] = (campaigns || [])
        .filter(campaign => 
          campaign.channels?.some(ch => 
            ch.channel_type === 'exit_intent' && ch.enabled
          )
        )
        .map(campaign => {
          const asset = campaign.assets?.find(a => 
            a.channel_type === 'exit_intent' || 
            a.channel_type === 'publidoor' ||
            a.asset_type === 'banner'
          );

          return {
            id: campaign.id,
            name: campaign.name,
            advertiser: campaign.advertiser,
            priority: campaign.priority || 0,
            cta_text: campaign.cta_text || undefined,
            cta_url: campaign.cta_url || undefined,
            heroAsset: asset ? {
              id: asset.id,
              file_url: asset.file_url,
              alt_text: asset.alt_text || undefined,
              width: asset.width || undefined,
              height: asset.height || undefined,
            } : undefined,
          };
        })
        .slice(0, 3); // Max 3 for exit-intent layout

      return exitIntentCampaigns;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const recordEventMutation = useMutation({
    mutationFn: async ({ campaignId, eventType }: { campaignId: string; eventType: EventType }) => {
      const { error } = await supabase
        .from('campaign_events')
        .insert([{
          campaign_id: campaignId,
          event_type: eventType,
          channel_type: 'exit_intent' as const,
          session_id: getSessionId(),
        }]);
      
      if (error) throw error;
    },
    onError: (error) => {
      console.error('[useExitIntent] Failed to record event:', error);
    },
  });

  const recordEvent = (campaignId: string, eventType: EventType) => {
    recordEventMutation.mutate({ campaignId, eventType });
  };

  return {
    campaigns: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    recordEvent,
  };
}

// Generate/get session ID for tracking
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}
