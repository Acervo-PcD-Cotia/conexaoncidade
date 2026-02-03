import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SocialPlatform, PostGlobalStatus, PostTargetStatus, SocialMediaItem } from "@/types/postsocial";

export interface SocialPost {
  id: string;
  origin_type: 'news' | 'ad' | 'publidoor' | 'campaign360' | 'manual';
  origin_id: string | null;
  title: string;
  base_caption: string | null;
  link_url: string | null;
  media_json: SocialMediaItem[];
  hashtags: string[];
  utm_params: Record<string, string>;
  status_global: PostGlobalStatus;
  template_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  targets?: SocialPostTarget[];
}

export interface SocialPostTarget {
  id: string;
  post_id: string;
  social_account_id: string;
  caption_override: string | null;
  scheduled_at: string | null;
  posted_at: string | null;
  status: PostTargetStatus;
  provider_post_id: string | null;
  provider_post_url: string | null;
  attempts: number;
  last_attempt_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  social_account?: {
    platform: SocialPlatform;
    display_name: string;
  };
}

export const STATUS_LABELS: Record<PostGlobalStatus | PostTargetStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  queued: 'Na Fila',
  processing: 'Processando...',
  done: 'Publicado',
  failed: 'Falhou',
  assisted: 'Assistido',
};

export const STATUS_COLORS: Record<PostGlobalStatus | PostTargetStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-100 text-blue-800',
  queued: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-purple-100 text-purple-800',
  done: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  assisted: 'bg-orange-100 text-orange-800',
};

interface UseSocialPostsOptions {
  status?: PostGlobalStatus[];
  originType?: SocialPost['origin_type'];
  originId?: string;
  limit?: number;
}

export function useSocialPosts(options: UseSocialPostsOptions = {}) {
  const queryClient = useQueryClient();
  const { status, originType, originId, limit = 50 } = options;

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['social-posts', status, originType, originId, limit],
    queryFn: async () => {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          targets:social_post_targets (
            *,
            social_account:social_account_id (
              platform,
              display_name
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status && status.length > 0) {
        query = query.in('status_global', status);
      }
      
      if (originType) {
        query = query.eq('origin_type', originType);
      }
      
      if (originId) {
        query = query.eq('origin_id', originId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Map to typed interface
      return (data ?? []).map(row => ({
        ...row,
        media_json: (Array.isArray(row.media_json) ? row.media_json : []) as unknown as SocialMediaItem[],
        hashtags: row.hashtags ?? [],
        utm_params: (typeof row.utm_params === 'object' && row.utm_params !== null && !Array.isArray(row.utm_params) 
          ? row.utm_params 
          : {}) as Record<string, string>,
        targets: row.targets,
      })) as SocialPost[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PostGlobalStatus }) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ status_global: status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Status atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  const updateTargetStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PostTargetStatus }) => {
      const { error } = await supabase
        .from('social_post_targets')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Status do target atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  const approvePost = useMutation({
    mutationFn: async (id: string) => {
      // Update all targets to scheduled
      const { error: targetsError } = await supabase
        .from('social_post_targets')
        .update({ status: 'scheduled' })
        .eq('post_id', id)
        .eq('status', 'draft');
      
      if (targetsError) throw targetsError;

      // Update main post status
      const { error } = await supabase
        .from('social_posts')
        .update({ status_global: 'scheduled' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Log approval
      const { data: targets } = await supabase
        .from('social_post_targets')
        .select('id')
        .eq('post_id', id);
      
      if (targets && targets.length > 0) {
        await supabase.from('social_post_logs').insert(
          targets.map(t => ({
            target_id: t.id,
            event: 'queued' as const,
            payload_json: { action: 'approved' },
          }))
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Post aprovado e adicionado à fila');
    },
    onError: (error) => {
      toast.error('Erro ao aprovar post: ' + error.message);
    },
  });

  const cancelPost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ status_global: 'draft' })
        .eq('id', id);
      
      if (error) throw error;

      // Also update targets
      await supabase
        .from('social_post_targets')
        .update({ status: 'draft' })
        .eq('post_id', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Post cancelado');
    },
    onError: (error) => {
      toast.error('Erro ao cancelar post: ' + error.message);
    },
  });

  const retryPost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_post_targets')
        .update({ 
          status: 'scheduled',
          error_message: null,
          attempts: 0,
        })
        .eq('post_id', id)
        .eq('status', 'failed');
      
      if (error) throw error;
      
      // Update main post
      await supabase
        .from('social_posts')
        .update({ status_global: 'scheduled' })
        .eq('id', id);
      
      // Log retry
      const { data: targets } = await supabase
        .from('social_post_targets')
        .select('id')
        .eq('post_id', id);
      
      if (targets && targets.length > 0) {
        await supabase.from('social_post_logs').insert(
          targets.map(t => ({
            target_id: t.id,
            event: 'retry' as const,
            payload_json: { action: 'manual_retry' },
          }))
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Post adicionado à fila para nova tentativa');
    },
    onError: (error) => {
      toast.error('Erro ao reprocessar post: ' + error.message);
    },
  });

  const updateCaption = useMutation({
    mutationFn: async ({ id, caption }: { id: string; caption: string }) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ base_caption: caption })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Legenda atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar legenda: ' + error.message);
    },
  });

  return {
    posts,
    isLoading,
    refetch,
    updateStatus,
    updateTargetStatus,
    approvePost,
    cancelPost,
    retryPost,
    updateCaption,
  };
}

export function useSocialStats() {
  return useQuery({
    queryKey: ['social-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all posts with targets
      const { data: allPosts, error: postsError } = await supabase
        .from('social_posts')
        .select('id, status_global, created_at');
      
      if (postsError) throw postsError;

      // Get all targets with account info
      const { data: allTargets, error: targetsError } = await supabase
        .from('social_post_targets')
        .select(`
          id, 
          status, 
          posted_at,
          social_account:social_account_id (
            platform
          )
        `);
      
      if (targetsError) throw targetsError;
      
      const todayPosts = allPosts?.filter(p => new Date(p.created_at) >= today) ?? [];
      
      // Count by platform (only done targets)
      const platformCounts: Record<SocialPlatform, number> = {
        instagram: 0,
        facebook: 0,
        x: 0,
        linkedin: 0,
        tiktok: 0,
        youtube: 0,
        pinterest: 0,
        whatsapp: 0,
        telegram: 0,
      };

      allTargets?.forEach(t => {
        if (t.status === 'done' && t.social_account) {
          const platform = (t.social_account as { platform: SocialPlatform }).platform;
          if (platform in platformCounts) {
            platformCounts[platform]++;
          }
        }
      });
      
      return {
        total: allPosts?.length ?? 0,
        today: todayPosts.length,
        queued: allPosts?.filter(p => p.status_global === 'scheduled').length ?? 0,
        needsReview: allPosts?.filter(p => p.status_global === 'draft').length ?? 0,
        posted: allPosts?.filter(p => p.status_global === 'done').length ?? 0,
        failed: allPosts?.filter(p => p.status_global === 'failed').length ?? 0,
        byPlatform: platformCounts,
      };
    },
  });
}
