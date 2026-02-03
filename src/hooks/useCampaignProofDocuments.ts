import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CampaignProofDocument, CampaignProofDocType } from '@/types/campaign-proofs';

const QUERY_KEY = 'campaign-proofs';
const BUCKET_NAME = 'campaign-proofs';

// =====================================================
// CREATE DOCUMENT RECORD
// =====================================================

export function useCreateProofDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignProofId,
      docType,
      filePath,
      fileSize,
    }: {
      campaignProofId: string;
      docType: CampaignProofDocType;
      filePath: string;
      fileSize?: number;
    }) => {
      // Get next version number
      const { data: existingDocs } = await supabase
        .from('campaign_proof_documents')
        .select('version')
        .eq('campaign_proof_id', campaignProofId)
        .eq('doc_type', docType)
        .order('version', { ascending: false })
        .limit(1);

      const nextVersion = existingDocs && existingDocs.length > 0 
        ? existingDocs[0].version + 1 
        : 1;

      // Get signed URL
      const { data: urlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, 3600);

      // Insert document record
      const { data, error } = await supabase
        .from('campaign_proof_documents')
        .insert({
          campaign_proof_id: campaignProofId,
          doc_type: docType,
          version: nextVersion,
          file_path: filePath,
          file_url: urlData?.signedUrl || null,
          file_size: fileSize || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CampaignProofDocument;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, data.campaign_proof_id] });
    },
    onError: (error) => {
      console.error('Error creating document record:', error);
      toast.error('Erro ao registrar documento');
    },
  });
}

// =====================================================
// DELETE DOCUMENT
// =====================================================

export function useDeleteProofDocument() {
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
        .from('campaign_proof_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return campaignProofId;
    },
    onSuccess: (campaignProofId) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, campaignProofId] });
      toast.success('Documento removido');
    },
    onError: (error) => {
      console.error('Error deleting document:', error);
      toast.error('Erro ao remover documento');
    },
  });
}

// =====================================================
// DOWNLOAD DOCUMENT (get fresh signed URL)
// =====================================================

export async function getDocumentDownloadUrl(filePath: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, 3600);

  if (error) {
    console.error('Error getting download URL:', error);
    toast.error('Erro ao gerar link de download');
    return null;
  }

  return data?.signedUrl || null;
}

export function useDownloadProofDocument() {
  return useMutation({
    mutationFn: async (filePath: string) => {
      const url = await getDocumentDownloadUrl(filePath);
      if (!url) throw new Error('Failed to get download URL');
      
      // Open in new tab
      window.open(url, '_blank');
      return url;
    },
    onError: (error) => {
      console.error('Error downloading document:', error);
      toast.error('Erro ao baixar documento');
    },
  });
}
