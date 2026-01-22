import { useMemo } from "react";
import { useSiteTemplateConfig } from "./useSiteTemplateConfig";
import { RADIO_CONFIG } from "@/config/radio";
import { TV_CONFIG } from "@/config/tv";
import type { RadioConfig, TVConfig } from "@/types/portal-templates";

// Fallback to static config if no database config exists
export function useRadioConfig(): RadioConfig & { stream_url: string; name: string } {
  const { data: siteConfig } = useSiteTemplateConfig();

  return useMemo(() => {
    const dbConfig = siteConfig?.radio_config as RadioConfig | undefined;
    
    return {
      stream_url: dbConfig?.stream_url || RADIO_CONFIG.STREAM_URL,
      name: dbConfig?.name || RADIO_CONFIG.NAME,
      description: dbConfig?.description || "",
      enabled: dbConfig?.enabled ?? true,
    };
  }, [siteConfig]);
}

export function useTVConfig(): TVConfig & { embed_url: string; title: string } {
  const { data: siteConfig } = useSiteTemplateConfig();

  return useMemo(() => {
    const dbConfig = siteConfig?.tv_config as TVConfig | undefined;
    
    return {
      embed_url: dbConfig?.embed_url || TV_CONFIG.EMBED_URL,
      channel_id: dbConfig?.channel_id || "",
      title: dbConfig?.title || TV_CONFIG.TITLE,
      enabled: dbConfig?.enabled ?? true,
    };
  }, [siteConfig]);
}
