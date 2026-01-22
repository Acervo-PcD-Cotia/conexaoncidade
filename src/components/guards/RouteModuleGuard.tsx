import { useEffect, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import type { ModuleKey } from "@/types/portal-templates";

interface RouteModuleGuardProps {
  module: ModuleKey;
  children: ReactNode;
  redirectTo?: string;
  showToast?: boolean;
}

/**
 * Protects routes based on module availability.
 * If the module is disabled, redirects to the specified path (default: home).
 * 
 * Usage:
 * <Route path="/ao-vivo" element={
 *   <RouteModuleGuard module="lives">
 *     <BroadcastHub />
 *   </RouteModuleGuard>
 * } />
 */
export function RouteModuleGuard({ 
  module, 
  children, 
  redirectTo = "/",
  showToast = true 
}: RouteModuleGuardProps) {
  const { isModuleEnabled, isLoading } = useSiteConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const enabled = isModuleEnabled(module);

  useEffect(() => {
    // Wait for config to load before checking
    if (isLoading) return;

    if (!enabled) {
      if (showToast) {
        toast.info("Este recurso não está disponível neste portal", {
          description: "Você será redirecionado para a página inicial.",
          duration: 3000,
        });
      }
      navigate(redirectTo, { replace: true });
    }
  }, [enabled, isLoading, navigate, redirectTo, showToast]);

  // Show nothing while loading or if module is disabled
  if (isLoading || !enabled) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Higher-order component version of RouteModuleGuard
 * 
 * Usage:
 * const ProtectedBroadcastHub = withModuleGuard(BroadcastHub, 'lives');
 */
export function withModuleGuard<P extends object>(
  Component: React.ComponentType<P>,
  module: ModuleKey,
  redirectTo?: string
) {
  return function GuardedComponent(props: P) {
    return (
      <RouteModuleGuard module={module} redirectTo={redirectTo}>
        <Component {...props} />
      </RouteModuleGuard>
    );
  };
}
