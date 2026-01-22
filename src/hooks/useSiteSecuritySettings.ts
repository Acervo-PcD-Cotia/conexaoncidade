import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SecuritySettings {
  require_email_verification: boolean;
  admin_auth_required: boolean;
  session_timeout_minutes: number;
}

const DEFAULT_SECURITY_SETTINGS: SecuritySettings = {
  require_email_verification: false,
  admin_auth_required: true,
  session_timeout_minutes: 60,
};

const SECURITY_KEYS = {
  EMAIL_VERIFICATION: "security.require_email_verification",
  ADMIN_AUTH: "security.admin_auth_required",
  SESSION_TIMEOUT: "security.session_timeout_minutes",
};

export function useSiteSecuritySettings() {
  return useQuery({
    queryKey: ["site-security-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value")
        .like("key", "security.%");

      if (error) {
        console.error("Error fetching security settings:", error);
        return DEFAULT_SECURITY_SETTINGS;
      }

      const settings: SecuritySettings = { ...DEFAULT_SECURITY_SETTINGS };

      data?.forEach((row) => {
        const value = row.value as { enabled?: boolean; value?: number };
        
        switch (row.key) {
          case SECURITY_KEYS.EMAIL_VERIFICATION:
            settings.require_email_verification = value?.enabled ?? false;
            break;
          case SECURITY_KEYS.ADMIN_AUTH:
            settings.admin_auth_required = value?.enabled ?? true;
            break;
          case SECURITY_KEYS.SESSION_TIMEOUT:
            settings.session_timeout_minutes = value?.value ?? 60;
            break;
        }
      });

      return settings;
    },
  });
}

export function useUpdateSecuritySetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      key, 
      value 
    }: { 
      key: keyof SecuritySettings; 
      value: boolean | number 
    }) => {
      const dbKey = key === "require_email_verification" 
        ? SECURITY_KEYS.EMAIL_VERIFICATION
        : key === "admin_auth_required"
        ? SECURITY_KEYS.ADMIN_AUTH
        : SECURITY_KEYS.SESSION_TIMEOUT;

      const dbValue = typeof value === "boolean" 
        ? { enabled: value }
        : { value };

      // Upsert the setting
      const { error } = await supabase
        .from("site_settings")
        .upsert({
          key: dbKey,
          value: dbValue,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: "tenant_id,key",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-security-settings"] });
      toast.success("Configuração de segurança atualizada");
    },
    onError: (error) => {
      console.error("Error updating security setting:", error);
      toast.error("Erro ao atualizar configuração");
    },
  });
}
