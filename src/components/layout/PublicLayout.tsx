import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopAudioPlayer } from "./TopAudioPlayer";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";
import { PushSubscribePrompt } from "@/components/PushSubscribePrompt";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import MiniPlayer from "@/components/broadcast/MiniPlayer";
import { useMiniPlayer } from "@/contexts/MiniPlayerContext";
import { GlobalRadioProvider } from "@/contexts/GlobalRadioContext";
import { lazy, Suspense } from "react";

const FloatingAd = lazy(() => import("@/components/ads/FloatingAd").then(m => ({ default: m.FloatingAd })));
const AutoPopupAd = lazy(() => import("@/components/ads/AutoPopupAd").then(m => ({ default: m.AutoPopupAd })));
const ExitIntentModal = lazy(() => import("@/components/ads/ExitIntentModal").then(m => ({ default: m.ExitIntentModal })));


export function PublicLayout() {
  useKeyboardNavigation();
  const location = useLocation();
  const { isVisible, broadcast, hideMiniPlayer } = useMiniPlayer();
  
  // Don't show miniplayer on the watch page for the same broadcast
  const isOnWatchPage = location.pathname.startsWith("/ao-vivo/");
  const shouldShowMiniPlayer = isVisible && broadcast && !isOnWatchPage;

  return (
    <GlobalRadioProvider>
    <div className="flex min-h-screen flex-col">

      {/* Sticky Audio Player at the very top (handles web_radio internally) */}
      <TopAudioPlayer />

      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-16 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para conteúdo principal
      </a>

      <Header />
      
      <main id="main-content" role="main" aria-label="Conteúdo principal" className="flex-1">
        <Outlet />
      </main>
      
      <Footer />

      {/* Accessibility tools (VLibras is now loaded globally via index.html) */}
      <AccessibilityPanel />
      
      {/* Push notification subscribe prompt */}
      <PushSubscribePrompt />
      
      {/* Persistent Mini Player for live broadcasts */}
      {shouldShowMiniPlayer && broadcast && (
        <MiniPlayer
          broadcast={broadcast}
          onClose={hideMiniPlayer}
          onExpand={hideMiniPlayer}
        />
      )}

      {/* Global floating ad (1x per session, campaign-driven, desktop only) */}
      <Suspense fallback={null}>
        <FloatingAd />
      </Suspense>

      {/* Auto popup ad from ads table (1x per session) */}
      <Suspense fallback={null}>
        <AutoPopupAd />
      </Suspense>

      {/* Exit-intent modal (campaign-driven) */}
      <Suspense fallback={null}>
        <ExitIntentModal />
      </Suspense>
    </div>
    </GlobalRadioProvider>
  );
}
