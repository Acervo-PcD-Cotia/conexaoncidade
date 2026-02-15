import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';
import { AnimatePresence, motion } from 'framer-motion';
import { AdSlotWrapper } from '@/components/ads/AdSlotWrapper';

interface LoginPanelAdProps {
  className?: string;
  compact?: boolean;
}

interface CampaignItem {
  id: string;
  name: string;
  advertiser: string | null;
  cta_text: string | null;
  cta_url: string | null;
  assets: { id: string; file_url: string; alt_text: string | null; }[];
}

const ROTATE_INTERVAL = 8000;

export function LoginPanelAd({ className, compact }: LoginPanelAdProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['login-panel-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns_unified')
        .select(`id, name, advertiser, cta_text, cta_url, assets:campaign_assets(id, file_url, alt_text)`)
        .eq('status', 'active')
        .eq('login_panel_visible', true)
        .lte('starts_at', new Date().toISOString())
        .or(`ends_at.is.null,ends_at.gte.${new Date().toISOString()}`)
        .order('priority', { ascending: false });
      if (error) throw error;
      return (data as CampaignItem[])?.filter(c => c.assets && c.assets.length > 0) || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!campaigns || campaigns.length <= 1) return;
    const timer = setInterval(() => setActiveIndex(prev => (prev + 1) % campaigns.length), ROTATE_INTERVAL);
    return () => clearInterval(timer);
  }, [campaigns]);

  useEffect(() => {
    if (campaigns && campaigns.length > 0) {
      campaigns.forEach(campaign => {
        trackCampaignEvent({ campaignId: campaign.id, channelType: 'login_panel', eventType: 'impression' });
      });
    }
  }, [campaigns]);

  const handleClick = useCallback((campaignId: string) => {
    trackCampaignEvent({ campaignId, channelType: 'login_panel', eventType: 'click' });
  }, []);

  // Determine which login format to use based on campaign count
  const loginSlotId = !campaigns || campaigns.length <= 2 ? 'login_formato_01'
    : campaigns.length === 3 ? 'login_formato_03' : 'login_formato_02';
  const expectedW = loginSlotId === 'login_formato_01' ? 800
    : loginSlotId === 'login_formato_02' ? 200 : 400;

  if (isLoading || !campaigns || campaigns.length === 0) {
    return (
      <AdSlotWrapper
        slotId={loginSlotId}
        channel="login"
        placement="login"
        expectedWidth={expectedW}
        expectedHeight={500}
        page="login"
        className={cn(
          "rounded-2xl bg-background/60 backdrop-blur-sm flex items-center justify-center",
          compact ? "h-40" : "h-full min-h-[320px]",
          className
        )}
      >
        <p className="text-muted-foreground/40 text-sm">Espaço publicitário</p>
      </AdSlotWrapper>
    );
  }

  if (compact) {
    const campaign = campaigns[0];
    const asset = campaign.assets[0];
    return (
      <AdSlotWrapper slotId={loginSlotId} channel="login" placement="login" expectedWidth={expectedW} expectedHeight={500} page="login" className={cn("rounded-xl overflow-hidden shadow-sm", className)}>
        {campaign.cta_url ? (
          <a href={campaign.cta_url} target="_blank" rel="noopener noreferrer" onClick={() => handleClick(campaign.id)}>
            <img src={asset.file_url} alt={asset.alt_text || campaign.name} className="w-full h-auto object-cover rounded-xl" loading="eager" />
          </a>
        ) : (
          <img src={asset.file_url} alt={asset.alt_text || campaign.name} className="w-full h-auto object-cover rounded-xl" loading="eager" />
        )}
      </AdSlotWrapper>
    );
  }

  const showGrid4 = campaigns.length >= 4;
  const showGrid2 = campaigns.length === 3;
  const currentCampaign = campaigns[activeIndex % campaigns.length];

  return (
    <AdSlotWrapper slotId={loginSlotId} channel="login" placement="login" expectedWidth={expectedW} expectedHeight={500} page="login" className={cn("flex flex-col gap-4 h-full", className)}>
      <p className="text-[11px] font-medium text-foreground/30 uppercase tracking-widest text-center">Conteúdo de Marca</p>

      {showGrid4 ? (
        <div className="grid grid-cols-2 grid-rows-2 gap-3 flex-1">
          {campaigns.slice(0, 4).map((campaign) => (
            <BannerCard key={campaign.id} campaign={campaign} asset={campaign.assets[0]} onClickTrack={handleClick} aspect="aspect-[4/5]" />
          ))}
        </div>
      ) : showGrid2 ? (
        <div className="grid grid-cols-2 gap-3 flex-1">
          {campaigns.slice(0, 2).map((campaign) => (
            <BannerCard key={campaign.id} campaign={campaign} asset={campaign.assets[0]} onClickTrack={handleClick} aspect="aspect-[3/4]" />
          ))}
        </div>
      ) : (
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-background/60 backdrop-blur-sm shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div key={currentCampaign.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: 'easeInOut' }} className="absolute inset-0">
              <BannerCard campaign={currentCampaign} asset={currentCampaign.assets[0]} onClickTrack={handleClick} fill />
            </motion.div>
          </AnimatePresence>
          {campaigns.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {campaigns.map((_, i) => (
                <button key={i} onClick={() => setActiveIndex(i)} className={cn("w-2 h-2 rounded-full transition-all duration-300", i === activeIndex % campaigns.length ? "bg-primary w-5" : "bg-foreground/20 hover:bg-foreground/40")} aria-label={`Banner ${i + 1}`} />
              ))}
            </div>
          )}
        </div>
      )}
    </AdSlotWrapper>
  );
}

function BannerCard({ campaign, asset, onClickTrack, aspect, fill }: { campaign: CampaignItem; asset: CampaignItem['assets'][0]; onClickTrack: (id: string) => void; aspect?: string; fill?: boolean; }) {
  const imgClass = fill ? "w-full h-full object-cover" : cn("w-full h-full object-cover", aspect);
  const wrapper = cn("group rounded-2xl overflow-hidden bg-background/80 shadow-sm hover:shadow-md transition-shadow duration-300", fill ? "h-full" : aspect);

  const content = (
    <>
      <img src={asset.file_url} alt={asset.alt_text || campaign.name} className={imgClass} loading="eager" />
      {campaign.cta_text && (
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8">
          <span className="text-white text-sm font-medium drop-shadow-sm">{campaign.cta_text}</span>
        </div>
      )}
    </>
  );

  if (campaign.cta_url) {
    return <a href={campaign.cta_url} target="_blank" rel="noopener noreferrer" onClick={() => onClickTrack(campaign.id)} className={cn(wrapper, "relative block")}>{content}</a>;
  }
  return <div className={cn(wrapper, "relative")}>{content}</div>;
}
