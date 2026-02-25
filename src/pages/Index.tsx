import { useState, useEffect } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { DynamicHomeSection } from "@/components/home/DynamicHomeSection";
import { Skeleton } from "@/components/ui/skeleton";
import type { HomeSectionConfig } from "@/types/portal-templates";

// Fallback sections to ensure homepage always renders
const FALLBACK_HOME_SECTIONS: HomeSectionConfig[] = [
  { type: "market_data", order: 0, enabled: true },
  { type: "banner_intro", order: 1, enabled: true },
  { type: "video_block", order: 2, enabled: true },
  { type: "stories_bar", order: 3, enabled: true, moduleKey: "stories" },
  { type: "ad_slot_top", order: 4, enabled: true },
  { type: "hero_headlines", order: 5, enabled: true },
  { type: "live_broadcast", order: 6, enabled: true, moduleKey: "lives" },
  { type: "agora_na_cidade", order: 7, enabled: true },
  { type: "latest_news", order: 8, enabled: true },
  { type: "super_banner", order: 9, enabled: true },
  { type: "ad_slot_mid", order: 10, enabled: true },
  { type: "ad_slot_bottom", order: 11, enabled: true },
  { type: "quick_notes", order: 12, enabled: true },
  { type: "most_read", order: 13, enabled: true },
];

// Safety timeout to prevent infinite loading (5 seconds)
const LOADING_TIMEOUT_MS = 5000;

const Index = () => {
  const { homeSections, isLoading } = useSiteConfig();
  const [forceRender, setForceRender] = useState(false);

  // Safety timeout: force render after 5 seconds to prevent infinite loading
  useEffect(() => {
    if (!isLoading) {
      setForceRender(false);
      return;
    }

    const timer = setTimeout(() => {
      console.warn("Homepage loading timeout - forcing render with fallback sections");
      setForceRender(true);
    }, LOADING_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Use fallback if no sections available or if timeout triggered
  const sectionsToRender = homeSections.length > 0 ? homeSections : FALLBACK_HOME_SECTIONS;

  // Show skeleton only if still loading AND timeout hasn't triggered
  if (isLoading && !forceRender) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {sectionsToRender.map((section, index) => (
        <DynamicHomeSection 
          key={`${section.type}-${section.order}-${index}`} 
          section={section} 
        />
      ))}
    </div>
  );
};

export default Index;
