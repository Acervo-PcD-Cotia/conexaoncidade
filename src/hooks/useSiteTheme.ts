import { useMemo, useEffect } from "react";
import { useSiteTemplateConfig } from "./useSiteTemplateConfig";
import { usePortalTemplate } from "./usePortalTemplates";
import type { ThemeConfig } from "@/types/portal-templates";

export function useSiteTheme() {
  const { data: siteConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: template, isLoading: templateLoading } = usePortalTemplate(siteConfig?.template_id);

  const theme = useMemo(() => {
    // Only apply dynamic theme if there's a template or site overrides configured
    const hasTemplateTheme = template?.theme && Object.keys(template.theme).length > 0;
    const hasSiteOverrides = siteConfig?.theme_overrides && Object.keys(siteConfig.theme_overrides).length > 0;

    // Return null to preserve index.css defaults when no custom theme is configured
    if (!hasTemplateTheme && !hasSiteOverrides) {
      return null;
    }

    const merged: ThemeConfig = {};

    // Layer 1: Template theme
    if (template?.theme) {
      const templateTheme = template.theme as ThemeConfig;
      Object.keys(templateTheme).forEach((key) => {
        const value = templateTheme[key as keyof ThemeConfig];
        if (value !== undefined && value !== null) {
          (merged as Record<string, unknown>)[key] = value;
        }
      });
    }

    // Layer 2: Site-level overrides (highest priority)
    if (siteConfig?.theme_overrides) {
      const overrides = siteConfig.theme_overrides as ThemeConfig;
      Object.keys(overrides).forEach((key) => {
        const value = overrides[key as keyof ThemeConfig];
        if (value !== undefined && value !== null) {
          (merged as Record<string, unknown>)[key] = value;
        }
      });
    }

    return merged;
  }, [template, siteConfig]);

  const isLoading = configLoading || templateLoading;

  return { theme, isLoading, templateName: template?.name };
}

/**
 * Applies theme CSS variables to the document root
 * Only applies when a custom theme is configured, preserving index.css defaults otherwise
 */
export function useApplyTheme() {
  const { theme, isLoading } = useSiteTheme();

  useEffect(() => {
    // Don't apply anything while loading or if no custom theme is configured
    // This preserves the original index.css colors
    if (isLoading || theme === null) return;

    const root = document.documentElement;

    // Apply color variables only if they exist in the custom theme
    if (theme.primary) {
      root.style.setProperty("--primary", theme.primary);
    }
    if (theme.secondary) {
      root.style.setProperty("--secondary", theme.secondary);
    }
    if (theme.accent) {
      root.style.setProperty("--accent", theme.accent);
    }
    if (theme.background) {
      root.style.setProperty("--background", theme.background);
    }
    if (theme.foreground) {
      root.style.setProperty("--foreground", theme.foreground);
    }
    if (theme.muted) {
      root.style.setProperty("--muted", theme.muted);
    }

    // Apply typography
    if (theme.typography === "warm") {
      root.style.setProperty("--font-heading", "Georgia, serif");
      root.style.setProperty("--font-body", "Georgia, serif");
    } else if (theme.typography === "modern") {
      root.style.setProperty("--font-heading", "'Plus Jakarta Sans', sans-serif");
      root.style.setProperty("--font-body", "'Inter', sans-serif");
    } else if (theme.typography === "corporate") {
      root.style.setProperty("--font-heading", "'Inter', sans-serif");
      root.style.setProperty("--font-body", "'Inter', sans-serif");
    }

    // Cleanup on unmount - only remove properties that were set
    return () => {
      if (theme.primary) root.style.removeProperty("--primary");
      if (theme.secondary) root.style.removeProperty("--secondary");
      if (theme.accent) root.style.removeProperty("--accent");
      if (theme.background) root.style.removeProperty("--background");
      if (theme.foreground) root.style.removeProperty("--foreground");
      if (theme.muted) root.style.removeProperty("--muted");
      if (theme.typography) {
        root.style.removeProperty("--font-heading");
        root.style.removeProperty("--font-body");
      }
    };
  }, [theme, isLoading]);
}
