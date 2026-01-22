import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ProfileStatus = "pending" | "approved" | "rejected";

interface ProfileStatusResult {
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  status: ProfileStatus | null;
  isLoading: boolean;
}

export function useProfileStatus(): ProfileStatusResult {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile-status", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("profile_status")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error fetching profile status:", error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Type assertion for profile_status since the column was just added
  const status = ((profile as { profile_status?: string })?.profile_status as ProfileStatus) || null;

  return {
    isApproved: status === "approved",
    isPending: status === "pending" || status === null,
    isRejected: status === "rejected",
    status,
    isLoading,
  };
}
