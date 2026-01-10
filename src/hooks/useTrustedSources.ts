import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type TrustedSourceType = 'PRIMARY' | 'JOURNALISM' | 'CHECKER' | 'OTHER';

export interface TrustedSource {
  id: string;
  domain: string;
  name: string;
  type: TrustedSourceType;
  is_allowed: boolean;
  weight: number;
  created_at: string;
  updated_at: string;
}

export function useTrustedSources() {
  return useQuery({
    queryKey: ['trusted-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trusted_sources')
        .select('*')
        .order('weight', { ascending: false });

      if (error) throw error;
      return data as TrustedSource[];
    }
  });
}

export function useCreateTrustedSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: Omit<TrustedSource, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('trusted_sources')
        .insert(source);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted-sources'] });
      toast.success('Fonte adicionada com sucesso');
    },
    onError: (error: Error) => {
      toast.error(`Erro ao adicionar fonte: ${error.message}`);
    }
  });
}

export function useUpdateTrustedSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<TrustedSource> }) => {
      const { error } = await supabase
        .from('trusted_sources')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted-sources'] });
      toast.success('Fonte atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar fonte');
    }
  });
}

export function useDeleteTrustedSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('trusted_sources')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trusted-sources'] });
      toast.success('Fonte removida');
    },
    onError: () => {
      toast.error('Erro ao remover fonte');
    }
  });
}
