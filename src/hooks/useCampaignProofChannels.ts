import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  CampaignProofChannel,
  CreateProofChannelInput,
  UpdateProofChannelInput,
} from '@/types/campaign-proofs';
import { DEFAULT_PROOF_CHANNELS } from '@/types/campaign-proofs';

const QUERY_KEY = 'campaign-proofs';

// =====================================================
// MUTATION HOOKS
// =====================================================

export function useCreateProofChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateProofChannelInput) => {
      const { data, error } = await supabase
        .from('campaign_proof_channels')
        .insert(input)
        .select()
        .single();

      if (error) throw error;
      return data as CampaignProofChannel;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.campaign_proof_id] });
    },
    onError: (error) => {
      console.error('Error creating channel:', error);
      toast.error('Erro ao adicionar canal');
    },
  });
}

export function useUpdateProofChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateProofChannelInput) => {
      const { data, error } = await supabase
        .from('campaign_proof_channels')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CampaignProofChannel;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.campaign_proof_id] });
    },
    onError: (error) => {
      console.error('Error updating channel:', error);
      toast.error('Erro ao atualizar canal');
    },
  });
}

export function useDeleteProofChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, campaignProofId }: { id: string; campaignProofId: string }) => {
      const { error } = await supabase
        .from('campaign_proof_channels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
    },
    onError: (error) => {
      console.error('Error deleting channel:', error);
      toast.error('Erro ao remover canal');
    },
  });
}

export function useReorderProofChannels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignProofId,
      channelIds,
    }: {
      campaignProofId: string;
      channelIds: string[];
    }) => {
      // Update each channel's sort_order
      const updates = channelIds.map((id, index) =>
        supabase
          .from('campaign_proof_channels')
          .update({ sort_order: index })
          .eq('id', id)
      );

      await Promise.all(updates);
      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
    },
    onError: (error) => {
      console.error('Error reordering channels:', error);
      toast.error('Erro ao reordenar canais');
    },
  });
}

export function useApplyDefaultChannels() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignProofId: string) => {
      // Delete existing channels
      await supabase
        .from('campaign_proof_channels')
        .delete()
        .eq('campaign_proof_id', campaignProofId);

      // Insert default channels
      const channelsToInsert = DEFAULT_PROOF_CHANNELS.map((ch) => ({
        ...ch,
        campaign_proof_id: campaignProofId,
      }));

      const { error } = await supabase
        .from('campaign_proof_channels')
        .insert(channelsToInsert);

      if (error) throw error;
      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
      toast.success('Modelo padrão aplicado');
    },
    onError: (error) => {
      console.error('Error applying default channels:', error);
      toast.error('Erro ao aplicar modelo padrão');
    },
  });
}
