import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useRequireRole";
import { supabase } from "@/integrations/supabase/client";

export function useBroadcastAccess() {
  const { user } = useAuth();
  const { isSuperAdmin, isAdmin } = useUserRole();
  
  const { data: hostAccess, isLoading } = useQuery({
    queryKey: ["broadcast-host-access", user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      // Use raw query since types may not be updated yet
      const { data, error } = await supabase
        .rpc('has_community_access', { _user_id: user.id })
        .then(() => 
          // Check broadcast_hosts table
          supabase
            .from("broadcast_hosts" as any)
            .select("id")
            .eq("user_id", user.id)
            .eq("is_active", true)
        );
      
      if (error) {
        console.error("Error checking broadcast host access:", error);
        return false;
      }
      
      return data && data.length > 0;
    },
    enabled: !!user?.id && !isSuperAdmin && !isAdmin,
  });

  return {
    hasStudioAccess: isSuperAdmin || isAdmin || hostAccess === true,
    isLoading: !isSuperAdmin && !isAdmin && isLoading,
  };
}
