// Hook para autenticação de parceiros Publidoor
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { PublidoorAdvertiser } from '@/types/publidoor';

export interface PartnerAuthState {
  user: ReturnType<typeof useAuth>['user'];
  advertiser: PublidoorAdvertiser | null;
  isPartner: boolean;
  isLoading: boolean;
  isError: boolean;
}

export function usePartnerAuth(): PartnerAuthState {
  const { user, isLoading: authLoading } = useAuth();

  const { data: advertiser, isLoading: loadingAdvertiser, isError } = useQuery({
    queryKey: ['partner-advertiser', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('publidoor_advertisers')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error) {
        console.error('Error fetching partner advertiser:', error);
        return null;
      }
      
      return data as PublidoorAdvertiser;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    advertiser: advertiser ?? null,
    isPartner: !!advertiser,
    isLoading: authLoading || loadingAdvertiser,
    isError,
  };
}
