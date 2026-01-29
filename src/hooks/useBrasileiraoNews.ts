import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Types
export interface BrSource {
  key: string;
  name: string;
  url: string;
  kind: 'rss' | 'html';
  last_success_at: string | null;
  last_error: string | null;
  error_count: number;
  is_enabled: boolean;
  scrape_interval_minutes: number;
}

export interface BrNewsItem {
  id: string;
  source_key: string;
  title: string;
  url: string;
  excerpt: string | null;
  image_url: string | null;
  published_at: string | null;
  author: string | null;
  created_at: string;
}

export interface BrGeneratedNews {
  id: string;
  slug: string;
  title: string;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  related_match_id: string | null;
  related_round: number | null;
  news_type: 'round_recap' | 'standings_change' | 'where_to_watch' | 'preview' | 'highlight';
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrBroadcast {
  id: string;
  match_id: string;
  tv_open: string[];
  tv_closed: string[];
  streaming: string[];
  updated_from: 'ge' | 'cbf' | 'manual';
  created_at: string;
  updated_at: string;
}

export interface BrFetchLog {
  id: string;
  source_key: string;
  success: boolean;
  message: string | null;
  items_processed: number;
  duration_ms: number | null;
  fetched_at: string;
}

// Hook for fetching sources
export function useBrSources() {
  return useQuery({
    queryKey: ['br-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('br_sources')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as BrSource[];
    },
  });
}

// Hook for fetching RSS news items
export function useBrNewsItems(sourceKey?: string, limit = 20) {
  return useQuery({
    queryKey: ['br-news-items', sourceKey, limit],
    queryFn: async () => {
      let query = supabase
        .from('br_news_items')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);
      
      if (sourceKey) {
        query = query.eq('source_key', sourceKey);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BrNewsItem[];
    },
  });
}

// Hook for fetching generated news
export function useBrGeneratedNews(status?: string, limit = 20) {
  return useQuery({
    queryKey: ['br-generated-news', status, limit],
    queryFn: async () => {
      let query = supabase
        .from('br_generated_news')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BrGeneratedNews[];
    },
  });
}

// Hook for fetching a single generated news by slug
export function useBrGeneratedNewsBySlug(slug: string) {
  return useQuery({
    queryKey: ['br-generated-news', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('br_generated_news')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data as BrGeneratedNews;
    },
    enabled: !!slug,
  });
}

// Hook for fetching broadcasts with match info
export function useBrBroadcasts(matchIds?: string[]) {
  return useQuery({
    queryKey: ['br-broadcasts', matchIds],
    queryFn: async () => {
      let query = supabase
        .from('br_broadcasts')
        .select('*');
      
      if (matchIds && matchIds.length > 0) {
        query = query.in('match_id', matchIds);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BrBroadcast[];
    },
  });
}

// Hook for fetching broadcast by match ID
export function useBrBroadcastByMatch(matchId: string) {
  return useQuery({
    queryKey: ['br-broadcast', matchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('br_broadcasts')
        .select('*')
        .eq('match_id', matchId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as BrBroadcast | null;
    },
    enabled: !!matchId,
  });
}

// Hook for fetching fetch logs
export function useBrFetchLogs(sourceKey?: string, limit = 50) {
  return useQuery({
    queryKey: ['br-fetch-logs', sourceKey, limit],
    queryFn: async () => {
      let query = supabase
        .from('br_fetch_logs')
        .select('*')
        .order('fetched_at', { ascending: false })
        .limit(limit);
      
      if (sourceKey) {
        query = query.eq('source_key', sourceKey);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as BrFetchLog[];
    },
  });
}

// Mutation for syncing CBF data
export function useSyncCbf() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (action: 'standings' | 'matches' = 'standings') => {
      const { data, error } = await supabase.functions.invoke('br-sync-cbf', {
        body: { action },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['br-sources'] });
      queryClient.invalidateQueries({ queryKey: ['br-fetch-logs'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
    },
  });
}

// Mutation for syncing RSS news
export function useSyncRss() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (source?: string) => {
      const { data, error } = await supabase.functions.invoke('br-sync-news-rss', {
        body: { source },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['br-sources'] });
      queryClient.invalidateQueries({ queryKey: ['br-fetch-logs'] });
      queryClient.invalidateQueries({ queryKey: ['br-news-items'] });
    },
  });
}

// Mutation for syncing broadcasts
export function useSyncBroadcasts() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (matchId?: string) => {
      const { data, error } = await supabase.functions.invoke('br-sync-broadcasts', {
        body: { matchId },
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['br-broadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['br-fetch-logs'] });
    },
  });
}

// Mutation for generating AI news
export function useGenerateAiNews() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      newsType: 'round_recap' | 'standings_change' | 'where_to_watch' | 'preview';
      context: Record<string, any>;
      autoPublish?: boolean;
      relatedMatchId?: string;
      relatedRound?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke('br-generate-news-ai', {
        body: params,
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['br-generated-news'] });
      queryClient.invalidateQueries({ queryKey: ['br-fetch-logs'] });
    },
  });
}

// Mutation for updating generated news status
export function useUpdateGeneratedNewsStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'draft' | 'published' | 'archived' }) => {
      const updates: Partial<BrGeneratedNews> = { status };
      
      if (status === 'published') {
        updates.published_at = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('br_generated_news')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['br-generated-news'] });
    },
  });
}

// Mutation for updating broadcast info
export function useUpdateBroadcast() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: {
      matchId: string;
      tvOpen?: string[];
      tvClosed?: string[];
      streaming?: string[];
    }) => {
      const { matchId, ...updates } = params;
      
      const { data, error } = await supabase
        .from('br_broadcasts')
        .upsert({
          match_id: matchId,
          tv_open: updates.tvOpen || [],
          tv_closed: updates.tvClosed || [],
          streaming: updates.streaming || [],
          updated_from: 'manual',
        }, { onConflict: 'match_id' })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['br-broadcasts'] });
    },
  });
}

// Mutation for toggling source enabled status
export function useToggleSourceEnabled() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { data, error } = await supabase
        .from('br_sources')
        .update({ is_enabled: enabled })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['br-sources'] });
    },
  });
}
