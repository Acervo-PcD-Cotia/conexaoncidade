import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity, levelToNumber } from "@/hooks/useCommunity";
import { useToast } from "@/hooks/use-toast";

export type RewardType = "coupon" | "feature" | "exclusive" | "event";

export interface CommunityReward {
  id: string;
  name: string;
  description: string | null;
  points_required: number;
  reward_type: RewardType;
  level_required: string | null;
  coupon_code: string | null;
  valid_until: string | null;
  max_claims: number | null;
  current_claims: number;
  is_active: boolean;
  created_at: string;
}

export interface RewardClaim {
  id: string;
  reward_id: string;
  user_id: string;
  claimed_at: string;
}

export function useCommunityRewards() {
  const { user } = useAuth();
  const { membership } = useCommunity();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const currentPoints = Number(membership?.points) || 0;
  const currentLevel = levelToNumber[membership?.level || "supporter"] || 1;

  // Fetch all active rewards
  const {
    data: rewards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["community-rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_rewards")
        .select("*")
        .eq("is_active", true)
        .order("points_required");

      if (error) throw error;
      return data as CommunityReward[];
    },
    enabled: !!user,
  });

  // Fetch user's claims
  const { data: userClaims } = useQuery({
    queryKey: ["reward-claims", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("community_reward_claims")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as RewardClaim[];
    },
    enabled: !!user,
  });

  // Check if user can claim a reward
  const canClaim = (reward: CommunityReward): boolean => {
    // Check if already claimed
    if (userClaims?.some((c) => c.reward_id === reward.id)) {
      return false;
    }

    // Check max claims
    if (reward.max_claims && reward.current_claims >= reward.max_claims) {
      return false;
    }

    // Check validity
    if (reward.valid_until && new Date(reward.valid_until) < new Date()) {
      return false;
    }

    // Check points
    if (currentPoints < reward.points_required) {
      return false;
    }

    // Check level
    if (reward.level_required) {
      const requiredLevel = levelToNumber[reward.level_required] || 1;
      if (currentLevel < requiredLevel) {
        return false;
      }
    }

    return true;
  };

  // Claim reward
  const claimReward = useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error("Usuário não autenticado");

      const reward = rewards?.find((r) => r.id === rewardId);
      if (!reward) throw new Error("Recompensa não encontrada");

      if (!canClaim(reward)) {
        throw new Error("Você não pode resgatar esta recompensa");
      }

      // Insert claim
      const { error: claimError } = await supabase
        .from("community_reward_claims")
        .insert({
          reward_id: rewardId,
          user_id: user.id,
        });

      if (claimError) throw claimError;

      // Update claim count
      const { error: updateError } = await supabase
        .from("community_rewards")
        .update({ current_claims: (reward.current_claims || 0) + 1 })
        .eq("id", rewardId);

      if (updateError) throw updateError;

      return reward;
    },
    onSuccess: (reward) => {
      queryClient.invalidateQueries({ queryKey: ["community-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["reward-claims"] });
      toast({
        title: "Recompensa resgatada! 🎉",
        description: reward.coupon_code
          ? `Seu código: ${reward.coupon_code}`
          : `Você desbloqueou: ${reward.name}`,
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao resgatar",
        description: error.message,
      });
    },
  });

  // Categorize rewards
  const availableRewards = rewards?.filter((r) => canClaim(r)) || [];
  const claimedRewards = rewards?.filter((r) =>
    userClaims?.some((c) => c.reward_id === r.id)
  ) || [];
  const lockedRewards = rewards?.filter(
    (r) => !canClaim(r) && !userClaims?.some((c) => c.reward_id === r.id)
  ) || [];

  return {
    rewards,
    availableRewards,
    claimedRewards,
    lockedRewards,
    userClaims,
    isLoading,
    error,
    canClaim,
    claimReward,
  };
}
