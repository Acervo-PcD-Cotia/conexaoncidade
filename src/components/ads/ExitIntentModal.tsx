import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useExitIntentCampaigns } from '@/hooks/useExitIntent';
import { trackCampaignEvent } from '@/lib/trackCampaignEvent';

const SESSION_KEY = 'exit_intent_shown';

interface ExitIntentModalProps {
  className?: string;
}

/**
 * Exit-Intent Modal (UOL-style)
 * 
 * Layout fixo com 3 espaços:
 * - HERO (Publidoor ou banner grande)
 * - SECUNDÁRIO 1
 * - SECUNDÁRIO 2
 * 
 * Exibe 1x por sessão quando usuário move mouse para fechar aba.
 * Prioridade: Institucional > Editorial > Comercial
 */
export function ExitIntentModal({ className }: ExitIntentModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const { campaigns, isLoading, recordEvent } = useExitIntentCampaigns();

  useEffect(() => {
    // Check if already shown this session
    if (sessionStorage.getItem(SESSION_KEY)) {
      setHasTriggered(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from the top
      if (e.clientY <= 0 && !hasTriggered) {
        setIsVisible(true);
        setHasTriggered(true);
        sessionStorage.setItem(SESSION_KEY, 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasTriggered]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleCTAClick = (campaignId: string, ctaUrl?: string) => {
    trackCampaignEvent({
      campaignId,
      channelType: 'exit_intent',
      eventType: 'cta_click',
      metadata: { cta_url: ctaUrl },
    });
    if (ctaUrl) {
      window.open(ctaUrl, '_blank');
    }
    setIsVisible(false);
  };

  const handleImpression = (campaignId: string) => {
    trackCampaignEvent({
      campaignId,
      channelType: 'exit_intent',
      eventType: 'impression',
    });
  };

  if (!isVisible || isLoading || campaigns.length === 0) {
    return null;
  }

  // Get hero and secondary campaigns
  const heroCampaign = campaigns[0];
  const secondary1 = campaigns[1];
  const secondary2 = campaigns[2];

  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4",
        className
      )}
      onClick={handleDismiss}
    >
      <div 
        className="relative bg-background rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 rounded-full bg-background/80 hover:bg-background"
          onClick={handleDismiss}
        >
          <X className="h-5 w-5" />
        </Button>

        <div className="p-6">
          {/* HERO Space */}
          {heroCampaign && (
            <div 
              className="relative w-full aspect-[21/9] bg-muted rounded-lg overflow-hidden mb-4"
              onLoad={() => handleImpression(heroCampaign.id)}
            >
              {heroCampaign.heroAsset ? (
                <a
                  href={heroCampaign.cta_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleCTAClick(heroCampaign.id, heroCampaign.cta_url)}
                  className="block w-full h-full"
                >
                  <img
                    src={heroCampaign.heroAsset.file_url}
                    alt={heroCampaign.heroAsset.alt_text || heroCampaign.name}
                    className="w-full h-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p>Espaço Publicitário</p>
                </div>
              )}
              <div className="absolute top-2 left-2">
                <span className="px-2 py-0.5 bg-black/50 text-white text-xs rounded">
                  Conteúdo de Marca
                </span>
              </div>
            </div>
          )}

          {/* Secondary Spaces */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {secondary1 && (
              <div 
                className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden"
                onLoad={() => handleImpression(secondary1.id)}
              >
                {secondary1.heroAsset ? (
                  <a
                    href={secondary1.cta_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCTAClick(secondary1.id, secondary1.cta_url)}
                    className="block w-full h-full"
                  >
                    <img
                      src={secondary1.heroAsset.file_url}
                      alt={secondary1.heroAsset.alt_text || secondary1.name}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Secundário 1
                  </div>
                )}
              </div>
            )}
            
            {secondary2 && (
              <div 
                className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden"
                onLoad={() => handleImpression(secondary2.id)}
              >
                {secondary2.heroAsset ? (
                  <a
                    href={secondary2.cta_url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCTAClick(secondary2.id, secondary2.cta_url)}
                    className="block w-full h-full"
                  >
                    <img
                      src={secondary2.heroAsset.file_url}
                      alt={secondary2.heroAsset.alt_text || secondary2.name}
                      className="w-full h-full object-cover"
                    />
                  </a>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    Secundário 2
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Neutral CTA */}
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              onClick={handleDismiss}
              className="min-w-[200px]"
            >
              Continuar navegando
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
