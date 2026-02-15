import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AdDebugLevel = "public" | "admin" | "superadmin";

/**
 * Fetches the ad_debug_level setting from site_settings
 */
export function useAdDebugLevelSetting() {
  return useQuery({
    queryKey: ["ad-debug-level"],
    queryFn: async (): Promise<AdDebugLevel> => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ad_debug_level")
        .maybeSingle();

      const val = (data?.value as { level?: string })?.level;
      if (val === "superadmin" || val === "admin") return val;
      return "public";
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Mutation to update ad_debug_level in site_settings
 */
export function useUpdateAdDebugLevel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (level: AdDebugLevel) => {
      const dbValue = { level };

      const { data: existing } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "ad_debug_level")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("site_settings")
          .update({ value: dbValue, updated_at: new Date().toISOString() })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("site_settings")
          .insert([{ key: "ad_debug_level", value: dbValue }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ad-debug-level"] });
      toast.success("Nível de debug de anúncios atualizado");
    },
    onError: (error) => {
      console.error("Error updating ad debug level:", error);
      toast.error("Erro ao atualizar configuração");
    },
  });
}
