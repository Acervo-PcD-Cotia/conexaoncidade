import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Site {
  id: string;
  name: string;
  primary_domain: string;
  base_url: string;
  news_path_prefix: string | null;
  default_utm_source: string | null;
  default_utm_medium_map: Record<string, string> | null;
  short_domain: string | null;
  share_enabled: boolean | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSiteInput {
  name: string;
  primary_domain: string;
  base_url: string;
  news_path_prefix?: string;
  default_utm_source?: string;
  default_utm_medium_map?: Record<string, string>;
  short_domain?: string;
}

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Site[];
    },
  });
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ['site', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Site;
    },
    enabled: !!id,
  });
}

export function useSiteByDomain(domain: string) {
  return useQuery({
    queryKey: ['site-by-domain', domain],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .eq('primary_domain', domain)
        .single();
      
      // If not found, return null (will use default)
      if (error?.code === 'PGRST116') return null;
      if (error) throw error;
      return data as Site;
    },
    enabled: !!domain,
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: CreateSiteInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('sites')
        .insert({
          ...input,
          owner_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Site;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast({ title: 'Site criado com sucesso!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar site',
        description: error.message,
      });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Site> & { id: string }) => {
      const { data, error } = await supabase
        .from('sites')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Site;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast({ title: 'Site atualizado!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar site',
        description: error.message,
      });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sites')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      toast({ title: 'Site removido!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover site',
        description: error.message,
      });
    },
  });
}

export function useCurrentSite() {
  const domain = typeof window !== 'undefined' ? window.location.host : '';
  return useSiteByDomain(domain);
}
