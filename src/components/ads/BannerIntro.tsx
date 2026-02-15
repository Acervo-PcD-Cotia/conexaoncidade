import { useEffect } from 'react';
import { useBannerIntro } from '@/hooks/useBannerIntro';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';
import { cn } from '@/lib/utils';
import { AdSlotWrapper } from './AdSlotWrapper';
import { AdLabel } from './AdLabel';
import { useAdDebugLevel } from '@/hooks/useAdDebugLevel';

interface BannerIntroProps {
  className?: string;
}

/**
 * Banner Intro (Formato 13)
 * Banner de entrada na primeira dobra da Home (970x250)
 */
export function BannerIntro({ className }: BannerIntroProps) {
  const { data: campaigns, isLoading } = useBannerIntro();
  const adDebugLevel = useAdDebugLevel();

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      campaigns.forEach(campaign => {
        trackCampaignEvent({
          campaignId: campaign.id,
          channelType: 'banner_intro',
          eventType: 'impression',
        });
      });
    }
  }, [campaigns]);

  const campaign = campaigns?.[0];
  const asset = campaign?.assets[0];

  return (
    <AdSlotWrapper
      slotId="banner_intro"
      channel="experience"
      placement="intro"
      expectedWidth={970}
      expectedHeight={250}
      page="home"
      className={cn("container py-2", className)}
    >
      {isLoading || !campaign || !asset ? null : (
        <div className="relative w-full overflow-hidden rounded-lg" style={{ aspectRatio: '97/25' }}>
          {campaign.cta_url ? (
            <a
              href={campaign.cta_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackCampaignEvent({
                campaignId: campaign.id,
                channelType: 'banner_intro',
                eventType: 'click',
              })}
              className="block w-full h-full"
            >
              <img
                src={asset.file_url}
                alt={asset.alt_text || campaign.name}
                className="w-full h-full object-contain"
                loading="lazy"
              />
            </a>
          ) : (
            <img
              src={asset.file_url}
              alt={asset.alt_text || campaign.name}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          )}
          <div className="absolute top-1 right-1">
            <AdLabel
              level={adDebugLevel}
              adType="BANNER INTRO"
              adId={campaign.id}
              variant="EXPERIENCE"
              position="INTRO"
              area="HOME"
              campaignId={campaign.id}
              overlay
            />
          </div>
        </div>
      )}
    </AdSlotWrapper>
  );
}
