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
        .lte("starts_at", now)
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
          // Only include if slot is for top banner area
          if (slot && !['home_top', 'home_banner', 'super_banner'].includes(slot)) continue;

          const asset = c.assets?.find((a: any) => a.channel_type === 'ads');
          if (asset?.file_url) {
            // Avoid duplicates if already in legacy
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
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goToPrev = () => {
    if (banners.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
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

  if (banners.length === 0) {
    return (
      <AdSlotWrapper
        slotId="super_banner"
        channel="ads"
        placement="top"
        expectedWidth={4042}
        expectedHeight={1042}
        page="home"
      />
    );
  }

  return (
    <AdSlotWrapper
      slotId="super_banner"
      channel="ads"
      placement="top"
      expectedWidth={4042}
      expectedHeight={1042}
      page="home"
    >
      <div
        className="relative w-full mx-auto overflow-visible"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Ad label */}
        <div className="absolute left-2 top-2 z-10">
          <AdLabel
            level={adDebugLevel}
            adType="MEGA DESTAQUE"
            adId={banners[currentIndex]?.id}
            variant="ADS"
            position="TOPO"
            area="HOME"
            campaignId={banners[currentIndex]?.campaignId}
            overlay
          />
        </div>
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {banners.map((banner) => (
              <a
                key={banner.id}
                href={banner.link_url || "#"}
                target={banner.link_target || "_blank"}
                rel="noopener noreferrer"
                className="relative w-full shrink-0"
                onClick={(e) => handleBannerClick(e, banner)}
              >
                <img
                  src={banner.image_url}
                  alt={banner.alt_text || banner.title || "Banner promocional"}
                  className="w-full h-auto block"
                  loading="eager"
                  decoding="async"
                />
              </a>
            ))}
          </div>
        </div>

        {banners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white md:left-4 md:h-12 md:w-12"
              onClick={(e) => { e.preventDefault(); goToPrev(); }}
            >
              <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white md:right-4 md:h-12 md:w-12"
              onClick={(e) => { e.preventDefault(); goToNext(); }}
            >
              <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
            </Button>
          </>
        )}

        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-4 md:gap-3">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); goToSlide(index); }}
                className={`h-2.5 w-2.5 rounded-full transition-all duration-300 md:h-3 md:w-3 ${
                  index === currentIndex
                    ? "w-6 scale-110 bg-white md:w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {banners.length > 1 && (
          <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm md:right-4 md:top-4 md:px-3 md:text-sm">
            {currentIndex + 1} / {banners.length}
          </div>
        )}
      </div>
    </AdSlotWrapper>
  );
}
