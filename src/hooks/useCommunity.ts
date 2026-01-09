import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface CommunityMember {
  id: string;
  user_id: string;
  level: 'supporter' | 'collaborator' | 'ambassador' | 'leader';
  points: number;
  share_count: number;
  access_granted_at: string | null;
  access_method: 'invite' | 'challenge' | null;
  badges: string[];
  bio: string | null;
  terms_accepted_at: string | null;
  is_suspended: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommunityGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string;
  is_active: boolean;
  member_count: number;
  post_count: number;
}

export function useCommunity() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current user's membership
  const { data: membership, isLoading: membershipLoading } = useQuery({
    queryKey: ['community-membership', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('community_members')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as CommunityMember | null;
    },
    enabled: !!user,
  });

  // Check if user has community access
  const hasAccess = !!(membership?.access_granted_at && !membership?.is_suspended);

  // Get share progress (X/12)
  const shareProgress = membership?.share_count || 0;
  const sharesRemaining = Math.max(0, 12 - shareProgress);

  // Fetch groups
  const { data: groups } = useQuery({
    queryKey: ['community-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('community_groups')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      
      if (error) throw error;
      return data as CommunityGroup[];
    },
  });

  // Create or update membership record
  const ensureMembershipMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Check if record exists
      const { data: existing } = await supabase
        .from('community_members')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (existing) return existing;
      
      // Create new record
      const { data, error } = await supabase
        .from('community_members')
        .insert({ user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-membership'] });
    },
  });

  // Use invite code
  const useInviteMutation = useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error('Usuário não autenticado');
      
      // Find invite
      const { data: invite, error: findError } = await supabase
        .from('community_invites')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('status', 'pending')
        .maybeSingle();
      
      if (findError) throw findError;
      if (!invite) throw new Error('Código de convite inválido ou expirado');
      
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        throw new Error('Este convite expirou');
      }
      
      // Mark invite as used
      await supabase
        .from('community_invites')
        .update({ 
          used_by: user.id, 
          used_at: new Date().toISOString(),
          status: 'used',
          use_count: (invite.use_count || 0) + 1
        })
        .eq('id', invite.id);
      
      // Ensure membership exists
      await ensureMembershipMutation.mutateAsync();
      
      // Grant access
      const { error: updateError } = await supabase
        .from('community_members')
        .update({ 
          access_granted_at: new Date().toISOString(),
          access_method: 'invite',
          invited_by: invite.created_by,
          badges: ['invited_member']
        })
        .eq('user_id', user.id);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-membership'] });
      toast({
        title: 'Bem-vindo à Comunidade!',
        description: 'Seu acesso foi liberado com sucesso.',
      });
    },
    onError: (error: Error) => {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: error.message,
      });
    },
  });

  // Accept terms
  const acceptTermsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Usuário não autenticado');
      
      const { error } = await supabase
        .from('community_members')
        .update({ terms_accepted_at: new Date().toISOString() })
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-membership'] });
    },
  });

  return {
    membership,
    hasAccess,
    shareProgress,
    sharesRemaining,
    groups,
    isLoading: membershipLoading,
    ensureMembership: ensureMembershipMutation.mutate,
    useInvite: useInviteMutation.mutate,
    isUsingInvite: useInviteMutation.isPending,
    acceptTerms: acceptTermsMutation.mutate,
  };
}

// Level labels in Portuguese
export const levelLabels: Record<string, string> = {
  supporter: 'Apoiador',
  collaborator: 'Colaborador',
  ambassador: 'Embaixador',
  leader: 'Líder',
};

// Badge labels
export const badgeLabels: Record<string, string> = {
  founding_member: 'Membro Fundador',
  invited_member: 'Convidado',
  top_contributor: 'Top Contribuidor',
  verified: 'Verificado',
};

// Points needed for each level
export const levelThresholds = {
  supporter: 0,
  collaborator: 500,
  ambassador: 2000,
  leader: 5000,
};
