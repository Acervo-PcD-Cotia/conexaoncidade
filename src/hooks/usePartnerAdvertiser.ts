// Hook para operações do anunciante parceiro
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PublidoorAdvertiserFormData } from '@/types/publidoor';

// Atualizar dados do anunciante
export function useUpdatePartnerAdvertiser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...formData }: { id: string } & Partial<PublidoorAdvertiserFormData>) => {
      const updateData = {
        ...formData,
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('publidoor_advertisers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-advertiser'] });
      toast.success('Dados do negócio atualizados!');
    },
    onError: (error) => {
      console.error('Error updating advertiser:', error);
      toast.error('Erro ao atualizar dados do negócio');
    },
  });
}
