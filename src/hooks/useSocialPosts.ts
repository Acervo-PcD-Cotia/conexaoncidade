import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { SocialPlatform } from "./useSocialAccounts";

export type SocialPostStatus = 'draft' | 'queued' | 'needs_review' | 'posting' | 'posted' | 'failed' | 'cancelled';

export interface SocialPost {
  id: string;
  news_id: string;
  platform: SocialPlatform;
  status: SocialPostStatus;
  scheduled_at: string | null;
  posted_at: string | null;
  external_post_id: string | null;
  external_post_url: string | null;
  payload: {
    title?: string;
    description?: string;
    link?: string;
    image?: string;
    custom_caption?: string;
  };
  error_message: string | null;
  retries_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  news?: {
    title: string;
    slug: string;
    featured_image_url: string | null;
    category?: {
      name: string;
      color: string;
    };
  };
}

export const STATUS_LABELS: Record<SocialPostStatus, string> = {
  draft: 'Rascunho',
  queued: 'Na fila',
  needs_review: 'Aguardando revisão',
  posting: 'Publicando...',
  posted: 'Publicado',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export const STATUS_COLORS: Record<SocialPostStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  queued: 'bg-blue-100 text-blue-800',
  needs_review: 'bg-yellow-100 text-yellow-800',
  posting: 'bg-purple-100 text-purple-800',
  posted: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

interface UseSocialPostsOptions {
  status?: SocialPostStatus[];
  platform?: SocialPlatform;
  newsId?: string;
  limit?: number;
}

export function useSocialPosts(options: UseSocialPostsOptions = {}) {
  const queryClient = useQueryClient();
  const { status, platform, newsId, limit = 50 } = options;

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['social-posts', status, platform, newsId, limit],
    queryFn: async () => {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          news:news_id (
            title,
            slug,
            featured_image_url,
            category:category_id (
              name,
              color
            )
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status && status.length > 0) {
        query = query.in('status', status);
      }
      
      if (platform) {
        query = query.eq('platform', platform);
      }
      
      if (newsId) {
        query = query.eq('news_id', newsId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as SocialPost[];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: SocialPostStatus }) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ status })
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

  const approvePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ status: 'queued' })
        .eq('id', id);
      
      if (error) throw error;
      
      // Log approval
      await supabase.from('social_logs').insert({
        social_post_id: id,
        level: 'info',
        message: 'Post aprovado para publicação',
      });
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
        .update({ status: 'cancelled' })
        .eq('id', id);
      
      if (error) throw error;
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
        .from('social_posts')
        .update({ 
          status: 'queued',
          error_message: null,
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Log retry
      await supabase.from('social_logs').insert({
        social_post_id: id,
        level: 'info',
        message: 'Post re-adicionado à fila para nova tentativa',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-posts'] });
      toast.success('Post adicionado à fila para nova tentativa');
    },
    onError: (error) => {
      toast.error('Erro ao reprocessar post: ' + error.message);
    },
  });

  const updatePayload = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: SocialPost['payload'] }) => {
      const { error } = await supabase
        .from('social_posts')
        .update({ payload })
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
    approvePost,
    cancelPost,
    retryPost,
    updatePayload,
  };
}

export function useSocialStats() {
  return useQuery({
    queryKey: ['social-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: allPosts, error } = await supabase
        .from('social_posts')
        .select('status, platform, created_at, posted_at');
      
      if (error) throw error;
      
      const todayPosts = allPosts?.filter(p => new Date(p.created_at) >= today) ?? [];
      
      return {
        total: allPosts?.length ?? 0,
        today: todayPosts.length,
        queued: allPosts?.filter(p => p.status === 'queued').length ?? 0,
        needsReview: allPosts?.filter(p => p.status === 'needs_review').length ?? 0,
        posted: allPosts?.filter(p => p.status === 'posted').length ?? 0,
        failed: allPosts?.filter(p => p.status === 'failed').length ?? 0,
        byPlatform: {
          meta_facebook: allPosts?.filter(p => p.platform === 'meta_facebook' && p.status === 'posted').length ?? 0,
          meta_instagram: allPosts?.filter(p => p.platform === 'meta_instagram' && p.status === 'posted').length ?? 0,
          x: allPosts?.filter(p => p.platform === 'x' && p.status === 'posted').length ?? 0,
          linkedin: allPosts?.filter(p => p.platform === 'linkedin' && p.status === 'posted').length ?? 0,
          telegram: allPosts?.filter(p => p.platform === 'telegram' && p.status === 'posted').length ?? 0,
        },
      };
    },
  });
}
