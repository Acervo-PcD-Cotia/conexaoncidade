import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TenantFeature {
  id: string;
  tenant_id: string;
  feature_key: string;
  is_enabled: boolean;
  plan_tier: string | null;
  enabled_at: string | null;
  expires_at: string | null;
  settings: Record<string, unknown>;
}

// Feature keys available in the system
export const FEATURE_KEYS = {
  NEWS_CMS: "news_cms",
  SYNDICATION: "syndication",
  JOURNALIST_STYLE: "journalist_style",
  CUSTOM_DOMAIN: "custom_domain",
  SSL_PREMIUM: "ssl_premium",
  SCHEDULER: "scheduler",
  EVENTS: "events",
  ADS_SUITE: "ads_suite",
  ANALYTICS_PRO: "analytics_pro",
  FISCAL_CENTER: "fiscal_center",
  DIGITAL_EDITION: "digital_edition",
  TRAINING: "training",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];

// Fetch all features for a tenant
export function useTenantFeatures(tenantId: string | undefined) {
  return useQuery({
    queryKey: ["tenant-features", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from("tenant_features")
        .select("*")
        .eq("tenant_id", tenantId);

      if (error) throw error;
      return data as TenantFeature[];
    },
    enabled: !!tenantId,
  });
}

// Check if a specific feature is enabled
export function useTenantHasFeature(tenantId: string | undefined, featureKey: FeatureKey) {
  return useQuery({
    queryKey: ["tenant-has-feature", tenantId, featureKey],
    queryFn: async () => {
      if (!tenantId) return false;

      const { data, error } = await supabase.rpc("tenant_has_feature", {
        _tenant_id: tenantId,
        _feature_key: featureKey,
      });

      if (error) throw error;
      return data as boolean;
    },
    enabled: !!tenantId,
  });
}

// Toggle a feature on/off
export function useToggleFeature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tenantId,
      featureKey,
      isEnabled,
    }: {
      tenantId: string;
      featureKey: FeatureKey;
      isEnabled: boolean;
    }) => {
      const { data, error } = await supabase
        .from("tenant_features")
        .upsert({
          tenant_id: tenantId,
          feature_key: featureKey,
          is_enabled: isEnabled,
          enabled_at: isEnabled ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tenant-features"] });
      queryClient.invalidateQueries({ queryKey: ["tenant-has-feature"] });
      toast.success(
        variables.isEnabled ? "Feature ativada!" : "Feature desativada"
      );
    },
    onError: (error) => {
      toast.error("Erro: " + error.message);
    },
  });
}

// Update feature settings
export function useUpdateFeatureSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      featureId,
      settings,
    }: {
      featureId: string;
      settings: Record<string, unknown>;
    }) => {
      // Cast to Json type for Supabase compatibility
      const { error } = await supabase
        .from("tenant_features")
        .update({ settings: JSON.parse(JSON.stringify(settings)) })
        .eq("id", featureId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-features"] });
      toast.success("Configurações salvas");
    },
    onError: (error) => {
      toast.error("Erro ao salvar: " + error.message);
    },
  });
}
