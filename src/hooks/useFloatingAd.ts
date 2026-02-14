import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FloatingAdCampaign {
  id: string;
  name: string;
  cta_text: string | null;
  cta_url: string | null;
  assets: { id: string; file_url: string; alt_text: string | null }[];
}

export function useFloatingAd() {
  return useQuery({
    queryKey: ['floating-ad-campaigns'],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data: channels } = await supabase
        .from('campaign_channels')
        .select('campaign_id')
        .eq('channel_type', 'floating_ad' as any)
        .eq('enabled', true);

      if (!channels || channels.length === 0) return [];

      const campaignIds = channels.map(c => c.campaign_id);

      const { data, error } = await supabase
        .from('campaigns_unified')
        .select(`
          id, name, cta_text, cta_url,
          assets:campaign_assets(id, file_url, alt_text)
        `)
        .in('id', campaignIds)
        .eq('status', 'active')
        .lte('starts_at', now)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('priority', { ascending: false })
        .limit(1);

      if (error) throw error;
      return (data as FloatingAdCampaign[])?.filter(c => c.assets?.length > 0) || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
