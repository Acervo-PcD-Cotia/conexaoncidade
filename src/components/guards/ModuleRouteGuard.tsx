import { ReactNode } from "react";
import { useProfileModules } from "@/contexts/ProfileModulesContext";
import { ModuleUnavailable } from "@/pages/admin/ModuleUnavailable";
import { Skeleton } from "@/components/ui/skeleton";
import type { SystemModule } from "@/types/profiles-modules";

interface ModuleRouteGuardProps {
  module: SystemModule;
  children: ReactNode;
}

/**
 * Guard de rota que verifica se um módulo está habilitado
 * Se não estiver, mostra a página de módulo indisponível
 */
export function ModuleRouteGuard({ module, children }: ModuleRouteGuardProps) {
  const { isModuleEnabled, isLoading, isAuthenticated } = useProfileModules();

  // Mostrar loading enquanto carrega
  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Se não autenticado, deixar passar (será tratado pelo AuthGuard)
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  // Verificar se módulo está habilitado
  if (!isModuleEnabled(module)) {
    return <ModuleUnavailable moduleKey={module} />;
  }

  return <>{children}</>;
}

/**
 * HOC para envolver componentes com guard de módulo
 */
export function withModuleGuard<P extends object>(
  Component: React.ComponentType<P>,
  module: SystemModule
) {
  return function GuardedComponent(props: P) {
    return (
      <ModuleRouteGuard module={module}>
        <Component {...props} />
      </ModuleRouteGuard>
    );
  };
}
