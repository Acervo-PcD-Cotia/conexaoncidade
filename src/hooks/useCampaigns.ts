import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Campaign {
  id: string;
  site_id: string | null;
  name: string;
  objective: string | null;
  start_date: string | null;
  end_date: string | null;
  category_id: string | null;
  tags: string[];
  status: 'active' | 'paused' | 'completed';
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignInput {
  name: string;
  site_id?: string;
  objective?: string;
  start_date?: string;
  end_date?: string;
  category_id?: string;
  tags?: string[];
  status?: 'active' | 'paused' | 'completed';
}

export function useCampaigns(filters?: { status?: string; site_id?: string }) {
  return useQuery({
    queryKey: ['campaigns', filters],
    queryFn: async () => {
      let query = supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.site_id) {
        query = query.eq('site_id', filters.site_id);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Campaign[];
    },
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Campaign;
    },
    enabled: !!id,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...input,
          owner_id: user?.id,
          tags: input.tags || [],
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campanha criada com sucesso!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar campanha',
        description: error.message,
      });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campanha atualizada!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar campanha',
        description: error.message,
      });
    },
  });
}

export function useDeleteCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({ title: 'Campanha removida!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover campanha',
        description: error.message,
      });
    },
  });
}
