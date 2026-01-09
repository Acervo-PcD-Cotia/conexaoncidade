import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useCommunity } from './useCommunity';

type ContentType = 'news' | 'project' | 'campaign' | 'story';
type Platform = 'whatsapp' | 'facebook' | 'instagram' | 'x' | 'linkedin' | 'copy';

interface RegisterShareParams {
  contentType: ContentType;
  contentId: string;
  platform: Platform;
}

export function useCommunityShares() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { membership, ensureMembership } = useCommunity();

  const registerShareMutation = useMutation({
    mutationFn: async ({ contentType, contentId, platform }: RegisterShareParams) => {
      if (!user) return null; // No need to track if not logged in

      // Ensure membership record exists
      let membershipExists = !!membership;
      if (!membershipExists) {
        const { data } = await supabase
          .from('community_members')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (!data) {
          // Create membership record
          await supabase
            .from('community_members')
            .insert({ user_id: user.id });
        }
        membershipExists = true;
      }

      // Calculate points based on content type
      const pointsMap: Record<ContentType, number> = {
        news: 10,
        project: 15,
        campaign: 15,
        story: 10,
      };
      const pointsEarned = pointsMap[contentType];

      // Register the share
      const { data: share, error: shareError } = await supabase
        .from('community_shares')
        .insert({
          user_id: user.id,
          content_type: contentType,
          content_id: contentId,
          platform,
          points_earned: pointsEarned,
        })
        .select()
        .single();

      if (shareError) throw shareError;

      // Update member's share count and points
      const { data: currentMember } = await supabase
        .from('community_members')
        .select('share_count, points')
        .eq('user_id', user.id)
        .single();

      if (currentMember) {
        const newShareCount = (currentMember.share_count || 0) + 1;
        const newPoints = (currentMember.points || 0) + pointsEarned;

        await supabase
          .from('community_members')
          .update({ 
            share_count: newShareCount,
            points: newPoints,
          })
          .eq('user_id', user.id);

        // Record points history
        await supabase
          .from('community_points_history')
          .insert({
            user_id: user.id,
            points: pointsEarned,
            action_type: contentType === 'news' ? 'share_news' : 'share_project',
            reference_id: contentId,
            description: `Compartilhou ${contentType === 'news' ? 'notícia' : 'conteúdo'} no ${platform}`,
          });

        // Check if user just unlocked access
        if (newShareCount >= 12 && (currentMember.share_count || 0) < 12) {
          return { unlocked: true, shareCount: newShareCount, points: newPoints };
        }

        return { unlocked: false, shareCount: newShareCount, points: newPoints };
      }

      return share;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['community-membership'] });
      
      if (data && typeof data === 'object' && 'unlocked' in data && data.unlocked) {
        toast({
          title: '🎉 Parabéns!',
          description: 'Você desbloqueou o acesso à Comunidade! Agora você é um Membro Fundador.',
        });
      }
    },
    onError: (error: Error) => {
      console.error('Error registering share:', error);
    },
  });

  return {
    registerShare: registerShareMutation.mutate,
    isRegistering: registerShareMutation.isPending,
  };
}
