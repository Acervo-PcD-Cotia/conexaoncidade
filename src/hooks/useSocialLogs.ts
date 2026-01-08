import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SocialLog {
  id: string;
  social_post_id: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details: Record<string, unknown>;
  created_at: string;
  social_post?: {
    platform: string;
    news?: {
      title: string;
    };
  };
}

interface UseSocialLogsOptions {
  postId?: string;
  level?: 'info' | 'warn' | 'error';
  limit?: number;
}

export function useSocialLogs(options: UseSocialLogsOptions = {}) {
  const { postId, level, limit = 100 } = options;

  return useQuery({
    queryKey: ['social-logs', postId, level, limit],
    queryFn: async () => {
      let query = supabase
        .from('social_logs')
        .select(`
          *,
          social_post:social_post_id (
            platform,
            news:news_id (
              title
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (postId) {
        query = query.eq('social_post_id', postId);
      }
      
      if (level) {
        query = query.eq('level', level);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SocialLog[];
    },
  });
}
