import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import type { UserProfile, UserTenantPreferences } from "@/types/profiles-modules";

/**
 * Hook para buscar e gerenciar preferências do usuário no tenant atual
 */
export function useUserTenantPreferences() {
  const { currentTenantId } = useTenantContext();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user-tenant-preferences", currentTenantId, user?.id],
    queryFn: async () => {
      if (!currentTenantId || !user?.id) return null;

      const { data, error } = await supabase
        .from("user_tenant_preferences")
        .select("*")
        .eq("tenant_id", currentTenantId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("[useUserTenantPreferences] Error:", error);
        throw error;
      }

      return data as UserTenantPreferences | null;
    },
    enabled: !!currentTenantId && !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutos
  });

  // Mutation para criar/atualizar preferências
  const upsertMutation = useMutation({
    mutationFn: async (updates: {
      active_profile?: UserProfile;
      dismissed_onboarding?: boolean;
    }) => {
      if (!currentTenantId || !user?.id) throw new Error("Missing tenant or user");

      const { data, error } = await supabase
        .from("user_tenant_preferences")
        .upsert(
          {
            tenant_id: currentTenantId,
            user_id: user.id,
            active_profile: updates.active_profile ?? "JORNALISTA",
            dismissed_onboarding: updates.dismissed_onboarding ?? false,
            last_seen_at: new Date().toISOString(),
          },
          {
            onConflict: "tenant_id,user_id",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-tenant-preferences", currentTenantId, user?.id],
      });
    },
  });

  // Helpers
  const updateProfile = async (profile: UserProfile) => {
    return upsertMutation.mutateAsync({ 
      active_profile: profile,
      dismissed_onboarding: query.data?.dismissed_onboarding ?? false,
    });
  };

  const dismissOnboarding = async () => {
    return upsertMutation.mutateAsync({ 
      dismissed_onboarding: true,
      active_profile: (query.data?.active_profile ?? "JORNALISTA") as UserProfile,
    });
  };

  const updateLastSeen = async () => {
    if (!currentTenantId || !user?.id) return;
    
    await supabase
      .from("user_tenant_preferences")
      .upsert(
        {
          tenant_id: currentTenantId,
          user_id: user.id,
          active_profile: query.data?.active_profile ?? "JORNALISTA",
          dismissed_onboarding: query.data?.dismissed_onboarding ?? false,
          last_seen_at: new Date().toISOString(),
        },
        { onConflict: "tenant_id,user_id" }
      );
  };

  return {
    preferences: query.data,
    activeProfile: (query.data?.active_profile ?? "JORNALISTA") as UserProfile,
    dismissedOnboarding: query.data?.dismissed_onboarding ?? false,
    isLoading: query.isLoading,
    error: query.error,
    
    // Mutations
    updateProfile,
    dismissOnboarding,
    updateLastSeen,
    isUpdating: upsertMutation.isPending,
  };
}
