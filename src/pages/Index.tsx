import { useState, useEffect, lazy, Suspense } from "react";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveAdUnit } from "@/components/ads/ResponsiveAdUnit";

// Lazy load sections
const MarketDataBar = lazy(() => import("@/components/home/MarketDataBar").then(m => ({ default: m.MarketDataBar })));
const UrgentNewsTicker = lazy(() => import("@/components/home/UrgentNewsTicker").then(m => ({ default: m.UrgentNewsTicker })));
const HeroSection = lazy(() => import("@/components/home/HeroSection").then(m => ({ default: m.HeroSection })));
const LatestNewsList = lazy(() => import("@/components/home/LatestNewsList").then(m => ({ default: m.LatestNewsList })));
const MostReadSection = lazy(() => import("@/components/home/MostReadSection").then(m => ({ default: m.MostReadSection })));
const SuperBanner = lazy(() => import("@/components/home/SuperBanner").then(m => ({ default: m.SuperBanner })));
const QuickNotes = lazy(() => import("@/components/home/QuickNotes").then(m => ({ default: m.QuickNotes })));
const HomeVideoBlock = lazy(() => import("@/components/home/HomeVideoBlock").then(m => ({ default: m.HomeVideoBlock })));
const LocalEngagementSection = lazy(() => import("@/components/home/LocalEngagementSection").then(m => ({ default: m.LocalEngagementSection })));


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
        {/* 1. Market Data Bar (cotação + clima) */}
        <Suspense fallback={<SectionSkeleton h="h-10" />}>
          <MarketDataBar />
        </Suspense>

        {/* 2. Super Banner (logo abaixo do menu, acima do hero) */}
        <Suspense fallback={<SectionSkeleton h="h-16" />}>
          <div className="home-container flex justify-center">
            <SuperBanner />
          </div>
        </Suspense>

        {/* 3. Ticker de Notícias Urgentes */}
        <Suspense fallback={null}>
          <UrgentNewsTicker />
        </Suspense>

        {/* 4. Hero Principal */}
        <Suspense fallback={<SectionSkeleton h="h-72" />}>
          <HeroSection />
        </Suspense>

        {/* 5. Main Content: Últimas Notícias + Sidebar Mais Lidas */}
        <div className="home-container home-section-spacing">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
            {/* Main Column — Últimas Notícias grid 4+4 */}
            <div className="min-w-0 space-y-6">
              <Suspense fallback={<SectionSkeleton h="h-64" />}>
                <LatestNewsList />
              </Suspense>
            </div>

            {/* Sidebar 30% — fixa com Mais Lidas + Publicidade Vertical */}
            <aside className="hidden lg:block space-y-6">
              <div className="sticky top-20">
                {/* 🔥 Mais Lidas */}
                <Suspense fallback={<SectionSkeleton h="h-96" />}>
                  <MostReadSection sidebar />
                </Suspense>

                {/* 📢 Publicidade Vertical 300x600 */}
                <div className="mt-6">
                  <ResponsiveAdUnit format="ARRANHA_CEU" slotId="arranha_ceu" source="ads" page="home" />
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* Mobile-only Mais Lidas */}
        <div className="lg:hidden">
          <Suspense fallback={<SectionSkeleton h="h-64" />}>
            <MostReadSection />
          </Suspense>
        </div>

        {/* 6. Video Block (Web TV) */}
        <Suspense fallback={<SectionSkeleton h="h-48" />}>
          <HomeVideoBlock />
        </Suspense>

        {/* 6.5. Bloco Híbrido: Agenda Cultural + Utilidade Pública */}
        <Suspense fallback={<SectionSkeleton h="h-64" />}>
          <LocalEngagementSection />
        </Suspense>

        {/* 7. Notas Rápidas — carrossel de chips */}
        <Suspense fallback={<SectionSkeleton h="h-16" />}>
          <div className="home-container home-section-spacing">
            <QuickNotes />
          </div>
        </Suspense>

        {/* 8. Publicidade Intermediária (antes do rodapé) */}
        <div className="home-container home-section-spacing flex justify-center">
          <ResponsiveAdUnit format="ANUNCIO_HOME" slotId="leaderboard" source="ads" page="home" />
        </div>
      </div>
    </Suspense>
  );
};

export default Index;
