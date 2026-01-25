import { useMemo, useEffect, useCallback } from "react";
import { useSiteTemplateConfig } from "./useSiteTemplateConfig";
import { usePortalTemplate } from "./usePortalTemplates";
import { useTenantContext } from "@/contexts/TenantContext";
import {
  DEFAULT_VOCABULARY,
  CORE_MODULES,
  type ThemeConfig,
  type VocabularyMap,
  type ModuleKey,
  type HomeSectionConfig,
  type SiteBranding,
  type RadioConfig,
  type TVConfig,
} from "@/types/portal-templates";

// Cache version for localStorage - bump this when config structure changes
const CACHE_VERSION = "v1";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface CachedConfig {
  version: string;
  timestamp: number;
  updatedAt: string;
  data: SiteConfig;
}

export interface SiteConfig {
  templateId: string | null;
  templateKey: string | null;
  templateName: string | null;
  theme: ThemeConfig | null;
  vocabulary: VocabularyMap;
  modules: Record<ModuleKey, boolean>;
  homeSections: HomeSectionConfig[];
  branding: SiteBranding;
  radioConfig: RadioConfig;
  tvConfig: TVConfig;
}

// Default journalist home sections as fallback
const DEFAULT_HOME_SECTIONS: HomeSectionConfig[] = [
  { type: "market_data", order: 0, enabled: true },
  { type: "super_banner", order: 1, enabled: true },
  { type: "video_block", order: 2, enabled: true },
  { type: "stories_bar", order: 3, enabled: true, moduleKey: "stories" },
  { type: "ad_slot_top", order: 4, enabled: true },
  { type: "hero_headlines", order: 5, enabled: true },
  { type: "live_broadcast", order: 6, enabled: true, moduleKey: "lives" },
  { type: "agora_na_cidade", order: 7, enabled: true },
  { type: "latest_news", order: 8, enabled: true },
  { type: "quick_notes", order: 9, enabled: true },
  { type: "most_read", order: 10, enabled: true },
];

export function useSiteConfig() {
  const { currentTenantId, isLoading: tenantLoading } = useTenantContext();
  const { data: siteConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: template, isLoading: templateLoading } = usePortalTemplate(siteConfig?.template_id);

  // If no tenant context yet (public visitor), use defaults immediately
  const shouldUseDefaults = !tenantLoading && !currentTenantId;
  const cacheKey = `site_config_${CACHE_VERSION}_${currentTenantId}`;

  // Build merged theme
  const theme = useMemo<ThemeConfig | null>(() => {
    const hasTemplateTheme = template?.theme && Object.keys(template.theme).length > 0;
    const hasSiteOverrides = siteConfig?.theme_overrides && Object.keys(siteConfig.theme_overrides).length > 0;

    if (!hasTemplateTheme && !hasSiteOverrides) {
      return null;
    }

    const merged: ThemeConfig = {};

    if (template?.theme) {
      const templateTheme = template.theme as ThemeConfig;
      Object.keys(templateTheme).forEach((key) => {
        const value = templateTheme[key as keyof ThemeConfig];
        if (value !== undefined && value !== null && value !== "") {
          (merged as Record<string, unknown>)[key] = value;
        }
      });
    }

    if (siteConfig?.theme_overrides) {
      const overrides = siteConfig.theme_overrides as ThemeConfig;
      Object.keys(overrides).forEach((key) => {
        const value = overrides[key as keyof ThemeConfig];
        if (value !== undefined && value !== null && value !== "") {
          (merged as Record<string, unknown>)[key] = value;
        }
      });
    }

    return Object.keys(merged).length > 0 ? merged : null;
  }, [template, siteConfig]);

  // Build merged vocabulary
  const vocabulary = useMemo<VocabularyMap>(() => {
    const base = { ...DEFAULT_VOCABULARY };

    if (template?.vocabulary) {
      Object.assign(base, template.vocabulary);
    }

    if (siteConfig?.vocabulary_overrides) {
      Object.assign(base, siteConfig.vocabulary_overrides);
    }

    return base;
  }, [template, siteConfig]);

  // Build merged modules map
  const modules = useMemo<Record<ModuleKey, boolean>>(() => {
    const result: Record<string, boolean> = {};

    // Start with core modules always enabled
    CORE_MODULES.forEach((m) => {
      result[m] = true;
    });

    // Apply template default modules
    const defaultModules = template?.default_modules as string[] | undefined;
    if (defaultModules) {
      defaultModules.forEach((m) => {
        result[m] = true;
      });
    }

    // Apply site-specific overrides
    const modulesOverrides = siteConfig?.modules_overrides as Record<string, boolean> | undefined;
    if (modulesOverrides) {
      Object.entries(modulesOverrides).forEach(([key, enabled]) => {
        result[key] = enabled;
      });
    }

    return result as Record<ModuleKey, boolean>;
  }, [template, siteConfig]);

  // Build home sections
  const homeSections = useMemo<HomeSectionConfig[]>(() => {
    // If using defaults (no tenant), return default sections immediately
    if (shouldUseDefaults) {
      return DEFAULT_HOME_SECTIONS;
    }

    // Priority: site override > template > default
    const siteHomeSections = siteConfig?.home_sections_overrides as HomeSectionConfig[] | undefined;
    if (siteHomeSections && siteHomeSections.length > 0) {
      return siteHomeSections;
    }

    const templateHomeSections = template?.home_sections as HomeSectionConfig[] | undefined;
    if (templateHomeSections && templateHomeSections.length > 0) {
      return templateHomeSections;
    }

    return DEFAULT_HOME_SECTIONS;
  }, [template, siteConfig, shouldUseDefaults]);

  // Build the full config
  const config = useMemo<SiteConfig>(() => ({
    templateId: siteConfig?.template_id || null,
    templateKey: template?.key || null,
    templateName: template?.name || null,
    theme,
    vocabulary,
    modules,
    homeSections,
    branding: (siteConfig?.branding as SiteBranding) || {},
    radioConfig: (siteConfig?.radio_config as RadioConfig) || {},
    tvConfig: (siteConfig?.tv_config as TVConfig) || {},
  }), [siteConfig, template, theme, vocabulary, modules, homeSections]);

  // Cache to localStorage
  useEffect(() => {
    if (!currentTenantId || configLoading || templateLoading) return;

    try {
      const cached: CachedConfig = {
        version: CACHE_VERSION,
        timestamp: Date.now(),
        updatedAt: siteConfig?.updated_at || "",
        data: config,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cached));
    } catch {
      // Ignore localStorage errors
    }
  }, [config, currentTenantId, configLoading, templateLoading, cacheKey, siteConfig?.updated_at]);

  // Check module enabled
  const isModuleEnabled = useCallback((moduleKey: ModuleKey): boolean => {
    if (CORE_MODULES.includes(moduleKey)) return true;
    return modules[moduleKey] || false;
  }, [modules]);

  // Get vocabulary term
  const t = useCallback((key: keyof VocabularyMap): string => {
    return vocabulary[key] || key;
  }, [vocabulary]);

  // Get filtered home sections (respecting module toggles)
  const activeHomeSections = useMemo<HomeSectionConfig[]>(() => {
    return homeSections
      .filter((section) => section.enabled)
      .filter((section) => !section.moduleKey || isModuleEnabled(section.moduleKey as ModuleKey))
      .sort((a, b) => a.order - b.order);
  }, [homeSections, isModuleEnabled]);

  return {
    config,
    theme,
    vocabulary,
    modules,
    homeSections: activeHomeSections,
    branding: config.branding,
    radioConfig: config.radioConfig,
    tvConfig: config.tvConfig,
    templateId: config.templateId,
    templateKey: config.templateKey,
    templateName: config.templateName,
    isModuleEnabled,
    t,
    // Not loading if we're using defaults (no tenant)
    isLoading: shouldUseDefaults ? false : (tenantLoading || configLoading || templateLoading),
  };
}
