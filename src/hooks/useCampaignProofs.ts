import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  CampaignProof,
  CampaignProofFull,
  CampaignProofFilters,
  CreateCampaignProofInput,
  UpdateCampaignProofInput,
} from '@/types/campaign-proofs';

const QUERY_KEY = 'campaign-proofs';

// =====================================================
// FETCH HOOKS
// =====================================================

export function useCampaignProofs(filters?: CampaignProofFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('campaign_proofs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(
          `client_name.ilike.%${filters.search}%,campaign_name.ilike.%${filters.search}%,insertion_order.ilike.%${filters.search}%`
        );
      }

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }

      if (filters?.startDate) {
        query = query.gte('start_date', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('end_date', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as CampaignProof[];
    },
  });
}

export function useCampaignProof(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;

      // Fetch main record
      const { data: proof, error: proofError } = await supabase
        .from('campaign_proofs')
        .select('*')
        .eq('id', id)
        .single();

      if (proofError) throw proofError;

      // Fetch related data in parallel
      const [channelsRes, assetsRes, analyticsRes, documentsRes] = await Promise.all([
        supabase
          .from('campaign_proof_channels')
          .select('*')
          .eq('campaign_proof_id', id)
          .order('sort_order'),
        supabase
          .from('campaign_proof_assets')
          .select('*')
          .eq('campaign_proof_id', id)
          .order('sort_order'),
        supabase
          .from('campaign_proof_analytics')
          .select('*')
          .eq('campaign_proof_id', id)
          .maybeSingle(),
        supabase
          .from('campaign_proof_documents')
          .select('*')
          .eq('campaign_proof_id', id)
          .order('created_at', { ascending: false }),
      ]);

      if (channelsRes.error) throw channelsRes.error;
      if (assetsRes.error) throw assetsRes.error;
      if (analyticsRes.error) throw analyticsRes.error;
      if (documentsRes.error) throw documentsRes.error;

      return {
        ...proof,
        channels: channelsRes.data || [],
        assets: assetsRes.data || [],
        analytics: analyticsRes.data || null,
        documents: documentsRes.data || [],
      } as CampaignProofFull;
    },
    enabled: !!id,
  });
}

// =====================================================
// MUTATION HOOKS
// =====================================================

export function useCreateCampaignProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCampaignProofInput) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('campaign_proofs')
        .insert({
          ...input,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CampaignProof;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprovante criado com sucesso');
    },
    onError: (error) => {
      console.error('Error creating campaign proof:', error);
      toast.error('Erro ao criar comprovante');
    },
  });
}

export function useUpdateCampaignProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...input }: UpdateCampaignProofInput) => {
      const { data, error } = await supabase
        .from('campaign_proofs')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as CampaignProof;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.id] });
      toast.success('Comprovante atualizado');
    },
    onError: (error) => {
      console.error('Error updating campaign proof:', error);
      toast.error('Erro ao atualizar comprovante');
    },
  });
}

export function useDeleteCampaignProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaign_proofs')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprovante excluído');
    },
    onError: (error) => {
      console.error('Error deleting campaign proof:', error);
      toast.error('Erro ao excluir comprovante');
    },
  });
}

export function useDuplicateCampaignProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Fetch original
      const { data: original, error: fetchError } = await supabase
        .from('campaign_proofs')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const { data: { user } } = await supabase.auth.getUser();

      // Create copy
      const { data: newProof, error: insertError } = await supabase
        .from('campaign_proofs')
        .insert({
          client_name: original.client_name,
          campaign_name: `${original.campaign_name} (Cópia)`,
          insertion_order: `${original.insertion_order}-COPY`,
          internal_number: original.internal_number,
          internal_code: original.internal_code,
          site_name: original.site_name,
          site_domain: original.site_domain,
          start_date: original.start_date,
          end_date: original.end_date,
          status: 'draft',
          created_by: user?.id,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Copy channels
      const { data: channels } = await supabase
        .from('campaign_proof_channels')
        .select('*')
        .eq('campaign_proof_id', id);

      if (channels && channels.length > 0) {
        await supabase.from('campaign_proof_channels').insert(
          channels.map((ch) => ({
            campaign_proof_id: newProof.id,
            channel_name: ch.channel_name,
            channel_value: ch.channel_value,
            channel_metric: ch.channel_metric,
            sort_order: ch.sort_order,
          }))
        );
      }

      return newProof as CampaignProof;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Comprovante duplicado');
    },
    onError: (error) => {
      console.error('Error duplicating campaign proof:', error);
      toast.error('Erro ao duplicar comprovante');
    },
  });
}
