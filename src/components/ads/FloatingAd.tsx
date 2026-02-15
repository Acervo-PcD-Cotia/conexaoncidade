import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFloatingAd } from '@/hooks/useFloatingAd';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AdSlotWrapper } from './AdSlotWrapper';

const SESSION_KEY = 'floating_ad_dismissed';

interface FloatingAdProps {
  className?: string;
}

/**
 * Destaque Flutuante (Formato 14)
 * Banner lateral flutuante fixo (300x600)
 */
export function FloatingAd({ className }: FloatingAdProps) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);
  const { data: campaigns, isLoading } = useFloatingAd();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      setDismissed(true);
      return;
    }
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (visible && campaigns && campaigns.length > 0) {
      trackCampaignEvent({
        campaignId: campaigns[0].id,
        channelType: 'floating_ad',
        eventType: 'impression',
      });
    }
  }, [visible, campaigns]);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(SESSION_KEY, 'true');
  };

  const campaign = campaigns?.[0];
  const asset = campaign?.assets[0];
  const shouldHide = dismissed || isLoading || !campaign || !asset || !visible;

  return (
    <AdSlotWrapper
      slotId="destaque_flutuante"
      channel="experience"
      placement="floating"
      expectedWidth={300}
      expectedHeight={600}
      page="global"
      className={shouldHide ? 'hidden' : ''}
    >
      <AnimatePresence>
        {!shouldHide && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={cn(
              "fixed bottom-4 right-4 z-40 w-[300px] shadow-2xl rounded-lg overflow-hidden",
              className
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 z-10 h-7 w-7 rounded-full bg-black/50 hover:bg-black/70 text-white"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>

            {campaign.cta_url ? (
              <a
                href={campaign.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCampaignEvent({
                  campaignId: campaign.id,
                  channelType: 'floating_ad',
                  eventType: 'click',
                })}
              >
                <img
                  src={asset.file_url}
                  alt={asset.alt_text || campaign.name}
                  className="w-full h-auto object-cover"
                  style={{ aspectRatio: '1/2' }}
                />
              </a>
            ) : (
              <img
                src={asset.file_url}
                alt={asset.alt_text || campaign.name}
                className="w-full h-auto object-cover"
                style={{ aspectRatio: '1/2' }}
              />
            )}

            <div className="absolute bottom-1 left-1">
              <span className="px-1.5 py-0.5 bg-black/40 text-white text-[10px] rounded">
                Publicidade
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdSlotWrapper>
  );
}
