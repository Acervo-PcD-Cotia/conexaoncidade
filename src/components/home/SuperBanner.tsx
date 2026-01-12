import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SuperBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackedImpressions = useRef<Set<string>>(new Set());

  // Generate or retrieve session ID for tracking
  const sessionId = useMemo(() => {
    if (typeof window === "undefined") return "";
    const stored = sessionStorage.getItem("banner_session_id");
    if (stored) return stored;
    const newId = crypto.randomUUID();
    sessionStorage.setItem("banner_session_id", newId);
    return newId;
  }, []);

  const { data: banners = [] } = useQuery({
    queryKey: ["super-banners"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("super_banners")
        .select("*")
        .eq("is_active", true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order("sort_order")
        .limit(7);
      if (error) throw error;
      return data;
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

  // Reset index when banners change
  useEffect(() => {
    if (currentIndex >= banners.length && banners.length > 0) {
      setCurrentIndex(0);
    }
  }, [banners.length, currentIndex]);

  // Track impressions when banner is viewed
  useEffect(() => {
    if (banners.length === 0 || !sessionId) return;
    
    const currentBanner = banners[currentIndex];
    if (!currentBanner) return;
    
    const impressionKey = `${currentBanner.id}-${sessionId}`;
    
    // Only track once per session per banner
    if (trackedImpressions.current.has(impressionKey)) return;
    trackedImpressions.current.add(impressionKey);
    
    // Record impression
    supabase
      .from("banner_impressions")
      .insert({
        banner_id: currentBanner.id,
        session_id: sessionId,
      })
      .then();
  }, [currentIndex, banners, sessionId]);

  const handleBannerClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    banner: NonNullable<typeof banners>[number]
  ) => {
    // Capture click coordinates for heatmap
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const clickY = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    const bannerWidth = Math.round(rect.width);
    const bannerHeight = Math.round(rect.height);

    // Increment accumulated click count
    supabase
      .from("super_banners")
      .update({ click_count: (banner.click_count || 0) + 1 })
      .eq("id", banner.id)
      .then();

    // Record detailed click for analytics with coordinates
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
  };

  if (banners.length === 0) return null;

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner container - fullwidth */}
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
            {/* Responsive aspect ratio: 16:9 on mobile, 21:9 on desktop */}
            <div className="aspect-[16/9] w-full md:aspect-[21/9]">
              <img
                src={banner.image_url}
                alt={banner.alt_text || banner.title || "Banner promocional"}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>
          </a>
        ))}
      </div>

      {/* Navigation arrows - larger and more visible */}
      {banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white md:left-4 md:h-12 md:w-12"
            onClick={(e) => {
              e.preventDefault();
              goToPrev();
            }}
          >
            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 hover:text-white md:right-4 md:h-12 md:w-12"
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
          >
            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
          </Button>
        </>
      )}

      {/* Dots - larger and more visible */}
      {banners.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 md:bottom-4 md:gap-3">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                goToSlide(index);
              }}
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

      {/* Counter badge */}
      {banners.length > 1 && (
        <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm md:right-4 md:top-4 md:px-3 md:text-sm">
          {currentIndex + 1} / {banners.length}
        </div>
      )}
    </div>
  );
}
