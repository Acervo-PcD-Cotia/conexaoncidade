import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LoginPanelAdProps {
  className?: string;
}

interface CampaignItem {
  id: string;
  name: string;
  advertiser: string | null;
  cta_text: string | null;
  cta_url: string | null;
  assets: {
    id: string;
    file_url: string;
    alt_text: string | null;
  }[];
}

export function LoginPanelAd({ className }: LoginPanelAdProps) {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['login-panel-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns_unified')
        .select(`
          id,
          name,
          advertiser,
          cta_text,
          cta_url,
          assets:campaign_assets(
            id,
            file_url,
            alt_text
          )
        `)
        .eq('status', 'active')
        .eq('login_panel_visible', true)
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('priority', { ascending: false });

      if (error) throw error;
      
      // Filter campaigns that have at least one asset
      return (data as CampaignItem[])?.filter(c => c.assets && c.assets.length > 0) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Track impressions
  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      campaigns.forEach(campaign => {
        trackCampaignEvent({
          campaignId: campaign.id,
          channelType: 'login_panel',
          eventType: 'impression',
        });
      });
    }
  }, [campaigns]);

  const handleClick = (campaignId: string) => {
    trackCampaignEvent({
      campaignId,
      channelType: 'login_panel',
      eventType: 'click',
    });
  };

  if (isLoading || !campaigns || campaigns.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <p className="text-xs font-medium text-yellow-800/60 uppercase tracking-wider text-center">
        Conteúdo de Marca
      </p>
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-4">
          {campaigns.map((campaign) => {
            const asset = campaign.assets[0];
            return (
              <div key={campaign.id} className="rounded-xl overflow-hidden shadow-md bg-white/80">
                {campaign.cta_url ? (
                  <a
                    href={campaign.cta_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleClick(campaign.id)}
                    className="block"
                  >
                    <img
                      src={asset.file_url}
                      alt={asset.alt_text || campaign.name}
                      className="w-full h-auto object-cover"
                    />
                    {campaign.cta_text && (
                      <div className="p-3 text-center">
                        <span className="text-sm font-medium text-primary hover:underline">
                          {campaign.cta_text}
                        </span>
                      </div>
                    )}
                  </a>
                ) : (
                  <img
                    src={asset.file_url}
                    alt={asset.alt_text || campaign.name}
                    className="w-full h-auto object-cover"
                  />
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
