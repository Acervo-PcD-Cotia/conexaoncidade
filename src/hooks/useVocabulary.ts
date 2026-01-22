import { useMemo, useCallback } from "react";
import { useSiteTemplateConfig } from "./useSiteTemplateConfig";
import { usePortalTemplate } from "./usePortalTemplates";
import { DEFAULT_VOCABULARY, type VocabularyKey, type VocabularyMap } from "@/types/portal-templates";

export function useVocabulary() {
  const { data: siteConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: template, isLoading: templateLoading } = usePortalTemplate(siteConfig?.template_id);

  const vocabulary = useMemo<VocabularyMap>(() => {
    // Layer 1: Default vocabulary
    const base = { ...DEFAULT_VOCABULARY };
    
    // Layer 2: Template vocabulary (if any)
    if (template?.vocabulary) {
      Object.assign(base, template.vocabulary);
    }
    
    // Layer 3: Site-specific overrides
    if (siteConfig?.vocabulary_overrides) {
      Object.assign(base, siteConfig.vocabulary_overrides);
    }
    
    return base;
  }, [template, siteConfig]);

  const t = useCallback((key: VocabularyKey): string => {
    return vocabulary[key] || key;
  }, [vocabulary]);

  return {
    vocabulary,
    t,
    isLoading: configLoading || templateLoading,
  };
}
