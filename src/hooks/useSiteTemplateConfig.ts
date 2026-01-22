import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import type { SiteTemplateConfig, RadioConfig, TVConfig, SiteBranding, VocabularyMap } from "@/types/portal-templates";

export function useSiteTemplateConfig() {
  const { currentTenantId } = useTenantContext();

  return useQuery({
    queryKey: ["site-template-config", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return null;

      const { data, error } = await supabase
        .from("site_template_config" as any)
        .select("*")
        .eq("site_id", currentTenantId)
        .maybeSingle();

      if (error) throw error;
      return data as SiteTemplateConfig | null;
    },
    enabled: !!currentTenantId,
  });
}

export function useUpdateSiteTemplateConfig() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantContext();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<SiteTemplateConfig, 'id' | 'site_id' | 'created_at' | 'updated_at'>>) => {
      if (!currentTenantId) throw new Error("No tenant context");

      const { data: existing } = await supabase
        .from("site_template_config" as any)
        .select("id")
        .eq("site_id", currentTenantId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("site_template_config" as any)
          .update(updates as any)
          .eq("site_id", currentTenantId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("site_template_config" as any)
          .insert({ site_id: currentTenantId, ...updates } as any)
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-template-config", currentTenantId] });
    },
  });
}

export function useApplyTemplate() {
  const updateConfig = useUpdateSiteTemplateConfig();

  return useMutation({
    mutationFn: async (templateId: string) => {
      return updateConfig.mutateAsync({
        template_id: templateId,
        applied_at: new Date().toISOString(),
        // Reset overrides when applying new template
        theme_overrides: {},
        vocabulary_overrides: {},
        modules_overrides: {},
      });
    },
  });
}

export function useUpdateVocabulary() {
  const updateConfig = useUpdateSiteTemplateConfig();

  return useMutation({
    mutationFn: async (vocabularyOverrides: VocabularyMap) => {
      return updateConfig.mutateAsync({
        vocabulary_overrides: vocabularyOverrides,
      });
    },
  });
}

export function useToggleModule() {
  const { data: config } = useSiteTemplateConfig();
  const updateConfig = useUpdateSiteTemplateConfig();

  return useMutation({
    mutationFn: async ({ moduleKey, enabled }: { moduleKey: string; enabled: boolean }) => {
      const currentOverrides = (config?.modules_overrides || {}) as Record<string, boolean>;
      return updateConfig.mutateAsync({
        modules_overrides: {
          ...currentOverrides,
          [moduleKey]: enabled,
        },
      });
    },
  });
}

export function useUpdateRadioConfig() {
  const { data: config } = useSiteTemplateConfig();
  const updateConfig = useUpdateSiteTemplateConfig();

  return useMutation({
    mutationFn: async (radioConfig: RadioConfig) => {
      const current = (config?.radio_config || {}) as RadioConfig;
      return updateConfig.mutateAsync({
        radio_config: { ...current, ...radioConfig },
      });
    },
  });
}

export function useUpdateTVConfig() {
  const { data: config } = useSiteTemplateConfig();
  const updateConfig = useUpdateSiteTemplateConfig();

  return useMutation({
    mutationFn: async (tvConfig: TVConfig) => {
      const current = (config?.tv_config || {}) as TVConfig;
      return updateConfig.mutateAsync({
        tv_config: { ...current, ...tvConfig },
      });
    },
  });
}

export function useUpdateBranding() {
  const { data: config } = useSiteTemplateConfig();
  const updateConfig = useUpdateSiteTemplateConfig();

  return useMutation({
    mutationFn: async (branding: Partial<SiteBranding>) => {
      const current = (config?.branding || {}) as SiteBranding;
      return updateConfig.mutateAsync({
        branding: { ...current, ...branding },
      });
    },
  });
}
