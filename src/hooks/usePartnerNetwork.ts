import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PartnerRelationship {
  id: string;
  source_site_id: string;
  target_site_id: string;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  allow_full_content: boolean;
  allow_rewrite: boolean;
  default_mode: 'teaser' | 'full' | 'rewrite';
  require_approval: boolean;
  rate_limit_day: number | null;
  created_at: string;
  updated_at: string;
  source_site?: { id: string; name: string };
  target_site?: { id: string; name: string };
}

export interface ImportSubscription {
  id: string;
  target_site_id: string;
  source_site_id: string;
  enabled: boolean;
  import_mode: 'manual' | 'auto' | 'auto_with_approval';
  delivery_mode: 'teaser' | 'full' | 'rewrite';
  category_map: Record<string, string>;
  include_keywords: string[];
  exclude_keywords: string[];
  include_categories: string[];
  exclude_categories: string[];
  max_per_day: number | null;
  allowed_hours: { start: number; end: number };
  created_at: string;
  updated_at: string;
  source_site?: { id: string; name: string };
}

export interface DistributionJob {
  id: string;
  article_id: string;
  source_site_id: string;
  target_site_id: string;
  requested_mode: 'teaser' | 'full' | 'rewrite';
  effective_mode: 'teaser' | 'full' | 'rewrite' | null;
  status: 'queued' | 'processing' | 'needs_approval' | 'published' | 'failed' | 'blocked';
  scheduled_for: string | null;
  error_message: string | null;
  attempts: number;
  created_at: string;
  processed_at: string | null;
  article?: { id: string; title: string };
  target_site?: { id: string; name: string };
}

export interface ImportedArticle {
  id: string;
  distribution_job_id: string | null;
  target_site_id: string;
  source_site_id: string;
  source_article_id: string;
  target_article_id: string | null;
  canonical_url: string | null;
  credited_text: string | null;
  status: 'inbox' | 'published' | 'rejected';
  created_at: string;
  published_at: string | null;
  source_article?: { 
    id: string; 
    title: string; 
    summary: string | null;
    content_html: string | null;
    hero_image_url: string | null;
    author_name: string | null;
  };
  source_site?: { id: string; name: string };
}

export interface PitchRequest {
  id: string;
  from_site_id: string;
  to_site_id: string;
  title: string;
  description: string | null;
  suggested_sources: unknown[];
  status: 'sent' | 'approved' | 'rejected' | 'needs_info';
  response_message: string | null;
  responded_by: string | null;
  created_at: string;
  responded_at: string | null;
  from_site?: { id: string; name: string };
  to_site?: { id: string; name: string };
}

// Partner Relationships
export function usePartnerRelationships(siteId: string | undefined) {
  return useQuery({
    queryKey: ['partner-relationships', siteId],
    queryFn: async () => {
      if (!siteId) return [];
      
      const { data, error } = await supabase
        .from('partner_relationships')
        .select(`
          *,
          source_site:sites!partner_relationships_source_site_id_fkey(id, name),
          target_site:sites!partner_relationships_target_site_id_fkey(id, name)
        `)
        .or(`source_site_id.eq.${siteId},target_site_id.eq.${siteId}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PartnerRelationship[];
    },
    enabled: !!siteId,
  });
}

export function useCreatePartnership() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (data: {
      source_site_id: string;
      target_site_id: string;
      allow_full_content?: boolean;
      allow_rewrite?: boolean;
      default_mode?: 'teaser' | 'full' | 'rewrite';
      require_approval?: boolean;
    }) => {
      const { data: result, error } = await supabase
        .from('partner_relationships')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-relationships'] });
      toast({ title: 'Convite de parceria enviado!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao criar parceria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdatePartnership() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...data 
    }: { 
      id: string;
      status?: 'pending' | 'active' | 'suspended' | 'rejected';
      allow_full_content?: boolean;
      allow_rewrite?: boolean;
      default_mode?: 'teaser' | 'full' | 'rewrite';
      require_approval?: boolean;
      rate_limit_day?: number;
    }) => {
      const { data: result, error } = await supabase
        .from('partner_relationships')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-relationships'] });
      toast({ title: 'Parceria atualizada!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar parceria',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Import Subscriptions
export function useImportSubscriptions(siteId: string | undefined) {
  return useQuery({
    queryKey: ['import-subscriptions', siteId],
    queryFn: async () => {
      if (!siteId) return [];
      
      const { data, error } = await supabase
        .from('import_subscriptions')
        .select(`
          *,
          source_site:sites!import_subscriptions_source_site_id_fkey(id, name)
        `)
        .eq('target_site_id', siteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ImportSubscription[];
    },
    enabled: !!siteId,
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...data 
    }: { 
      id: string;
      enabled?: boolean;
      import_mode?: 'manual' | 'auto' | 'auto_with_approval';
      delivery_mode?: 'teaser' | 'full' | 'rewrite';
      include_keywords?: string[];
      exclude_keywords?: string[];
      include_categories?: string[];
      exclude_categories?: string[];
      max_per_day?: number;
      allowed_hours?: { start: number; end: number };
    }) => {
      const { data: result, error } = await supabase
        .from('import_subscriptions')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['import-subscriptions'] });
      toast({ title: 'Configuração atualizada!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar configuração',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Distribution Jobs
export function useDistributionJobs(siteId: string | undefined) {
  return useQuery({
    queryKey: ['distribution-jobs', siteId],
    queryFn: async () => {
      if (!siteId) return [];
      
      const { data, error } = await supabase
        .from('distribution_jobs')
        .select(`
          *,
          article:articles!distribution_jobs_article_id_fkey(id, title),
          target_site:sites!distribution_jobs_target_site_id_fkey(id, name)
        `)
        .eq('source_site_id', siteId)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data as DistributionJob[];
    },
    enabled: !!siteId,
  });
}

// Imported Articles (Inbox)
export function useImportedArticles(siteId: string | undefined, status?: 'inbox' | 'published' | 'rejected') {
  return useQuery({
    queryKey: ['imported-articles', siteId, status],
    queryFn: async () => {
      if (!siteId) return [];
      
      let query = supabase
        .from('imported_articles')
        .select(`
          *,
          source_article:articles!imported_articles_source_article_id_fkey(id, title, summary, content_html, hero_image_url, author_name),
          source_site:sites!imported_articles_source_site_id_fkey(id, name)
        `)
        .eq('target_site_id', siteId)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query.limit(100);
      
      if (error) throw error;
      return data as ImportedArticle[];
    },
    enabled: !!siteId,
  });
}

export function useUpdateImportedArticle() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string;
      status: 'inbox' | 'published' | 'rejected';
    }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
      
      const { data: result, error } = await supabase
        .from('imported_articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['imported-articles'] });
      const statusLabels = {
        inbox: 'movido para inbox',
        published: 'publicado',
        rejected: 'rejeitado',
      };
      toast({ title: `Artigo ${statusLabels[data.status as keyof typeof statusLabels]}!` });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar artigo',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// Pitch Requests
export function usePitchRequests(siteId: string | undefined, direction: 'received' | 'sent' = 'received') {
  return useQuery({
    queryKey: ['pitch-requests', siteId, direction],
    queryFn: async () => {
      if (!siteId) return [];
      
      const column = direction === 'received' ? 'to_site_id' : 'from_site_id';
      
      const { data, error } = await supabase
        .from('pitch_requests')
        .select(`
          *,
          from_site:sites!pitch_requests_from_site_id_fkey(id, name),
          to_site:sites!pitch_requests_to_site_id_fkey(id, name)
        `)
        .eq(column, siteId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PitchRequest[];
    },
    enabled: !!siteId,
  });
}

export function useCreatePitchRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: {
      from_site_id: string;
      to_site_id: string;
      title: string;
      description?: string;
      suggested_sources?: unknown[];
    }) => {
      const { data: result, error } = await supabase
        .from('pitch_requests')
        .insert({
          from_site_id: input.from_site_id,
          to_site_id: input.to_site_id,
          title: input.title,
          description: input.description || null,
          suggested_sources: input.suggested_sources as import('@/integrations/supabase/types').Json || [],
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitch-requests'] });
      toast({ title: 'Sugestão de pauta enviada!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao enviar sugestão',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useRespondToPitch() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      response_message,
      responded_by,
    }: { 
      id: string;
      status: 'approved' | 'rejected' | 'needs_info';
      response_message?: string;
      responded_by: string;
    }) => {
      const { data: result, error } = await supabase
        .from('pitch_requests')
        .update({
          status,
          response_message,
          responded_by,
          responded_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitch-requests'] });
      toast({ title: 'Resposta enviada!' });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao responder',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
