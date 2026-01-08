import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface NewsAudioSettings {
  id: string;
  tenant_id: string | null;
  is_enabled: boolean;
  auto_generate_audio: boolean;
  auto_generate_summary: boolean;
  auto_distribute: boolean;
  default_voice_id: string;
  default_voice_gender: string;
  default_audio_type: string;
  max_audio_duration_seconds: number;
  monthly_audio_limit: number;
  monthly_distribution_limit: number;
  excluded_categories: string[] | null;
  excluded_authors: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface NewsAudioAnalytics {
  id: string;
  news_id: string | null;
  tenant_id: string | null;
  listened_at: string;
  duration_listened_seconds: number;
  completed: boolean;
  platform: string;
  user_fingerprint: string | null;
  referrer: string | null;
}

export interface PodcastFeed {
  id: string;
  tenant_id: string | null;
  feed_type: string;
  category_id: string | null;
  author_id: string | null;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  language: string;
  explicit: boolean;
  feed_url: string | null;
  spotify_url: string | null;
  apple_url: string | null;
  google_url: string | null;
  amazon_url: string | null;
  deezer_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Audio Settings Hooks
export function useNewsAudioSettings(tenantId?: string) {
  return useQuery({
    queryKey: ['news-audio-settings', tenantId],
    queryFn: async () => {
      let query = supabase.from('news_audio_settings').select('*');
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) throw error;
      return data as NewsAudioSettings | null;
    },
    enabled: true,
  });
}

export function useUpdateNewsAudioSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<NewsAudioSettings> & { tenant_id?: string }) => {
      const { tenant_id, ...updateData } = settings;
      
      // Check if settings exist
      const { data: existing } = await supabase
        .from('news_audio_settings')
        .select('id')
        .eq('tenant_id', tenant_id || '')
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('news_audio_settings')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('news_audio_settings')
          .insert({ ...updateData, tenant_id })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-audio-settings'] });
      toast.success('Configurações salvas com sucesso');
    },
    onError: (error) => {
      console.error('Error updating audio settings:', error);
      toast.error('Erro ao salvar configurações');
    },
  });
}

// Audio Generation Hooks
export function useGenerateNewsAudio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      newsId, 
      audioType = 'full', 
      voiceId = 'JBFqnCBsd6RMkjVDRZzb' 
    }: { 
      newsId: string; 
      audioType?: string; 
      voiceId?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('generate-news-audio', {
        body: { newsId, audioType, voiceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Áudio gerado com sucesso');
    },
    onError: (error) => {
      console.error('Error generating audio:', error);
      toast.error('Erro ao gerar áudio');
    },
  });
}

export function useGenerateNewsSummary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newsId: string) => {
      const { data, error } = await supabase.functions.invoke('generate-news-summary', {
        body: { newsId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      toast.success('Resumo gerado com sucesso');
    },
    onError: (error) => {
      console.error('Error generating summary:', error);
      toast.error('Erro ao gerar resumo');
    },
  });
}

// Analytics Hooks
export function useNewsAudioAnalytics(newsId?: string, tenantId?: string) {
  return useQuery({
    queryKey: ['news-audio-analytics', newsId, tenantId],
    queryFn: async () => {
      let query = supabase
        .from('news_audio_analytics')
        .select('*')
        .order('listened_at', { ascending: false });
      
      if (newsId) {
        query = query.eq('news_id', newsId);
      }
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query.limit(1000);
      
      if (error) throw error;
      return data as NewsAudioAnalytics[];
    },
  });
}

export function useAudioAnalyticsSummary(tenantId?: string, period: 'day' | 'week' | 'month' = 'month') {
  return useQuery({
    queryKey: ['audio-analytics-summary', tenantId, period],
    queryFn: async () => {
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      let query = supabase
        .from('news_audio_analytics')
        .select('*')
        .gte('listened_at', startDate.toISOString());
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;

      const analytics = data as NewsAudioAnalytics[];
      
      return {
        totalListens: analytics.length,
        totalDurationSeconds: analytics.reduce((sum, a) => sum + (a.duration_listened_seconds || 0), 0),
        completionRate: analytics.length > 0 
          ? (analytics.filter(a => a.completed).length / analytics.length) * 100 
          : 0,
        byPlatform: analytics.reduce((acc, a) => {
          acc[a.platform] = (acc[a.platform] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
  });
}

// Podcast Feeds Hooks
export function usePodcastFeeds(tenantId?: string) {
  return useQuery({
    queryKey: ['podcast-feeds', tenantId],
    queryFn: async () => {
      let query = supabase
        .from('podcast_feeds')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (tenantId) {
        query = query.eq('tenant_id', tenantId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as PodcastFeed[];
    },
  });
}

export function useCreatePodcastFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feed: Partial<PodcastFeed> & { title: string }) => {
      const { data, error } = await supabase
        .from('podcast_feeds')
        .insert(feed as any)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcast-feeds'] });
      toast.success('Feed criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating podcast feed:', error);
      toast.error('Erro ao criar feed');
    },
  });
}

export function useUpdatePodcastFeed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PodcastFeed> & { id: string }) => {
      const { data, error } = await supabase
        .from('podcast_feeds')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['podcast-feeds'] });
      toast.success('Feed atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Error updating podcast feed:', error);
      toast.error('Erro ao atualizar feed');
    },
  });
}

// Track audio listen
export function useTrackAudioListen() {
  return useMutation({
    mutationFn: async ({
      newsId,
      durationListenedSeconds,
      completed = false,
      platform = 'web',
    }: {
      newsId: string;
      durationListenedSeconds: number;
      completed?: boolean;
      platform?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('track-audio-analytics', {
        body: {
          newsId,
          durationListenedSeconds,
          completed,
          platform,
          referrer: typeof window !== 'undefined' ? document.referrer : '',
        },
      });

      if (error) throw error;
      return data;
    },
  });
}

// News with audio stats
export function useNewsWithAudioStats() {
  return useQuery({
    queryKey: ['news-with-audio-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select(`
          id,
          title,
          slug,
          audio_url,
          audio_status,
          audio_duration_seconds,
          audio_type,
          audio_generated_at,
          ai_summary_bullets,
          ai_summary_generated_at,
          show_audio_player,
          show_summary_button,
          distribute_audio,
          published_at,
          status
        `)
        .order('published_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data;
    },
  });
}
