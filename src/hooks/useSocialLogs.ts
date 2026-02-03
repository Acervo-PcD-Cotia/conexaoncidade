import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SocialPlatform, LogEvent } from "@/types/postsocial";

export interface SocialLog {
  id: string;
  target_id: string;
  event: LogEvent;
  payload_json: Record<string, unknown>;
  created_at: string;
  target?: {
    post_id: string;
    social_account?: {
      platform: SocialPlatform;
      display_name: string;
    };
    post?: {
      title: string;
    };
  };
}

interface UseSocialLogsOptions {
  targetId?: string;
  event?: LogEvent;
  limit?: number;
}

export function useSocialLogs(options: UseSocialLogsOptions = {}) {
  const { targetId, event, limit = 100 } = options;

  return useQuery({
    queryKey: ['social-logs', targetId, event, limit],
    queryFn: async () => {
      let query = supabase
        .from('social_post_logs')
        .select(`
          *,
          target:target_id (
            post_id,
            social_account:social_account_id (
              platform,
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (targetId) {
        query = query.eq('target_id', targetId);
      }
      
      if (event) {
        query = query.eq('event', event);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SocialLog[];
    },
  });
}

// Get logs for a specific post (all targets)
export function useSocialLogsByPost(postId: string | undefined) {
  return useQuery({
    queryKey: ['social-logs-by-post', postId],
    enabled: !!postId,
    queryFn: async () => {
      // First get all target IDs for this post
      const { data: targets, error: targetsError } = await supabase
        .from('social_post_targets')
        .select('id')
        .eq('post_id', postId!);
      
      if (targetsError) throw targetsError;
      if (!targets || targets.length === 0) return [];

      const targetIds = targets.map(t => t.id);

      const { data, error } = await supabase
        .from('social_post_logs')
        .select(`
          *,
          target:target_id (
            post_id,
            social_account:social_account_id (
              platform,
              display_name
            )
          )
        `)
        .in('target_id', targetIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SocialLog[];
    },
  });
}
