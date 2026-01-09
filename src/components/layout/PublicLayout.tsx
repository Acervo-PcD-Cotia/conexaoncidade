import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AccessibilityPanel } from "@/components/accessibility/AccessibilityPanel";
import { VLibrasWidget } from "@/components/accessibility/VLibrasWidget";
import { useKeyboardNavigation } from "@/hooks/useKeyboardNavigation";

export function PublicLayout() {
  useKeyboardNavigation();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Skip link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para conteúdo principal
      </a>

      <Header />
      
      <main id="main-content" role="main" aria-label="Conteúdo principal" className="flex-1">
        <Outlet />
      </main>
      
      <Footer />

      {/* Accessibility tools */}
      <AccessibilityPanel />
      <VLibrasWidget />
    </div>
  );
}
