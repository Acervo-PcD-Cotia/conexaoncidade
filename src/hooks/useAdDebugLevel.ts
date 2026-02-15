import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useRequireRole";

export type AdDebugLevel = "public" | "admin" | "superadmin";

/**
 * Returns the effective ad label display level based on:
 * 1. The site_settings.ad_debug_level configuration
 * 2. The current user's role (caps the level)
 * 
 * Public users always see "public" regardless of setting.
 * Admins see up to "admin". Super admins see up to "superadmin".
 */
export function useAdDebugLevel(): AdDebugLevel {
  const { role, loading: roleLoading } = useUserRole();

  const { data: configLevel } = useQuery({
    queryKey: ["ad-debug-level"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "ad_debug_level")
        .maybeSingle();

      const val = (data?.value as { level?: string })?.level;
      if (val === "superadmin" || val === "admin") return val;
      return "public" as AdDebugLevel;
    },
    staleTime: 5 * 60 * 1000,
  });

  if (roleLoading) return "public";

  const setting = configLevel || "public";

  // Cap by user role
  if (role === "super_admin") return setting;
  if (role === "admin" || role === "editor" || role === "editor_chief") {
    return setting === "superadmin" ? "admin" : setting;
  }

  return "public";
}
