import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CampaignProofAnalytics, UpsertProofAnalyticsInput } from '@/types/campaign-proofs';

const QUERY_KEY = 'campaign-proofs';

// =====================================================
// UPSERT HOOK (Create or Update)
// =====================================================

export function useUpsertProofAnalytics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpsertProofAnalyticsInput) => {
      const { data, error } = await supabase
        .from('campaign_proof_analytics')
        .upsert(input, { onConflict: 'campaign_proof_id' })
        .select()
        .single();

      if (error) throw error;
      return data as CampaignProofAnalytics;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.campaign_proof_id] });
      toast.success('Métricas salvas');
    },
    onError: (error) => {
      console.error('Error saving analytics:', error);
      toast.error('Erro ao salvar métricas');
    },
  });
}

// =====================================================
// TOGGLE SHOW ON PDF
// =====================================================

export function useToggleAnalyticsOnPdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignProofId,
      showOnPdf,
    }: {
      campaignProofId: string;
      showOnPdf: boolean;
    }) => {
      const { error } = await supabase
        .from('campaign_proof_analytics')
        .update({ show_on_pdf: showOnPdf })
        .eq('campaign_proof_id', campaignProofId);

      if (error) throw error;
      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
    },
    onError: (error) => {
      console.error('Error toggling analytics display:', error);
      toast.error('Erro ao atualizar configuração');
    },
  });
}
