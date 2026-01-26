import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import type { UserProfile, TenantProfilesConfig } from "@/types/profiles-modules";

/**
 * Hook para buscar configuração de perfis do tenant
 */
export function useTenantProfileConfig() {
  const { currentTenantId } = useTenantContext();

  const query = useQuery({
    queryKey: ["tenant-profiles-config", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return null;

      const { data, error } = await supabase
        .from("tenant_profiles_config")
        .select("*")
        .eq("tenant_id", currentTenantId)
        .maybeSingle();

      if (error) {
        console.error("[useTenantProfileConfig] Error:", error);
        throw error;
      }

      return data as TenantProfilesConfig | null;
    },
    enabled: !!currentTenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Default config se não existir registro
  const defaultProfile = query.data?.default_profile ?? "JORNALISTA";
  const allowedProfiles = (query.data?.allowed_profiles ?? [
    "JORNALISTA",
    "INFLUENCER",
    "RADIO_TV",
    "IGREJA",
    "EDUCADOR",
    "GERACAO_COTIA",
  ]) as UserProfile[];

  return {
    config: query.data,
    defaultProfile: defaultProfile as UserProfile,
    allowedProfiles,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook para atualizar configuração de perfis do tenant (admin only)
 */
export function useUpdateTenantProfileConfig() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantContext();

  return useMutation({
    mutationFn: async ({
      defaultProfile,
      allowedProfiles,
    }: {
      defaultProfile?: UserProfile;
      allowedProfiles?: UserProfile[];
    }) => {
      if (!currentTenantId) throw new Error("No tenant selected");

      // Upsert: insere ou atualiza
      const { data, error } = await supabase
        .from("tenant_profiles_config")
        .upsert(
          {
            tenant_id: currentTenantId,
            default_profile: defaultProfile ?? "JORNALISTA",
            allowed_profiles: allowedProfiles ?? ["JORNALISTA"],
          },
          {
            onConflict: "tenant_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-profiles-config", currentTenantId] });
    },
  });
}
