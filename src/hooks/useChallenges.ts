import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: 'weekly' | 'monthly' | 'special' | 'seasonal';
  start_date: string;
  end_date: string;
  goal_type: 'points' | 'shares' | 'comments' | 'readings' | 'referrals';
  goal_value: number;
  reward_type: 'badge' | 'points' | 'early_access' | 'exclusive_content';
  reward_value: string | null;
  reward_description: string | null;
  icon: string | null;
  is_active: boolean;
}

export interface ChallengeProgress {
  id: string;
  challenge_id: string;
  user_id: string;
  current_value: number;
  completed_at: string | null;
  reward_claimed_at: string | null;
}

export interface ChallengeWithProgress extends Challenge {
  progress: ChallengeProgress | null;
}

export function useChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: challenges, isLoading } = useQuery({
    queryKey: ['community-challenges', user?.id],
    queryFn: async () => {
      // Fetch active challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', new Date().toISOString())
        .gte('end_date', new Date().toISOString())
        .order('challenge_type', { ascending: true });

      if (challengesError) throw challengesError;

      // If user is logged in, fetch their progress
      let progressData: ChallengeProgress[] = [];
      if (user) {
        const { data: progress, error: progressError } = await supabase
          .from('community_challenge_progress')
          .select('*')
          .eq('user_id', user.id);

        if (!progressError && progress) {
          progressData = progress as ChallengeProgress[];
        }
      }

      // Merge challenges with progress
      const challengesWithProgress: ChallengeWithProgress[] = (challengesData as Challenge[]).map(challenge => ({
        ...challenge,
        progress: progressData.find(p => p.challenge_id === challenge.id) || null
      }));

      return challengesWithProgress;
    },
  });

  const claimRewardMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Get the challenge info
      const challenge = challenges?.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');
      if (!challenge.progress?.completed_at) throw new Error('Challenge not completed');
      if (challenge.progress?.reward_claimed_at) throw new Error('Reward already claimed');

      // Mark reward as claimed
      const { error: updateError } = await supabase
        .from('community_challenge_progress')
        .update({ reward_claimed_at: new Date().toISOString() })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // If reward is points, add them
      if (challenge.reward_type === 'points' && challenge.reward_value) {
        const bonusPoints = parseInt(challenge.reward_value, 10);

        // Get current member points
        const { data: member } = await supabase
          .from('community_members')
          .select('points')
          .eq('user_id', user.id)
          .single();

        if (member) {
          // Update member points
          await supabase
            .from('community_members')
            .update({ points: (member.points || 0) + bonusPoints })
            .eq('user_id', user.id);

          // Add to points history
          await supabase.from('community_points_history').insert({
            user_id: user.id,
            action_type: 'challenge_complete',
            points: bonusPoints,
            description: `Desafio completado: ${challenge.title}`,
            reference_id: challengeId
          });
        }
      }

      // If reward is a badge, add it
      if (challenge.reward_type === 'badge' && challenge.reward_value) {
        const { data: member } = await supabase
          .from('community_members')
          .select('badges')
          .eq('user_id', user.id)
          .single();

        if (member) {
          const currentBadges = member.badges || [];
          if (!currentBadges.includes(challenge.reward_value)) {
            await supabase
              .from('community_members')
              .update({ badges: [...currentBadges, challenge.reward_value] })
              .eq('user_id', user.id);
          }
        }
      }

      return challenge;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ['community-challenges'] });
      queryClient.invalidateQueries({ queryKey: ['community-membership'] });
      toast.success(`🎉 Recompensa resgatada: ${challenge.reward_description}`);
    },
    onError: (error) => {
      console.error('Error claiming reward:', error);
      toast.error('Erro ao resgatar recompensa');
    }
  });

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Encerrado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} dia${days > 1 ? 's' : ''}`;
    return `${hours}h`;
  };

  return {
    challenges: challenges || [],
    isLoading,
    claimReward: claimRewardMutation.mutate,
    isClaimingReward: claimRewardMutation.isPending,
    getTimeRemaining
  };
}
