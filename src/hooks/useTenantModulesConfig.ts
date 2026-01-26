import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import type { SystemModule, TenantModule } from "@/types/profiles-modules";

/**
 * Hook para buscar módulos habilitados do tenant atual
 */
export function useTenantModulesConfig() {
  const { currentTenantId } = useTenantContext();

  const query = useQuery({
    queryKey: ["tenant-modules", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return [];

      const { data, error } = await supabase
        .from("tenant_modules")
        .select("*")
        .eq("tenant_id", currentTenantId);

      if (error) {
        console.error("[useTenantModulesConfig] Error:", error);
        throw error;
      }

      return (data || []) as TenantModule[];
    },
    enabled: !!currentTenantId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  const isModuleEnabled = (moduleKey: SystemModule): boolean => {
    if (!query.data) return false;
    const module = query.data.find((m) => m.module_key === moduleKey);
    return module?.enabled ?? false;
  };

  const getModuleSettings = (moduleKey: SystemModule): Record<string, unknown> | null => {
    if (!query.data) return null;
    const module = query.data.find((m) => m.module_key === moduleKey);
    return module?.settings as Record<string, unknown> ?? null;
  };

  const enabledModules = (query.data || [])
    .filter((m) => m.enabled)
    .map((m) => m.module_key);

  return {
    modules: query.data || [],
    enabledModules,
    isModuleEnabled,
    getModuleSettings,
    isLoading: query.isLoading,
    error: query.error,
  };
}

/**
 * Hook para atualizar módulos do tenant (admin only)
 */
export function useUpdateTenantModule() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantContext();

  return useMutation({
    mutationFn: async ({
      moduleKey,
      enabled,
      settings,
    }: {
      moduleKey: SystemModule;
      enabled: boolean;
      settings?: Record<string, unknown>;
    }) => {
      if (!currentTenantId) throw new Error("No tenant selected");

      // Upsert usando RPC ou insert/update direto
      const { data, error } = await supabase
        .from("tenant_modules")
        .upsert(
          {
            tenant_id: currentTenantId,
            module_key: moduleKey,
            enabled,
            settings: settings || {},
          } as never, // Type cast para contornar tipos gerados desatualizados
          {
            onConflict: "tenant_id,module_key",
          }
        )
        .select()
        .single();

      if (error) throw error;
      return data as TenantModule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-modules", currentTenantId] });
    },
  });
}

/**
 * Hook para bulk update de módulos
 */
export function useBulkUpdateTenantModules() {
  const queryClient = useQueryClient();
  const { currentTenantId } = useTenantContext();

  return useMutation({
    mutationFn: async (modules: { moduleKey: SystemModule; enabled: boolean }[]) => {
      if (!currentTenantId) throw new Error("No tenant selected");

      // Fazer upserts individuais para evitar problemas de tipo
      const promises = modules.map((m) =>
        supabase
          .from("tenant_modules")
          .upsert(
            {
              tenant_id: currentTenantId,
              module_key: m.moduleKey,
              enabled: m.enabled,
              settings: {},
            } as never, // Type cast para contornar tipos gerados desatualizados
            { onConflict: "tenant_id,module_key" }
          )
      );

      const results = await Promise.all(promises);
      
      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-modules", currentTenantId] });
    },
  });
}
