import { Button } from '@/components/ui/button';
import { ExternalLink, ShoppingCart, AlertCircle } from 'lucide-react';
import { usePhoneOffers, type PhoneOffer } from '@/hooks/usePhoneOffers';
import { Skeleton } from '@/components/ui/skeleton';

interface PhoneOfferButtonsProps {
  phoneId: string;
}

export function PhoneOfferButtons({ phoneId }: PhoneOfferButtonsProps) {
  const { activeOffers, isLoadingActiveOffers, trackClick, getBestOffer, getSecondaryOffers } = usePhoneOffers(phoneId);

  const handleOfferClick = (offer: PhoneOffer) => {
    // Track the click
    trackClick.mutate({
      offerId: offer.id,
      phoneId: offer.phone_id,
      store: offer.store,
    });

    // Open link in new tab
    window.open(offer.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  const getButtonText = (offer: PhoneOffer, isPrimary: boolean) => {
    if (offer.button_text) return offer.button_text;
    if (isPrimary) {
      return offer.price ? `Melhor oferta - ${formatPrice(offer.price)}` : 'Melhor oferta';
    }
    return `Comprar na ${offer.store}`;
  };

  if (isLoadingActiveOffers) {
    return (
      <div className="space-y-3 mt-4 pt-4 border-t">
        <Skeleton className="h-11 w-full" />
        <div className="flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
        </div>
      </div>
    );
  }

  if (activeOffers.length === 0) {
    return (
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center gap-2 text-muted-foreground text-sm p-3 rounded-lg bg-muted/50">
          <AlertCircle className="w-4 h-4" />
          <span>Ofertas indisponíveis no momento</span>
        </div>
      </div>
    );
  }

  const bestOffer = getBestOffer();
  const secondaryOffers = getSecondaryOffers();

  return (
    <div className="space-y-3 mt-4 pt-4 border-t">
      {/* Primary offer button */}
      {bestOffer && (
        <Button
          onClick={() => handleOfferClick(bestOffer)}
          className="w-full h-11 gap-2 bg-primary hover:bg-primary/90"
          size="lg"
        >
          <ShoppingCart className="w-4 h-4" />
          {getButtonText(bestOffer, true)}
          <ExternalLink className="w-3.5 h-3.5 ml-auto" />
        </Button>
      )}

      {/* Secondary offer buttons */}
      {secondaryOffers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {secondaryOffers.map((offer) => (
            <Button
              key={offer.id}
              onClick={() => handleOfferClick(offer)}
              variant="outline"
              size="sm"
              className="flex-1 min-w-[120px] gap-1.5"
            >
              {getButtonText(offer, false)}
              <ExternalLink className="w-3 h-3" />
            </Button>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center">
        Links de afiliado. Podemos receber comissão pelas compras.
      </p>
    </div>
  );
}
