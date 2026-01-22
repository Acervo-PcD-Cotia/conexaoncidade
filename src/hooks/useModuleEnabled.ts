import { useMemo } from "react";
import { useSiteTemplateConfig } from "./useSiteTemplateConfig";
import { usePortalTemplate } from "./usePortalTemplates";
import { useTenantContext } from "@/contexts/TenantContext";
import { CORE_MODULES, type ModuleKey } from "@/types/portal-templates";

export function useModuleEnabled(moduleKey: ModuleKey): boolean {
  const { currentTenantId } = useTenantContext();
  const { data: siteConfig } = useSiteTemplateConfig();
  const { data: template } = usePortalTemplate(siteConfig?.template_id);

  return useMemo(() => {
    // Core modules are always enabled
    if (CORE_MODULES.includes(moduleKey)) {
      return true;
    }

    // Check for site-specific override first
    const modulesOverrides = siteConfig?.modules_overrides as Record<string, boolean> | undefined;
    if (modulesOverrides && moduleKey in modulesOverrides) {
      return modulesOverrides[moduleKey];
    }

    // Check if module is in template's default modules
    const defaultModules = template?.default_modules as string[] | undefined;
    if (defaultModules?.includes(moduleKey)) {
      return true;
    }

    // Default to false if not in template
    return false;
  }, [moduleKey, siteConfig, template]);
}

// Hook to get all enabled modules
export function useEnabledModules(): ModuleKey[] {
  const { data: siteConfig } = useSiteTemplateConfig();
  const { data: template } = usePortalTemplate(siteConfig?.template_id);

  return useMemo(() => {
    const modules = new Set<ModuleKey>(CORE_MODULES);

    // Add template default modules
    const defaultModules = template?.default_modules as string[] | undefined;
    if (defaultModules) {
      defaultModules.forEach((m) => modules.add(m as ModuleKey));
    }

    // Apply overrides
    const modulesOverrides = siteConfig?.modules_overrides as Record<string, boolean> | undefined;
    if (modulesOverrides) {
      Object.entries(modulesOverrides).forEach(([key, enabled]) => {
        if (enabled) {
          modules.add(key as ModuleKey);
        } else {
          modules.delete(key as ModuleKey);
        }
      });
    }

    return Array.from(modules);
  }, [siteConfig, template]);
}
