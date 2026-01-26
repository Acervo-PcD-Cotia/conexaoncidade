import { useMemo } from "react";
import { useTenantModulesConfig } from "./useTenantModulesConfig";
import { useUserTenantPreferences } from "./useUserTenantPreferences";
import { useTenantProfileConfig } from "./useTenantProfileConfig";
import {
  PROFILE_DEFAULT_MODULES,
  MENU_MODULE_MAP,
  type SystemModule,
  type UserProfile,
} from "@/types/profiles-modules";

interface MenuItem {
  label: string;
  url: string;
  icon?: string;
  [key: string]: unknown;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
  [key: string]: unknown;
}

/**
 * Hook central para controle de acesso baseado em módulos e perfil
 */
export function useAccessControl() {
  const { enabledModules, isModuleEnabled, isLoading: modulesLoading } = useTenantModulesConfig();
  const { activeProfile, isLoading: prefsLoading } = useUserTenantPreferences();
  const { allowedProfiles, isLoading: configLoading } = useTenantProfileConfig();

  const isLoading = modulesLoading || prefsLoading || configLoading;

  /**
   * Verifica se o usuário pode acessar um módulo específico
   * Considera: módulo habilitado no tenant OU módulo default do perfil
   */
  const canAccess = useMemo(() => {
    return (moduleKey: SystemModule): boolean => {
      // Se o módulo está explicitamente habilitado no tenant
      if (isModuleEnabled(moduleKey)) return true;

      // Se não há módulos configurados, usa os defaults do perfil
      if (enabledModules.length === 0) {
        const defaultModules = PROFILE_DEFAULT_MODULES[activeProfile] || [];
        return defaultModules.includes(moduleKey);
      }

      return false;
    };
  }, [enabledModules, activeProfile, isModuleEnabled]);

  /**
   * Filtra itens de menu baseado nos módulos habilitados
   */
  const filterMenuItems = useMemo(() => {
    return <T extends MenuItem>(items: T[]): T[] => {
      return items.filter((item) => {
        const requiredModule = MENU_MODULE_MAP[item.url];
        if (!requiredModule) return true; // Sem restrição de módulo
        return canAccess(requiredModule);
      });
    };
  }, [canAccess]);

  /**
   * Filtra grupos de menu, removendo itens e grupos vazios
   */
  const filterMenuGroups = useMemo(() => {
    return <T extends MenuGroup>(groups: T[]): T[] => {
      return groups
        .map((group) => ({
          ...group,
          items: filterMenuItems(group.items),
        }))
        .filter((group) => group.items.length > 0);
    };
  }, [filterMenuItems]);

  /**
   * Verifica se uma rota específica está acessível
   */
  const canAccessRoute = useMemo(() => {
    return (path: string): boolean => {
      const requiredModule = MENU_MODULE_MAP[path];
      if (!requiredModule) return true;
      return canAccess(requiredModule);
    };
  }, [canAccess]);

  /**
   * Lista todos os módulos acessíveis (habilitados + default do perfil)
   */
  const accessibleModules = useMemo(() => {
    const modules = new Set<SystemModule>(enabledModules);
    
    // Se não há módulos configurados, incluir defaults do perfil
    if (enabledModules.length === 0) {
      const defaultModules = PROFILE_DEFAULT_MODULES[activeProfile] || [];
      defaultModules.forEach((m) => modules.add(m));
    }

    return Array.from(modules);
  }, [enabledModules, activeProfile]);

  return {
    // State
    isLoading,
    activeProfile,
    allowedProfiles,
    accessibleModules,

    // Functions
    canAccess,
    canAccessRoute,
    filterMenuItems,
    filterMenuGroups,
    isModuleEnabled,
  };
}
