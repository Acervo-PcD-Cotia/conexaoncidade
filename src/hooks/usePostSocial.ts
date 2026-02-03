import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";
import type {
  SocialAccount,
  SocialPost,
  SocialPostTarget,
  SocialPostLog,
  SocialTemplate,
  SocialPlatform,
  SocialTargetStatus,
  SocialOriginType,
  CreateSocialPostInput,
  CreateSocialAccountInput,
  PostSocialFilters,
  PostSocialStats,
  SocialMediaItem,
} from "@/types/postsocial";

// ============================================
// Social Accounts Hooks
// ============================================

export function useSocialAccountsNew() {
  return useQuery({
    queryKey: ['postsocial-accounts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .order('platform');
      
      if (error) throw error;
      return data as unknown as SocialAccount[];
    },
  });
}

export function useActiveSocialAccounts() {
  return useQuery({
    queryKey: ['postsocial-accounts', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('is_active', true)
        .order('platform');
      
      if (error) throw error;
      return data as unknown as SocialAccount[];
    },
  });
}

export function useDefaultSocialAccounts() {
  return useQuery({
    queryKey: ['postsocial-accounts', 'default'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_accounts')
        .select('*')
        .eq('is_active', true)
        .eq('default_enabled', true)
        .order('platform');
      
      if (error) throw error;
      return data as unknown as SocialAccount[];
    },
  });
}

export function useCreateSocialAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSocialAccountInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('social_accounts')
        .insert([{
          user_id: userData.user.id,
          platform: input.platform as "facebook" | "instagram" | "linkedin" | "pinterest" | "telegram" | "tiktok" | "whatsapp" | "x" | "youtube",
          display_name: input.display_name,
          username: input.username || null,
          account_type: input.account_type || 'page',
          provider_account_id: input.provider_account_id || null,
          default_enabled: input.default_enabled ?? false,
          settings: (input.settings || {}) as Json,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-accounts'] });
      toast.success('Conta adicionada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar conta: ' + error.message);
    },
  });
}

export function useUpdateSocialAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; is_active?: boolean; default_enabled?: boolean; display_name?: string; username?: string }) => {
      const { data, error } = await supabase
        .from('social_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-accounts'] });
      toast.success('Conta atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar conta: ' + error.message);
    },
  });
}

export function useDeleteSocialAccount() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_accounts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-accounts'] });
      toast.success('Conta removida');
    },
    onError: (error) => {
      toast.error('Erro ao remover conta: ' + error.message);
    },
  });
}

// ============================================
// Social Posts Hooks
// ============================================

export function useSocialPosts(filters?: PostSocialFilters) {
  return useQuery({
    queryKey: ['postsocial-posts', filters],
    queryFn: async () => {
      let query = supabase
        .from('social_posts')
        .select(`
          *,
          targets:social_post_targets(
            *,
            social_account:social_accounts(*)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.origin_type && filters.origin_type !== 'all') {
        query = query.eq('origin_type', filters.origin_type);
      }
      
      if (filters?.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as unknown as SocialPost[];
    },
  });
}

export function useSocialPost(id: string | undefined) {
  return useQuery({
    queryKey: ['postsocial-post', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          targets:social_post_targets(
            *,
            social_account:social_accounts(*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as unknown as SocialPost;
    },
    enabled: !!id,
  });
}

export function useCreateSocialPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: CreateSocialPostInput) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const hasSchedule = input.targets.some(t => t.scheduled_at);
      
      // Create the master post
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .insert([{
          user_id: userData.user.id,
          origin_type: (input.origin_type || 'manual') as "ad" | "campaign360" | "manual" | "news" | "publidoor",
          origin_id: input.origin_id || null,
          title: input.title,
          base_caption: input.base_caption || null,
          link_url: input.link_url || null,
          media_json: (input.media_json || []) as unknown as Json,
          hashtags: input.hashtags || null,
          utm_params: (input.utm_params || {}) as Json,
          template_id: input.template_id || null,
          created_by: userData.user.id,
          status_global: hasSchedule ? 'scheduled' : 'draft',
        }])
        .select()
        .single();
      
      if (postError) throw postError;
      
      // Create targets for each selected account
      if (input.targets.length > 0) {
        type TargetStatus = "assisted" | "done" | "draft" | "failed" | "processing" | "queued" | "scheduled";
        
        const targets = input.targets.map(target => ({
          post_id: post.id,
          social_account_id: target.social_account_id,
          caption_override: target.caption_override || null,
          scheduled_at: target.scheduled_at || null,
          status: (target.scheduled_at ? 'scheduled' : 'draft') as TargetStatus,
        }));
        
        const { error: targetsError } = await supabase
          .from('social_post_targets')
          .insert(targets);
        
        if (targetsError) throw targetsError;
      }
      
      return post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-posts'] });
      queryClient.invalidateQueries({ queryKey: ['postsocial-targets'] });
      toast.success('Post criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar post: ' + error.message);
    },
  });
}

export function useDeleteSocialPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-posts'] });
      toast.success('Post removido');
    },
    onError: (error) => {
      toast.error('Erro ao remover post: ' + error.message);
    },
  });
}

// ============================================
// Social Post Targets Hooks
// ============================================

export function useSocialPostTargets(filters?: PostSocialFilters) {
  return useQuery({
    queryKey: ['postsocial-targets', filters],
    queryFn: async () => {
      let query = supabase
        .from('social_post_targets')
        .select(`
          *,
          social_account:social_accounts(*),
          post:social_posts(*)
        `)
        .order('scheduled_at', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });
      
      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      const { data, error } = await query.limit(200);
      
      if (error) throw error;
      return data as unknown as SocialPostTarget[];
    },
  });
}

export function useScheduledTargets() {
  return useQuery({
    queryKey: ['postsocial-targets', 'scheduled'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('social_post_targets')
        .select(`
          *,
          social_account:social_accounts(*),
          post:social_posts(*)
        `)
        .in('status', ['scheduled', 'queued'])
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data as unknown as SocialPostTarget[];
    },
  });
}

export function useUpdateSocialTarget() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: SocialTargetStatus; scheduled_at?: string; caption_override?: string }) => {
      type DbStatus = "assisted" | "done" | "draft" | "failed" | "processing" | "queued" | "scheduled";
      const dbUpdates: { status?: DbStatus; scheduled_at?: string; caption_override?: string } = {};
      
      if (updates.status) dbUpdates.status = updates.status as DbStatus;
      if (updates.scheduled_at !== undefined) dbUpdates.scheduled_at = updates.scheduled_at;
      if (updates.caption_override !== undefined) dbUpdates.caption_override = updates.caption_override;
      
      const { data, error } = await supabase
        .from('social_post_targets')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-targets'] });
      queryClient.invalidateQueries({ queryKey: ['postsocial-posts'] });
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });
}

export function useMarkAsAssisted() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (targetId: string) => {
      const { error } = await supabase
        .from('social_post_targets')
        .update({
          status: 'assisted',
          assisted_at: new Date().toISOString(),
        })
        .eq('id', targetId);
      
      if (error) throw error;
      
      // Log the event
      await supabase.from('social_post_logs').insert({
        target_id: targetId,
        event: 'assisted',
        level: 'info',
        message: 'Marcado como assistido pelo usuário',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-targets'] });
      queryClient.invalidateQueries({ queryKey: ['postsocial-posts'] });
      toast.success('Marcado como assistido');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });
}

export function useMarkAsPosted() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ targetId, postUrl }: { targetId: string; postUrl?: string }) => {
      const { error } = await supabase
        .from('social_post_targets')
        .update({
          status: 'done',
          posted_at: new Date().toISOString(),
          provider_post_url: postUrl || null,
        })
        .eq('id', targetId);
      
      if (error) throw error;
      
      // Log the event
      await supabase.from('social_post_logs').insert({
        target_id: targetId,
        event: 'manual_complete',
        level: 'info',
        message: 'Marcado como publicado manualmente',
        payload_json: postUrl ? { url: postUrl } : {},
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-targets'] });
      queryClient.invalidateQueries({ queryKey: ['postsocial-posts'] });
      toast.success('Marcado como publicado');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });
}

// ============================================
// Social Post Logs Hooks
// ============================================

export function useSocialPostLogs(targetId?: string) {
  return useQuery({
    queryKey: ['postsocial-logs', targetId],
    queryFn: async () => {
      let query = supabase
        .from('social_post_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (targetId) {
        query = query.eq('target_id', targetId);
      }
      
      const { data, error } = await query.limit(200);
      
      if (error) throw error;
      return data as unknown as SocialPostLog[];
    },
  });
}

// ============================================
// Social Templates Hooks
// ============================================

export function useSocialTemplates(originType?: SocialOriginType) {
  return useQuery({
    queryKey: ['postsocial-templates', originType],
    queryFn: async () => {
      let query = supabase
        .from('social_templates')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name');
      
      if (originType) {
        query = query.eq('origin_type', originType);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as unknown as SocialTemplate[];
    },
  });
}

export function useCreateSocialTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: Omit<SocialTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('social_templates')
        .insert({
          user_id: userData.user.id,
          name: input.name,
          origin_type: input.origin_type,
          caption_template: input.caption_template,
          hashtags: input.hashtags || null,
          platforms: input.platforms || null,
          is_default: input.is_default ?? false,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postsocial-templates'] });
      toast.success('Template criado');
    },
    onError: (error) => {
      toast.error('Erro ao criar template: ' + error.message);
    },
  });
}

// ============================================
// Stats Hooks
// ============================================

export function usePostSocialStats() {
  return useQuery({
    queryKey: ['postsocial-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all targets
      const { data: targets, error } = await supabase
        .from('social_post_targets')
        .select('status, created_at, social_account:social_accounts(platform)');
      
      if (error) throw error;
      
      const stats: PostSocialStats = {
        total_posts: targets?.length || 0,
        posts_today: targets?.filter(t => new Date(t.created_at) >= today).length || 0,
        scheduled: targets?.filter(t => t.status === 'scheduled').length || 0,
        in_queue: targets?.filter(t => t.status === 'queued').length || 0,
        posted: targets?.filter(t => t.status === 'done').length || 0,
        failed: targets?.filter(t => t.status === 'failed').length || 0,
        assisted: targets?.filter(t => t.status === 'assisted').length || 0,
        by_platform: {} as Record<SocialPlatform, number>,
      };
      
      // Count by platform
      targets?.forEach(t => {
        const platform = (t.social_account as unknown as SocialAccount)?.platform;
        if (platform) {
          stats.by_platform[platform] = (stats.by_platform[platform] || 0) + 1;
        }
      });
      
      return stats;
    },
  });
}
