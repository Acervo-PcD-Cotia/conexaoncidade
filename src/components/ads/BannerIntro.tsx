import { useEffect } from 'react';
import { useBannerIntro } from '@/hooks/useBannerIntro';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';
import { cn } from '@/lib/utils';

interface BannerIntroProps {
  className?: string;
}

/**
 * Banner Intro (Formato 13)
 * Banner de entrada na primeira dobra da Home (970x250)
 * Busca campanhas 360 com canal banner_intro ativo
 */
export function BannerIntro({ className }: BannerIntroProps) {
  const { data: campaigns, isLoading } = useBannerIntro();

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

  if (isLoading || !campaigns || campaigns.length === 0) return null;

  const campaign = campaigns[0];
  const asset = campaign.assets[0];

  return (
    <div className={cn("container py-2", className)}>
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
          <span className="px-1.5 py-0.5 bg-black/40 text-white text-[10px] rounded">
            Publicidade
          </span>
        </div>
      </div>
    </div>
  );
}
