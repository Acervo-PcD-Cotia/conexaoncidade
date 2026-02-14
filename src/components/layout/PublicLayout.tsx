import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { TopAudioPlayer } from "./TopAudioPlayer";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";
import { PushPermissionBanner } from "@/components/PushPermissionBanner";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";
import MiniPlayer from "@/components/broadcast/MiniPlayer";
import { useMiniPlayer } from "@/contexts/MiniPlayerContext";
import { GlobalRadioProvider } from "@/contexts/GlobalRadioContext";
import { FloatingAd } from "@/components/ads/FloatingAd";
import { lazy, Suspense } from "react";

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
      
      {/* Push notification permission banner */}
      <PushPermissionBanner />
      
      {/* Persistent Mini Player for live broadcasts */}
      {shouldShowMiniPlayer && broadcast && (
        <MiniPlayer
          broadcast={broadcast}
          onClose={hideMiniPlayer}
          onExpand={hideMiniPlayer}
        />
      )}

      {/* Global floating ad (1x per session, campaign-driven) */}
      <FloatingAd />

      {/* Exit-intent modal (campaign-driven) */}
      <Suspense fallback={null}>
        <ExitIntentModal />
      </Suspense>
    </div>
    </GlobalRadioProvider>
  );
}
