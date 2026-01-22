import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

export interface FactCheckSettings {
  auto_score_threshold: number;
  expiration_days: number;
  external_api_enabled: boolean;
  external_api_key: string;
  auto_publish: boolean;
}

const DEFAULT_FACTCHECK_SETTINGS: FactCheckSettings = {
  auto_score_threshold: 70,
  expiration_days: 30,
  external_api_enabled: false,
  external_api_key: "",
  auto_publish: false,
};

const FACTCHECK_KEYS = {
  AUTO_SCORE_THRESHOLD: "factcheck.auto_score_threshold",
  EXPIRATION_DAYS: "factcheck.expiration_days",
  EXTERNAL_API: "factcheck.external_api",
  AUTO_PUBLISH: "factcheck.auto_publish",
};

export function useFactCheckSettings() {
  return useQuery({
    queryKey: ["factcheck-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "factcheck.%");

      if (error) {
        console.error("Error fetching factcheck settings:", error);
        return DEFAULT_FACTCHECK_SETTINGS;
      }

      const settings: FactCheckSettings = { ...DEFAULT_FACTCHECK_SETTINGS };

      data?.forEach((row) => {
        const value = row.value as { enabled?: boolean; value?: number; api_key?: string };
        
        switch (row.key) {
          case FACTCHECK_KEYS.AUTO_SCORE_THRESHOLD:
            settings.auto_score_threshold = value?.value ?? 70;
            break;
          case FACTCHECK_KEYS.EXPIRATION_DAYS:
            settings.expiration_days = value?.value ?? 30;
            break;
          case FACTCHECK_KEYS.EXTERNAL_API:
            settings.external_api_enabled = value?.enabled ?? false;
            settings.external_api_key = value?.api_key ?? "";
            break;
          case FACTCHECK_KEYS.AUTO_PUBLISH:
            settings.auto_publish = value?.enabled ?? false;
            break;
        }
      });

      return settings;
    },
  });
}

async function upsertSetting(key: string, value: Json) {
  const { data: existing } = await supabase
    .from("site_settings")
    .select("id")
    .eq("key", key)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("site_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("site_settings")
      .insert([{ key, value }]);
    if (error) throw error;
  }
}

export function useUpdateFactCheckSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value 
    }: { 
      key: string; 
      value: Json
    }) => {
      const dbKey = `factcheck.${key}`;
      await upsertSetting(dbKey, value);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factcheck-settings"] });
      toast.success("Configuração atualizada");
    },
    onError: (error) => {
      console.error("Error updating factcheck setting:", error);
      toast.error("Erro ao atualizar configuração");
    },
  });
}

export function useSaveFactCheckSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<FactCheckSettings>) => {
      if (settings.auto_score_threshold !== undefined) {
        await upsertSetting(FACTCHECK_KEYS.AUTO_SCORE_THRESHOLD, { value: settings.auto_score_threshold });
      }

      if (settings.expiration_days !== undefined) {
        await upsertSetting(FACTCHECK_KEYS.EXPIRATION_DAYS, { value: settings.expiration_days });
      }

      if (settings.external_api_enabled !== undefined || settings.external_api_key !== undefined) {
        await upsertSetting(FACTCHECK_KEYS.EXTERNAL_API, { 
          enabled: settings.external_api_enabled ?? false,
          api_key: settings.external_api_key ?? "",
        });
      }

      if (settings.auto_publish !== undefined) {
        await upsertSetting(FACTCHECK_KEYS.AUTO_PUBLISH, { enabled: settings.auto_publish });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["factcheck-settings"] });
      toast.success("Configurações salvas");
    },
    onError: (error) => {
      console.error("Error saving factcheck settings:", error);
      toast.error("Erro ao salvar configurações");
    },
  });
}
