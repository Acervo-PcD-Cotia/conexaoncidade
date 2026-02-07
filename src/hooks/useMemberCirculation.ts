import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useMemberCirculation() {
  const { user } = useAuth();

  const { data: memberData } = useQuery({
    queryKey: ['member-ref-code', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('community_members')
        .select('ref_code, city, neighborhood')
        .eq('user_id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
    staleTime: 10 * 60 * 1000,
  });

  const refCode = memberData?.ref_code as string | null;
  const city = (memberData?.city as string) || 'Cotia';

  const { data: recentNews = [] } = useQuery({
    queryKey: ['recent-news-for-share'],
    queryFn: async () => {
      const { data } = await supabase
        .from('news')
        .select('id, title, slug, excerpt, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(10);
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: clickCounts = {} } = useQuery({
    queryKey: ['member-click-counts', refCode],
    queryFn: async () => {
      if (!refCode) return {};
      const { data } = await supabase
        .from('news_clicks' as any)
        .select('news_id')
        .eq('ref_code', refCode)
        .gte('clicked_at', thirtyDaysAgo);
      
      if (!data) return {};
      
      const counts: Record<string, number> = {};
      (data as unknown as Array<{ news_id: string }>).forEach((row) => {
        counts[row.news_id] = (counts[row.news_id] || 0) + 1;
      });
      return counts;
    },
    enabled: !!refCode,
    staleTime: 2 * 60 * 1000,
  });

  const totalClicks = Object.values(clickCounts).reduce((sum, c) => sum + c, 0);

  return {
    refCode,
    city,
    recentNews,
    clickCounts,
    totalClicks,
    isReady: !!refCode,
  };
}
