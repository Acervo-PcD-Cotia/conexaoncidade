import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface EditionAccessResult {
  has_access: boolean;
  reason: 'edition_not_found' | 'not_community_member' | 'member_suspended' | 'free_period' | 'has_points' | 'insufficient_points' | 'community_member';
  user_points: number;
  required_points: number;
  free_until: string | null;
}

export function useEditionAccess(userId?: string, editionId?: string) {
  return useQuery({
    queryKey: ['edition-access', userId, editionId],
    queryFn: async (): Promise<EditionAccessResult | null> => {
      if (!userId || !editionId) return null;

      const { data, error } = await supabase
        .rpc('check_edition_access', {
          _user_id: userId,
          _edition_id: editionId
        });

      if (error) throw error;
      
      // The function returns a table, so data is an array
      return data && data.length > 0 ? data[0] as EditionAccessResult : null;
    },
    enabled: !!userId && !!editionId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
