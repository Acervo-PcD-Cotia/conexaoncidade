import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDeviceType } from "@/hooks/useDeviceType";
import { AD_FORMATS, type DeviceType } from "@/lib/adFormats";
import { trackCampaignEvent } from "@/lib/trackCampaignEvent";
import { AdSlotWrapper } from "@/components/ads/AdSlotWrapper";
import { AdLabel } from "@/components/ads/AdLabel";
import { useAdDebugLevel } from "@/hooks/useAdDebugLevel";
import { cn } from "@/lib/utils";

interface BannerItem {
  id: string;
  image_url: string;
  alt_text?: string | null;
  title?: string | null;
  link_url?: string | null;
  link_target?: string | null;
  click_count?: number;
  source: 'legacy' | 'campaign360';
  campaignId?: string;
}

export function SuperBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const trackedImpressions = useRef<Set<string>>(new Set());
  const device = useDeviceType();
  const adDebugLevel = useAdDebugLevel();
  
  const formatConfig = AD_FORMATS.SUPER_BANNER_TOPO;

  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const stored = sessionStorage.getItem("banner_session_id");
    if (stored) return stored;
    const newId = crypto.randomUUID();
    sessionStorage.setItem("banner_session_id", newId);
    return newId;
  }, []);

  const { data: banners = [] } = useQuery({
    queryKey: ["super-banners-unified"],
    queryFn: async (): Promise<BannerItem[]> => {
      const now = new Date().toISOString();
      const results: BannerItem[] = [];

      // 1. Fetch legacy super_banners
      const { data: legacyBanners } = await supabase
        .from("super_banners")
        .select("*")
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("sort_order")
        .limit(7);

      if (legacyBanners) {
        for (const b of legacyBanners) {
          results.push({
            id: b.id,
            image_url: b.image_url,
            alt_text: b.alt_text || b.title,
            title: b.title,
            link_url: b.link_url,
            link_target: b.link_target,
            click_count: b.click_count || 0,
            source: 'legacy',
          });
        }
      }

      // 2. Fetch campaigns 360 with 'ads' channel for home_top/super_banner slots
      const { data: campaigns } = await supabase
        .from("campaigns_unified")
        .select(`
          id,
          name,
          cta_url,
          priority,
          channels:campaign_channels!inner(
            channel_type,
            enabled,
            config
          ),
          assets:campaign_assets(
            id,
            file_url,
            alt_text,
            channel_type
          )
        `)
        .eq("status", "active")
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("priority", { ascending: false })
        .limit(5);

      if (campaigns) {
        for (const c of campaigns) {
          const adsChannel = c.channels?.find(
            (ch: any) => ch.channel_type === 'ads' && ch.enabled
          );
          if (!adsChannel) continue;

          const config = adsChannel.config as Record<string, any> | null;
          const slot = config?.slot_type;
          if (slot && !['home_top', 'home_banner', 'super_banner'].includes(slot)) continue;

          const asset = c.assets?.find((a: any) => a.channel_type === 'ads');
          if (asset?.file_url) {
            const alreadyExists = results.some(r => r.image_url === asset.file_url);
            if (!alreadyExists) {
              results.push({
                id: asset.id,
                image_url: asset.file_url,
                alt_text: asset.alt_text || c.name,
                title: c.name,
                link_url: c.cta_url,
                link_target: '_blank',
                click_count: 0,
                source: 'campaign360',
                campaignId: c.id,
              });
            }
          }
        }
      }

      return results;
    },
  });

  const goToNext = useCallback(() => {
    if (banners.length === 0 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [banners.length, isTransitioning]);

  const goToPrev = useCallback(() => {
    if (banners.length === 0 || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsTransitioning(false), 600);
  }, [banners.length, isTransitioning]);

  const goToSlide = (index: number) => {
    if (isTransitioning || index === currentIndex) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [isPaused, goToNext, banners.length]);

  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  // Track impressions
  useEffect(() => {
    if (banners.length === 0 || !sessionId) return;
    const currentBanner = banners[currentIndex];
    if (!currentBanner) return;
    
    const impressionKey = `${currentBanner.id}-${sessionId}`;
    if (trackedImpressions.current.has(impressionKey)) return;
    trackedImpressions.current.add(impressionKey);
    
    if (currentBanner.source === 'legacy') {
      supabase
        .from("banner_impressions")
        .insert({ banner_id: currentBanner.id, session_id: sessionId })
        .then();
    } else if (currentBanner.campaignId) {
      trackCampaignEvent({
        campaignId: currentBanner.campaignId,
        channelType: 'ads',
        eventType: 'impression',
        metadata: { slot: 'super_banner', device },
      });
    }
  }, [currentIndex, banners, sessionId, device]);

  const handleBannerClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    banner: BannerItem
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const bannerWidth = Math.round(rect.width);
    const bannerHeight = Math.round(rect.height);

    if (banner.source === 'legacy') {
      supabase
        .from("super_banners")
        .update({ click_count: (banner.click_count || 0) + 1 })
        .eq("id", banner.id)
        .then();

      supabase
        .from("banner_clicks")
        .insert({
          banner_id: banner.id,
          session_id: sessionId,
          user_agent: navigator.userAgent,
          referer: document.referrer || null,
          click_x: clickX,
          click_y: clickY,
          banner_width: bannerWidth,
          banner_height: bannerHeight,
        })
        .then();
    } else if (banner.campaignId) {
      trackCampaignEvent({
        campaignId: banner.campaignId,
        channelType: 'ads',
        eventType: 'click',
        metadata: { slot: 'super_banner', clickX, clickY, device },
      });
    }
  };

  // Calculate 3D transform for each slide based on its position relative to current
  const getSlideStyle = (index: number): React.CSSProperties => {
    const total = banners.length;
    if (total === 0) return {};

    // Calculate relative position (-2, -1, 0, 1, 2, etc.)
    let diff = index - currentIndex;
    // Wrap around for infinite feel
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    const isActive = diff === 0;
    const isAdjacent = Math.abs(diff) === 1;
    const isVisible = Math.abs(diff) <= 2;

    if (!isVisible) {
      return {
        opacity: 0,
        pointerEvents: 'none',
        transform: `translate3d(${diff > 0 ? '100%' : '-100%'}, 0, -200px) scale(0.5)`,
        zIndex: 0,
      };
    }

    if (isActive) {
      return {
        opacity: 1,
        zIndex: 10,
        transform: 'translate3d(0, 0, 0) scale(1)',
        transformOrigin: 'center center',
        pointerEvents: 'auto',
      };
    }

    if (isAdjacent) {
      const translateX = diff > 0 ? 'calc(78% + 0px)' : 'calc(-78% + 0px)';
      const origin = diff > 0 ? 'left center' : 'right center';
      return {
        opacity: 1,
        zIndex: 5,
        transform: `translate3d(${translateX}, 0, -60px) scale(0.7)`,
        transformOrigin: origin,
        pointerEvents: 'auto',
      };
    }

    // Far slides
    const translateX = diff > 0 ? 'calc(120% + 0px)' : 'calc(-120% + 0px)';
    const origin = diff > 0 ? 'left center' : 'right center';
    return {
      opacity: 0.5,
      zIndex: 2,
      transform: `translate3d(${translateX}, 0, -120px) scale(0.5)`,
      transformOrigin: origin,
      pointerEvents: 'none',
    };
  };

  if (banners.length === 0) {
    return (
      <AdSlotWrapper
        slotId="super_banner"
        channel="ads"
        placement="top"
        expectedWidth={970}
        expectedHeight={250}
        page="home"
      />
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <AdSlotWrapper
      slotId="super_banner"
      channel="ads"
      placement="top"
      expectedWidth={970}
      expectedHeight={250}
      page="home"
    >
      <div
        className="relative w-full max-w-[1600px] mx-auto px-2"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{ perspective: '1200px' }}
      >
        {/* Ad label */}
        <div className="absolute left-2 top-2 z-20">
          <AdLabel
            level={adDebugLevel}
            adType="MEGA DESTAQUE"
            adId={currentBanner?.id}
            variant="ADS"
            position="TOPO"
            area="HOME"
            campaignId={currentBanner?.campaignId}
            overlay
          />
        </div>

        {/* 3D Carousel Container */}
        <div 
          className="relative w-full overflow-hidden"
           style={{ 
            aspectRatio: '970/250',
            maxHeight: '250px',
            transformStyle: 'preserve-3d',
          }}
        >
          {banners.map((banner, index) => (
            <a
              key={banner.id}
              href={banner.link_url || "#"}
              target={banner.link_target || "_blank"}
              rel="noopener noreferrer"
              className={cn(
                "absolute inset-0 w-[60%] mx-auto rounded-xl overflow-hidden shadow-2xl",
                "transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
                index === currentIndex && "ring-0",
                index !== currentIndex && "cursor-pointer"
              )}
              style={getSlideStyle(index)}
              onClick={(e) => {
                // If clicking a side slide, navigate to it instead
                let diff = index - currentIndex;
                if (diff > banners.length / 2) diff -= banners.length;
                if (diff < -banners.length / 2) diff += banners.length;
                
                if (diff !== 0) {
                  e.preventDefault();
                  goToSlide(index);
                } else {
                  handleBannerClick(e, banner);
                }
              }}
            >
              <img
                src={banner.image_url}
                alt={banner.alt_text || banner.title || "Banner promocional"}
                className="w-full h-full object-cover"
                loading={index <= 2 ? "eager" : "lazy"}
                decoding="async"
              />
              {/* Subtle gradient overlay on side slides */}
              {index !== currentIndex && (
                <div className="absolute inset-0 bg-black/20" />
              )}
            </a>
          ))}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground backdrop-blur-sm shadow-lg border border-border/50 hover:bg-background hover:text-foreground md:left-4 md:h-12 md:w-12"
              onClick={(e) => { e.preventDefault(); goToPrev(); }}
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 z-20 h-10 w-10 -translate-y-1/2 rounded-full bg-background/80 text-foreground backdrop-blur-sm shadow-lg border border-border/50 hover:bg-background hover:text-foreground md:right-4 md:h-12 md:w-12"
              onClick={(e) => { e.preventDefault(); goToNext(); }}
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </Button>
          </>
        )}

        {/* Dot indicators below carousel */}
        {banners.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); goToSlide(index); }}
                className={cn(
                  "rounded-full transition-all duration-300",
                  index === currentIndex
                    ? "h-2.5 w-7 bg-primary"
                    : "h-2.5 w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Title below carousel (Sympla style) */}
        {currentBanner?.title && (
          <h3 className="text-center mt-3 text-lg md:text-xl font-bold text-foreground tracking-tight truncate px-4">
            {currentBanner.title}
          </h3>
        )}
      </div>
    </AdSlotWrapper>
  );
}
