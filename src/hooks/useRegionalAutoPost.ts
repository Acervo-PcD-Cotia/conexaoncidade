import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface RegionalSource {
  id: string;
  city: string;
  name: string;
  type: 'rss' | 'listing';
  source_url: string | null;
  rss_url: string | null;
  listing_url: string | null;
  selectors: Record<string, string> | null;
  is_active: boolean;
  mode: 'review' | 'auto_publish' | 'off';
  poll_interval_minutes: number;
  rate_limit_per_hour: number;
  last_fetched_at: string | null;
  last_success_at: string | null;
  error_count: number;
  last_error: string | null;
  tags_default: string[];
  created_at: string;
  updated_at: string;
}

export interface RegionalIngestItem {
  id: string;
  source_id: string;
  canonical_url: string;
  title: string | null;
  excerpt: string | null;
  content: string | null;
  image_url: string | null;
  published_at: string | null;
  raw_payload: Record<string, unknown>;
  status: 'new' | 'queued' | 'processing' | 'processed' | 'skipped' | 'failed' | 'published';
  draft_id: string | null;
  news_id: string | null;
  rewritten_title: string | null;
  rewritten_content: string | null;
  seo_meta_title: string | null;
  seo_meta_description: string | null;
  generated_image_url: string | null;
  processed_at: string | null;
  published_at_portal: string | null;
  error_message: string | null;
  retry_count: number | null;
  processing_started_at: string | null;
  created_at: string;
  regional_sources?: { city: string; name: string };
}

export interface RegionalIngestRun {
  id: string;
  source_id: string;
  started_at: string;
  finished_at: string | null;
  status: 'running' | 'ok' | 'warning' | 'error';
  items_found: number;
  items_new: number;
  items_duplicated: number;
  items_errored: number;
  result: Record<string, unknown>;
  log: string | null;
  created_at: string;
  regional_sources?: RegionalSource;
}

export interface RegionalStats {
  captured_today: number;
  published_today: number;
  in_queue: number;
  duplicates: number;
  sources_with_error: number;
}

// Hooks
export function useRegionalSources() {
  return useQuery({
    queryKey: ['regional-sources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_sources')
        .select('*')
        .order('city', { ascending: true });

      if (error) throw error;
      return data as RegionalSource[];
    },
  });
}

export function useRegionalSource(id: string) {
  return useQuery({
    queryKey: ['regional-source', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('regional_sources')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as RegionalSource;
    },
    enabled: !!id,
  });
}

export function useUpdateRegionalSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RegionalSource> & { id: string }) => {
      const { data, error } = await supabase
        .from('regional_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-sources'] });
      toast.success('Fonte atualizada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar fonte: ${error.message}`);
    },
  });
}

export function useRegionalQueue(status?: string) {
  return useQuery({
    queryKey: ['regional-queue', status],
    queryFn: async () => {
      let query = supabase
        .from('regional_ingest_items')
        .select('*, regional_sources(city, name)')
        .order('created_at', { ascending: false })
        .limit(200);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RegionalIngestItem[];
    },
  });
}

export function useRegionalRuns(sourceId?: string) {
  return useQuery({
    queryKey: ['regional-runs', sourceId],
    queryFn: async () => {
      let query = supabase
        .from('regional_ingest_runs')
        .select('*, regional_sources(city, name)')
        .order('started_at', { ascending: false })
        .limit(50);

      if (sourceId) {
        query = query.eq('source_id', sourceId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as RegionalIngestRun[];
    },
  });
}

export function useRegionalStats() {
  return useQuery({
    queryKey: ['regional-stats'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'get_stats' },
      });

      if (error) throw error;
      return data.stats as RegionalStats;
    },
    refetchInterval: 30000,
  });
}

export function useTestRegionalSource() {
  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'test_source', source_id: sourceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.results?.[0]?.items_found > 0) {
        toast.success(`Teste concluído: ${data.results[0].items_found} itens encontrados`);
      } else {
        toast.warning('Nenhum item encontrado no teste');
      }
    },
    onError: (error) => {
      toast.error(`Erro no teste: ${error.message}`);
    },
  });
}

export function useRunRegionalIngest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceId?: string) => {
      const action = sourceId ? 'run_now' : 'run_all';
      
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action, source_id: sourceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-runs'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      
      if (data.results && data.results.length > 0) {
        const totalNew = data.results.reduce((sum: number, r: any) => sum + (r.items_new || 0), 0);
        const totalDup = data.results.reduce((sum: number, r: any) => sum + (r.items_duplicated || 0), 0);
        toast.success(`Ingestão concluída: ${totalNew} novos, ${totalDup} duplicados`);
      } else {
        toast.success('Ingestão executada');
      }
    },
    onError: (error) => {
      toast.error(`Erro na ingestão: ${error.message}`);
    },
  });
}

export function usePauseRegionalSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'pause_source', source_id: sourceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-sources'] });
      toast.success('Fonte pausada');
    },
    onError: (error) => {
      toast.error(`Erro ao pausar: ${error.message}`);
    },
  });
}

export function useResumeRegionalSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'resume_source', source_id: sourceId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-sources'] });
      toast.success('Fonte ativada');
    },
    onError: (error) => {
      toast.error(`Erro ao ativar: ${error.message}`);
    },
  });
}

export function useReprocessRegionalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'reprocess_item', item_id: itemId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      toast.success('Item marcado para reprocessamento');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}

export function useSkipRegionalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'skip_item', item_id: itemId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      toast.success('Item ignorado');
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}

export function useProcessRegionalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'process_item', item_id: itemId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      toast.success(`Processado: ${data.title || 'Item processado com sucesso'}`);
    },
    onError: (error) => {
      toast.error(`Erro ao processar: ${error.message}`);
    },
  });
}

export function usePublishRegionalItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'publish_item', item_id: itemId },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      toast.success(`Publicado: ${data.slug || 'Notícia publicada com sucesso'}`);
    },
    onError: (error) => {
      toast.error(`Erro ao publicar: ${error.message}`);
    },
  });
}

export function useProcessAllNew() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'process_all_new' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      toast.success(`${data.processed} itens processados, ${data.failed || 0} erros`);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });
}

export function usePublishAllProcessed() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'publish_all_processed' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      toast.success(`${data.published} notícias publicadas, ${data.failed || 0} erros`);
    },
    onError: (error) => {
      toast.error(`Erro ao publicar em lote: ${error.message}`);
    },
  });
}

export function useFullPipeline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'full_pipeline' },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['regional-queue'] });
      queryClient.invalidateQueries({ queryKey: ['regional-runs'] });
      queryClient.invalidateQueries({ queryKey: ['regional-stats'] });
      const p = data.pipeline;
      toast.success(
        `Pipeline completo! Ingeridos: ${p.ingested}, Processados: ${p.processed}, Publicados: ${p.published}`
      );
    },
    onError: (error) => {
      toast.error(`Erro no pipeline: ${error.message}`);
    },
  });
}

export function useTestSelectors() {
  return useMutation({
    mutationFn: async ({ sourceId, selectors }: { sourceId: string; selectors: Record<string, string> }) => {
      const { data, error } = await supabase.functions.invoke('regional-admin-tools', {
        body: { action: 'test_selectors', source_id: sourceId, selectors },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Teste concluído: ${JSON.stringify(data.matches)}`);
      }
    },
    onError: (error) => {
      toast.error(`Erro no teste: ${error.message}`);
    },
  });
}

export function useCreateRegionalSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: Omit<RegionalSource, 'id' | 'created_at' | 'updated_at' | 'last_fetched_at' | 'last_success_at' | 'error_count' | 'last_error'>) => {
      const { data, error } = await supabase
        .from('regional_sources')
        .insert({
          city: source.city,
          name: source.name,
          type: source.type,
          source_url: source.source_url,
          rss_url: source.rss_url,
          listing_url: source.listing_url,
          selectors: source.selectors,
          is_active: source.is_active,
          mode: source.mode,
          poll_interval_minutes: source.poll_interval_minutes,
          rate_limit_per_hour: source.rate_limit_per_hour,
          tags_default: source.tags_default,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regional-sources'] });
      toast.success('Fonte criada com sucesso');
    },
    onError: (error) => {
      toast.error(`Erro ao criar fonte: ${error.message}`);
    },
  });
}
