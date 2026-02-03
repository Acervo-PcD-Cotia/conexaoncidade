import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  CampaignProofAsset,
  CampaignProofAssetType,
  CreateProofAssetInput,
} from '@/types/campaign-proofs';

const QUERY_KEY = 'campaign-proofs';
const BUCKET_NAME = 'campaign-proofs';

// =====================================================
// UPLOAD HOOK
// =====================================================

export function useUploadProofAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignProofId,
      assetType,
      file,
      caption,
      sortOrder,
    }: {
      campaignProofId: string;
      assetType: CampaignProofAssetType;
      file: File;
      caption?: string;
      sortOrder?: number;
    }) => {
      // Determine subfolder based on asset type
      const subfolder = assetType === 'VEICULACAO_PRINT' ? 'veiculacao' : 'analytics';
      const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = `${campaignProofId}/${subfolder}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the URL (signed for private bucket)
      const { data: urlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600);

      // Create asset record
      const { data, error: insertError } = await supabase
        .from('campaign_proof_assets')
        .insert({
          campaign_proof_id: campaignProofId,
          asset_type: assetType,
          file_path: filePath,
          file_url: urlData?.signedUrl || null,
          caption,
          sort_order: sortOrder ?? 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return data as CampaignProofAsset;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.campaign_proof_id] });
      toast.success('Imagem enviada');
    },
    onError: (error) => {
      console.error('Error uploading asset:', error);
      toast.error('Erro ao enviar imagem');
    },
  });
}

// =====================================================
// DELETE HOOK
// =====================================================

export function useDeleteProofAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      campaignProofId,
      filePath,
    }: {
      id: string;
      campaignProofId: string;
      filePath: string;
    }) => {
      // Delete from storage
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('campaign_proof_assets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
      toast.success('Imagem removida');
    },
    onError: (error) => {
      console.error('Error deleting asset:', error);
      toast.error('Erro ao remover imagem');
    },
  });
}

// =====================================================
// REORDER HOOK
// =====================================================

export function useReorderProofAssets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignProofId,
      assetIds,
    }: {
      campaignProofId: string;
      assetIds: string[];
    }) => {
      const updates = assetIds.map((id, index) =>
        supabase
          .from('campaign_proof_assets')
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
      console.error('Error reordering assets:', error);
      toast.error('Erro ao reordenar imagens');
    },
  });
}

// =====================================================
// UPDATE CAPTION HOOK
// =====================================================

export function useUpdateAssetCaption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      campaignProofId,
      caption,
    }: {
      id: string;
      campaignProofId: string;
      caption: string;
    }) => {
      const { error } = await supabase
        .from('campaign_proof_assets')
        .update({ caption })
        .eq('id', id);

      if (error) throw error;
      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
    },
    onError: (error) => {
      console.error('Error updating caption:', error);
      toast.error('Erro ao atualizar legenda');
    },
  });
}

// =====================================================
// REFRESH SIGNED URLS
// =====================================================

export function useRefreshAssetUrls() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignProofId: string) => {
      // Fetch assets
      const { data: assets, error: fetchError } = await supabase
        .from('campaign_proof_assets')
        .select('id, file_path')
        .eq('campaign_proof_id', campaignProofId);

      if (fetchError) throw fetchError;
      if (!assets || assets.length === 0) return campaignProofId;

      // Generate new signed URLs
      const updates = await Promise.all(
        assets.map(async (asset) => {
          const { data: urlData } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(asset.file_path, 3600);

          return supabase
            .from('campaign_proof_assets')
            .update({ file_url: urlData?.signedUrl || null })
            .eq('id', asset.id);
        })
      );

      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
    },
  });
}
