import { useMemo } from "react";
import { useSiteTemplateConfig } from "./useSiteTemplateConfig";
import type { SiteBranding } from "@/types/portal-templates";

const DEFAULT_BRANDING: SiteBranding = {
  logo: {
    main: "/logo.png",
    icon: "/favicon.ico",
  },
  colors: {
    primary: "25 95% 53%",
    secondary: "220 20% 20%",
  },
  fonts: {
    heading: "Plus Jakarta Sans",
    body: "Inter",
  },
  seo: {
    siteName: "Portal Conexão",
    defaultDescription: "Seu portal de notícias e informação",
  },
};

export function useBranding(): SiteBranding {
  const { data: siteConfig } = useSiteTemplateConfig();

  return useMemo(() => {
    const dbBranding = siteConfig?.branding as SiteBranding | undefined;
    
    if (!dbBranding) {
      return DEFAULT_BRANDING;
    }

    // Deep merge branding
    return {
      logo: { ...DEFAULT_BRANDING.logo, ...dbBranding.logo },
      colors: { ...DEFAULT_BRANDING.colors, ...dbBranding.colors },
      fonts: { ...DEFAULT_BRANDING.fonts, ...dbBranding.fonts },
      favicon: dbBranding.favicon || DEFAULT_BRANDING.logo?.icon,
      seo: { ...DEFAULT_BRANDING.seo, ...dbBranding.seo },
    };
  }, [siteConfig]);
}
