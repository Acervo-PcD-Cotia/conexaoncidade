import { ReactNode } from "react";
import { useModuleEnabled } from "@/hooks/useModuleEnabled";
import type { ModuleKey } from "@/types/portal-templates";

interface ModuleGuardProps {
  module: ModuleKey;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on whether a module is enabled.
 * 
 * Usage:
 * <ModuleGuard module="web_radio">
 *   <RadioPlayer />
 * </ModuleGuard>
 */
export function ModuleGuard({ module, children, fallback = null }: ModuleGuardProps) {
  const isEnabled = useModuleEnabled(module);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * HOC version for wrapping entire components
 */
export function withModuleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  moduleKey: ModuleKey,
  Fallback?: React.ComponentType
) {
  return function ModuleGuardedComponent(props: P) {
    const isEnabled = useModuleEnabled(moduleKey);

    if (!isEnabled) {
      return Fallback ? <Fallback /> : null;
    }

    return <WrappedComponent {...props} />;
  };
}
