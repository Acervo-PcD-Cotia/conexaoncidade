import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';

interface LoginPanelAdProps {
  className?: string;
}

/**
 * LoginPanelAd - Creative displayed on the left side of the login page
 * 
 * Replaces static text with dynamic campaign creative (Publidoor or Story).
 * Features:
 * - Optional short text overlay
 * - CTA opens in new tab
 * - Never blocks login functionality
 */
export function LoginPanelAd({ className }: LoginPanelAdProps) {
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['login-panel-campaign'],
    queryFn: async () => {
      // Fetch active campaign with login_panel channel enabled
      const { data, error } = await supabase
        .from('campaigns_unified')
        .select(`
          id,
          name,
          advertiser,
          cta_text,
          cta_url,
          channels:campaign_channels!inner(
            channel_type,
            enabled,
            config
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
        .order('priority', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      // Check if login_panel channel is enabled
      const loginPanelChannel = data?.channels?.find(
        ch => ch.channel_type === 'login_panel' && ch.enabled
      );

      if (!loginPanelChannel) return null;

      // Get the config for login panel
      const config = loginPanelChannel.config as {
        short_text?: string;
        display_type?: 'publidoor' | 'story';
      } | null;

      // Find the appropriate asset
      const asset = data?.assets?.find(a => 
        a.channel_type === 'login_panel' ||
        a.channel_type === 'publidoor' ||
        a.asset_type === 'story_cover'
      );

      if (!asset) return null;

      return {
        id: data.id,
        name: data.name,
        advertiser: data.advertiser,
        cta_text: data.cta_text,
        cta_url: data.cta_url,
        short_text: config?.short_text,
        asset,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Track impression on mount
  useEffect(() => {
    if (campaign) {
      trackCampaignEvent({
        campaignId: campaign.id,
        channelType: 'login_panel',
        eventType: 'impression',
      });
    }
  }, [campaign]);

  const handleClick = () => {
    if (!campaign) return;
    trackCampaignEvent({
      campaignId: campaign.id,
      channelType: 'login_panel',
      eventType: 'click',
    });
  };

  if (isLoading || !campaign) {
    return null; // Return null to show default branding
  }

  return (
    <div className={cn("relative w-full h-full", className)}>
      {campaign.cta_url ? (
        <a
          href={campaign.cta_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full h-full"
          onClick={handleClick}
        >
          <img
            src={campaign.asset.file_url}
            alt={campaign.asset.alt_text || campaign.name}
            className="w-full h-full object-cover"
          />
          {campaign.short_text && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <p className="text-white text-lg font-medium">
                {campaign.short_text}
              </p>
              {campaign.cta_text && (
                <span className="inline-block mt-2 text-primary-foreground bg-primary px-4 py-2 rounded-lg text-sm font-medium">
                  {campaign.cta_text}
                </span>
              )}
            </div>
          )}
        </a>
      ) : (
        <div className="w-full h-full">
          <img
            src={campaign.asset.file_url}
            alt={campaign.asset.alt_text || campaign.name}
            className="w-full h-full object-cover"
          />
          {campaign.short_text && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <p className="text-white text-lg font-medium">
                {campaign.short_text}
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Brand badge - mandatory per spec */}
      <div className="absolute top-4 left-4">
        <span className="px-2 py-1 bg-black/50 text-white text-xs rounded">
          Conteúdo de Marca
        </span>
      </div>
    </div>
  );
}
