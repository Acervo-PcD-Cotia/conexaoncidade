import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TopContributor {
  user_id: string;
  points: number;
  level: string;
  badges: string[] | null;
  share_count: number;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export function useTopContributors(limit = 5) {
  return useQuery({
    queryKey: ["top-contributors", limit],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from("community_members")
        .select("user_id, points, level, badges, share_count")
        .eq("is_suspended", false)
        .not("access_granted_at", "is", null)
        .order("points", { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!members?.length) return [];

      // Fetch profiles for the members
      const userIds = members.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);

      // Merge profile info
      const profileMap = new Map(profiles?.map((p) => [p.id, p]) || []);

      return members.map((member) => ({
        ...member,
        profile: profileMap.get(member.user_id) || null,
      })) as TopContributor[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
