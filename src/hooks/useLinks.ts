import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Link {
  id: string;
  site_id: string | null;
  campaign_id: string | null;
  destination_url: string;
  canonical_url: string | null;
  slug: string | null;
  short_url: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  final_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  channel: string | null;
  unique_key: string | null;
  status: string;
  expires_at: string | null;
  click_count: number;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateLinkInput {
  destination_url: string;
  site_id?: string;
  campaign_id?: string;
  slug?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  entity_type?: string;
  entity_id?: string;
  channel?: string;
  expires_at?: string;
}

export function useLinks(filters?: { status?: string; campaign_id?: string; site_id?: string }) {
  return useQuery({
    queryKey: ['links', filters],
    queryFn: async () => {
      let query = supabase
        .from('links')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.campaign_id) {
        query = query.eq('campaign_id', filters.campaign_id);
      }
      if (filters?.site_id) {
        query = query.eq('site_id', filters.site_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Link[];
    },
  });
}

export function useLink(id: string) {
  return useQuery({
    queryKey: ['link', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Link;
    },
    enabled: !!id,
  });
}

export function useCreateLink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: CreateLinkInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Build final URL with UTMs
      let finalUrl = input.destination_url;
      const utmParams = new URLSearchParams();
      if (input.utm_source) utmParams.set('utm_source', input.utm_source);
      if (input.utm_medium) utmParams.set('utm_medium', input.utm_medium);
      if (input.utm_campaign) utmParams.set('utm_campaign', input.utm_campaign);
      if (input.utm_content) utmParams.set('utm_content', input.utm_content);
      if (input.utm_term) utmParams.set('utm_term', input.utm_term);
      
      if (utmParams.toString()) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + utmParams.toString();
      }
      
      // Generate short URL
      const shortUrl = input.slug 
        ? `${window.location.origin}/r/${input.slug}`
        : undefined;
      
      const { data, error } = await supabase
        .from('links')
        .insert({
          ...input,
          final_url: finalUrl,
          short_url: shortUrl,
          owner_id: user?.id,
          canonical_url: input.destination_url,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({ title: 'Link criado com sucesso!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar link',
        description: error.message,
      });
    },
  });
}

export function useUpdateLink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Link> & { id: string }) => {
      const { data, error } = await supabase
        .from('links')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Link;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({ title: 'Link atualizado!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar link',
        description: error.message,
      });
    },
  });
}

export function useDeleteLink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] });
      toast({ title: 'Link removido!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover link',
        description: error.message,
      });
    },
  });
}

export function useLinkStats() {
  return useQuery({
    queryKey: ['link-stats'],
    queryFn: async () => {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Get total links
      const { count: totalLinks } = await supabase
        .from('links')
        .select('*', { count: 'exact', head: true });
      
      // Get total clicks
      const { data: linksData } = await supabase
        .from('links')
        .select('click_count');
      
      const totalClicks = linksData?.reduce((sum, l) => sum + (l.click_count || 0), 0) || 0;
      
      // Get clicks by period
      const { count: clicks24h } = await supabase
        .from('click_events')
        .select('*', { count: 'exact', head: true })
        .gte('clicked_at', oneDayAgo.toISOString());
      
      const { count: clicks7d } = await supabase
        .from('click_events')
        .select('*', { count: 'exact', head: true })
        .gte('clicked_at', sevenDaysAgo.toISOString());
      
      const { count: clicks30d } = await supabase
        .from('click_events')
        .select('*', { count: 'exact', head: true })
        .gte('clicked_at', thirtyDaysAgo.toISOString());
      
      return {
        totalLinks: totalLinks || 0,
        totalClicks,
        clicks24h: clicks24h || 0,
        clicks7d: clicks7d || 0,
        clicks30d: clicks30d || 0,
      };
    },
  });
}
