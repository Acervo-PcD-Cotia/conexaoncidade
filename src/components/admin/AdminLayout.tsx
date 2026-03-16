import { useEffect, useState, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { Breadcrumb } from "./Breadcrumb";
import { useRequireRole } from "@/hooks/useRequireRole";
import { NewsCreationModal } from "./NewsCreationModal";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
import { AccessDeniedScreen } from "@/components/auth/AccessDeniedScreen";
import { AdminErrorBoundary } from "./AdminErrorBoundary";
import { cn } from "@/lib/utils";
import { BUILD_ID, BUILD_ENV } from "@/config/buildInfo";

// Focus Mode Context
interface FocusModeContextType {
  focusMode: boolean;
  toggleFocusMode: () => void;
}

const FocusModeContext = createContext<FocusModeContextType>({ focusMode: false, toggleFocusMode: () => {} });

export const useFocusMode = () => useContext(FocusModeContext);

export function AdminLayout() {
  const { hasAccess, checkingRole, showDenied, redirectCountdown } = useRequireRole([
    "super_admin",
    "admin", 
    "editor", 
    "editor_chief", 
    "reporter", 
    "columnist",
    "moderator",
  ]);

  const { isOpen, openModal, closeModal } = useNewsCreationModal();
  const [focusMode, setFocusMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin-focus-mode') === 'true';
    }
    return false;
  });

  const toggleFocusMode = () => {
    setFocusMode(prev => {
      const newValue = !prev;
      localStorage.setItem('admin-focus-mode', String(newValue));
      return newValue;
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N for news modal
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openModal();
      }
      // Ctrl+Shift+F for focus mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFocusMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openModal]);

  if (checkingRole) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (showDenied) {
    return <AccessDeniedScreen type={showDenied} redirectCountdown={redirectCountdown} />;
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <FocusModeContext.Provider value={{ focusMode, toggleFocusMode }}>
      <SidebarProvider defaultOpen={false}>
        <div className={cn(
          "flex min-h-screen w-full transition-all duration-300",
          focusMode && "focus-mode-active"
        )}>
          <AdminSidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto bg-muted/30 p-2 sm:p-4">
              <Breadcrumb />
              <AdminErrorBoundary>
                <Outlet />
              </AdminErrorBoundary>
            </main>
            <footer className="flex justify-end px-4 py-1 border-t border-border/30">
              <span className="text-[10px] text-muted-foreground font-mono">
                Build: {BUILD_ID} | Env: {BUILD_ENV}
              </span>
            </footer>
          </div>
        </div>
        <NewsCreationModal open={isOpen} onOpenChange={(open) => !open && closeModal()} />
      </SidebarProvider>
    </FocusModeContext.Provider>
  );
}