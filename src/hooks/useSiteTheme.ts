import { useMemo, useEffect } from "react";
import { useSiteTemplateConfig } from "./useSiteTemplateConfig";
import { usePortalTemplate } from "./usePortalTemplates";
import type { ThemeConfig } from "@/types/portal-templates";

const DEFAULT_THEME: ThemeConfig = {
  primary: "25 95% 53%",
  secondary: "220 20% 20%",
  accent: "30 90% 50%",
  background: "220 20% 10%",
  foreground: "0 0% 98%",
  muted: "220 15% 20%",
  typography: "modern",
};

export function useSiteTheme() {
  const { data: siteConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: template, isLoading: templateLoading } = usePortalTemplate(siteConfig?.template_id);

  const theme = useMemo(() => {
    const merged: ThemeConfig = { ...DEFAULT_THEME };

    // Layer 2: Template theme
    if (template?.theme) {
      const templateTheme = template.theme as ThemeConfig;
      Object.keys(templateTheme).forEach((key) => {
        const value = templateTheme[key as keyof ThemeConfig];
        if (value !== undefined && value !== null) {
          (merged as Record<string, unknown>)[key] = value;
        }
      });
    }

    // Layer 3: Site-level overrides
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
 */
export function useApplyTheme() {
  const { theme, isLoading } = useSiteTheme();

  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;

    // Apply color variables
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

    // Cleanup on unmount
    return () => {
      root.style.removeProperty("--primary");
      root.style.removeProperty("--secondary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--background");
      root.style.removeProperty("--foreground");
      root.style.removeProperty("--muted");
      root.style.removeProperty("--font-heading");
      root.style.removeProperty("--font-body");
    };
  }, [theme, isLoading]);
}
