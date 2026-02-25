import { useState, useEffect, lazy, Suspense } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveAdUnit } from "@/components/ads/ResponsiveAdUnit";

// Lazy load sections
const MarketDataBar = lazy(() => import("@/components/home/MarketDataBar").then(m => ({ default: m.MarketDataBar })));
const HeroSection = lazy(() => import("@/components/home/HeroSection").then(m => ({ default: m.HeroSection })));
const LatestNewsList = lazy(() => import("@/components/home/LatestNewsList").then(m => ({ default: m.LatestNewsList })));
const MostReadSection = lazy(() => import("@/components/home/MostReadSection").then(m => ({ default: m.MostReadSection })));
const SuperBanner = lazy(() => import("@/components/home/SuperBanner").then(m => ({ default: m.SuperBanner })));
const QuickNotes = lazy(() => import("@/components/home/QuickNotes").then(m => ({ default: m.QuickNotes })));
const TopWebStoriesBar = lazy(() => import("@/components/home/TopWebStoriesBar").then(m => ({ default: m.TopWebStoriesBar })));
const HomeVideoBlock = lazy(() => import("@/components/home/HomeVideoBlock").then(m => ({ default: m.HomeVideoBlock })));
const BannerIntro = lazy(() => import("@/components/ads/BannerIntro").then(m => ({ default: m.BannerIntro })));

const LOADING_TIMEOUT_MS = 5000;

function SectionSkeleton({ h = "h-32" }: { h?: string }) {
  return <Skeleton className={`${h} w-full rounded-xl`} />;
}

const Index = () => {
  const { isLoading } = useSiteConfig();
  const [forceRender, setForceRender] = useState(false);

  useEffect(() => {
    if (!isLoading) { setForceRender(false); return; }
    const timer = setTimeout(() => {
      console.warn("Homepage loading timeout - forcing render with fallback");
      setForceRender(true);
    }, LOADING_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (isLoading && !forceRender) {
    return (
      <div className="home-container space-y-4 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="home-container space-y-4 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    }>
      <div className="home-layout">
        {/* 1. Market Data Bar - compact */}
        <Suspense fallback={<SectionSkeleton h="h-10" />}>
          <MarketDataBar />
        </Suspense>

        {/* 2. Banner Intro */}
        <Suspense fallback={<SectionSkeleton h="h-12" />}>
          <BannerIntro />
        </Suspense>

        {/* 3. Stories Bar */}
        <Suspense fallback={<SectionSkeleton h="h-20" />}>
          <TopWebStoriesBar />
        </Suspense>

        {/* 4. Ad Slot Top */}
        <div className="home-container home-section-spacing flex justify-center">
          <ResponsiveAdUnit format="SUPER_BANNER_TOPO" slotId="super_banner_top" source="ads" page="home" />
        </div>

        {/* 5. HERO — destaque principal + 3 secundárias */}
        <Suspense fallback={<SectionSkeleton h="h-72" />}>
          <HeroSection />
        </Suspense>

        {/* 6. Banner Horizontal após hero */}
        <Suspense fallback={<SectionSkeleton h="h-16" />}>
          <div className="home-container home-section-spacing flex justify-center">
            <SuperBanner />
          </div>
        </Suspense>

        {/* 7. Main Content Area: 70% news | 30% sidebar */}
        <div className="home-container home-section-spacing">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Column */}
            <div className="min-w-0 space-y-6">
              {/* Video Block */}
              <Suspense fallback={<SectionSkeleton h="h-48" />}>
                <HomeVideoBlock />
              </Suspense>

              {/* Últimas Notícias */}
              <Suspense fallback={<SectionSkeleton h="h-64" />}>
                <LatestNewsList />
              </Suspense>

              {/* Ad mid */}
              <div className="flex justify-center">
                <ResponsiveAdUnit format="RETANGULO_MEDIO" slotId="retangulo_medio" source="ads" page="home" />
              </div>

              {/* Quick Notes */}
              <Suspense fallback={<SectionSkeleton h="h-32" />}>
                <QuickNotes />
              </Suspense>
            </div>

            {/* Sidebar 30% */}
            <aside className="hidden lg:block space-y-6">
              {/* Mais Lidas - sticky */}
              <div className="sticky top-20">
                <Suspense fallback={<SectionSkeleton h="h-96" />}>
                  <MostReadSection sidebar />
                </Suspense>

                {/* Banner vertical sticky */}
                <div className="mt-6">
                  <ResponsiveAdUnit format="ARRANHA_CEU" slotId="arranha_ceu" source="ads" page="home" />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile-only MostRead (below content) */}
        <div className="lg:hidden">
          <Suspense fallback={<SectionSkeleton h="h-64" />}>
            <MostReadSection />
          </Suspense>
        </div>

        {/* Ad bottom */}
        <div className="home-container home-section-spacing flex justify-center">
          <ResponsiveAdUnit format="ANUNCIO_HOME" slotId="leaderboard" source="ads" page="home" />
        </div>
      </div>
    </Suspense>
  );
};

export default Index;
