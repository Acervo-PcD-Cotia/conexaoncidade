import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export type FactCheckVerdict = 
  | 'CONFIRMADO'
  | 'PROVAVELMENTE_VERDADEIRO'
  | 'ENGANOSO'
  | 'PROVAVELMENTE_FALSO'
  | 'FALSO'
  | 'NAO_VERIFICAVEL_AINDA';

export type FactCheckInputType = 'link' | 'text' | 'title' | 'image';

export type FactCheckStatus = 'NEW' | 'UNDER_REVIEW' | 'EDITORIAL_QUEUE' | 'REVIEWED' | 'PUBLISHED';

export interface FactCheckSource {
  id: string;
  name: string;
  domain: string;
  url: string;
  published_at: string | null;
  snippet: string | null;
  reliability_score: number | null;
  is_corroborating: boolean;
}

export interface FactCheckResult {
  id: string;
  created_at: string;
  verdict: FactCheckVerdict;
  score: number;
  summary: string;
  claims: string[];
  sources: FactCheckSource[];
  methodology: string;
  limitations: string;
  share_url: string;
}

export interface FactCheck {
  id: string;
  created_at: string;
  user_id: string | null;
  ref_slug: string | null;
  input_type: FactCheckInputType;
  input_content: string;
  image_url: string | null;
  verdict: FactCheckVerdict;
  score: number;
  summary: string | null;
  methodology: string | null;
  limitations: string | null;
  is_public: boolean;
  status: FactCheckStatus;
  editor_notes: string | null;
  opt_in_editorial: boolean;
  share_url: string | null;
}

export function useFactCheck() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isVerifying, setIsVerifying] = useState(false);

  // Submit a new verification
  const submitVerification = async (data: {
    input_type: FactCheckInputType;
    content: string;
    image_url?: string;
    ref_slug?: string;
    opt_in_editorial?: boolean;
  }): Promise<FactCheckResult> => {
    setIsVerifying(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('factcheck-verify', {
        body: {
          ...data,
          user_id: user?.id || null
        }
      });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['fact-check-history'] });
      return result;
    } finally {
      setIsVerifying(false);
    }
  };

  // Report an error on a fact check
  const reportError = useMutation({
    mutationFn: async ({ factCheckId, reason }: { factCheckId: string; reason: string }) => {
      const { error } = await supabase
        .from('fact_check_reports')
        .insert({
          fact_check_id: factCheckId,
          user_id: user?.id || null,
          reason
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Sua denúncia foi registrada com sucesso');
    },
    onError: () => {
      toast.error('Erro ao registrar denúncia');
    }
  });

  // Submit to editorial queue
  const submitToEditorial = useMutation({
    mutationFn: async (factCheckId: string) => {
      const { error } = await supabase
        .from('fact_checks')
        .update({ status: 'EDITORIAL_QUEUE' })
        .eq('id', factCheckId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Enviado para apuração da redação');
      queryClient.invalidateQueries({ queryKey: ['fact-check-history'] });
    },
    onError: () => {
      toast.error('Erro ao enviar para apuração');
    }
  });

  return {
    submitVerification,
    reportError,
    submitToEditorial,
    isVerifying
  };
}

// Hook for user's fact check history
export function useFactCheckHistory(limit = 10) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['fact-check-history', user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('fact_checks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as FactCheck[];
    },
    enabled: !!user?.id
  });
}

// Hook for fetching a single fact check by ID
export function useFactCheckById(id: string | null) {
  return useQuery({
    queryKey: ['fact-check', id],
    queryFn: async () => {
      if (!id) return null;

      const { data: factCheck, error: factCheckError } = await supabase
        .from('fact_checks')
        .select('*')
        .eq('id', id)
        .single();

      if (factCheckError) throw factCheckError;

      // Get claims
      const { data: claims } = await supabase
        .from('fact_check_claims')
        .select('claim_text')
        .eq('fact_check_id', id);

      // Get sources
      const { data: sources } = await supabase
        .from('fact_check_sources')
        .select('*')
        .eq('fact_check_id', id);

      return {
        ...factCheck,
        claims: claims?.map(c => c.claim_text) || [],
        sources: sources || []
      };
    },
    enabled: !!id
  });
}

// Admin hook for managing fact checks
export function useAdminFactChecks(filters?: {
  status?: FactCheckStatus;
  verdict?: FactCheckVerdict;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['admin-fact-checks', filters],
    queryFn: async () => {
      let query = supabase
        .from('fact_checks')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.verdict) {
        query = query.eq('verdict', filters.verdict as FactCheckVerdict);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as FactCheck[];
    }
  });
}

// Admin hook for updating fact check
export function useUpdateFactCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: { status?: string; editor_notes?: string } }) => {
      const { error } = await supabase
        .from('fact_checks')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-fact-checks'] });
      toast.success('Verificação atualizada');
    },
    onError: () => {
      toast.error('Erro ao atualizar verificação');
    }
  });
}
