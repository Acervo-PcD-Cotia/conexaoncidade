import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const PERMISSIONS = {
  MANAGE_HOME: "manage_home",
  MANAGE_BANNERS: "manage_banners",
  MANAGE_ADS: "manage_ads",
  VIEW_ANALYTICS: "view_analytics",
  MANAGE_USERS: "manage_users",
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_CATEGORIES: "manage_categories",
  MANAGE_TAGS: "manage_tags",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.MANAGE_HOME]: "Gerenciar Home",
  [PERMISSIONS.MANAGE_BANNERS]: "Gerenciar Banners",
  [PERMISSIONS.MANAGE_ADS]: "Gerenciar Anúncios",
  [PERMISSIONS.VIEW_ANALYTICS]: "Ver Analytics",
  [PERMISSIONS.MANAGE_USERS]: "Gerenciar Usuários",
  [PERMISSIONS.MANAGE_SETTINGS]: "Gerenciar Configurações",
  [PERMISSIONS.MANAGE_CATEGORIES]: "Gerenciar Categorias",
  [PERMISSIONS.MANAGE_TAGS]: "Gerenciar Tags",
};

export const useUserPermissions = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const { data: permissions, isLoading } = useQuery({
    queryKey: ["user-permissions", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];

      const { data, error } = await supabase
        .from("user_permissions")
        .select("permission")
        .eq("user_id", targetUserId);

      if (error) throw error;
      return data.map((p) => p.permission as Permission);
    },
    enabled: !!targetUserId,
  });

  const { data: userRole } = useQuery({
    queryKey: ["user-role", targetUserId],
    queryFn: async () => {
      if (!targetUserId) return null;

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", targetUserId)
        .single();

      if (error) return null;
      return data.role;
    },
    enabled: !!targetUserId,
  });

  const hasPermission = (permission: Permission): boolean => {
    // Admins têm todas as permissões
    if (userRole === "admin") return true;
    return permissions?.includes(permission) || false;
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    if (userRole === "admin") return true;
    return perms.some((p) => permissions?.includes(p));
  };

  return {
    permissions: permissions || [],
    isLoading,
    hasPermission,
    hasAnyPermission,
    isAdmin: userRole === "admin",
  };
};
