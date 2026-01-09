import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type SourceGroup = Database['public']['Tables']['autopost_source_groups']['Row'];
type Source = Database['public']['Tables']['autopost_sources']['Row'];
type Rule = Database['public']['Tables']['autopost_rules']['Row'];
type IngestJob = Database['public']['Tables']['autopost_ingest_jobs']['Row'];
type IngestItem = Database['public']['Tables']['autopost_ingest_items']['Row'];
type RewrittenPost = Database['public']['Tables']['autopost_rewritten_posts']['Row'];
type Setting = Database['public']['Tables']['autopost_settings']['Row'];
type AuditLog = Database['public']['Tables']['autopost_audit_logs']['Row'];

// =====================================================
// SOURCE GROUPS
// =====================================================

export function useAutoPostGroups() {
  return useQuery({
    queryKey: ['autopost-groups'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autopost_source_groups')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as SourceGroup[];
    }
  });
}

export function useCreateAutoPostGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (group: Omit<SourceGroup, 'id' | 'created_at' | 'updated_at'> & { id?: string }) => {
      const { data, error } = await supabase
        .from('autopost_source_groups')
        .insert(group as Database['public']['Tables']['autopost_source_groups']['Insert'])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-groups'] });
      toast.success('Grupo criado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar grupo: ' + error.message);
    }
  });
}

export function useUpdateAutoPostGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SourceGroup> & { id: string }) => {
      const { data, error } = await supabase
        .from('autopost_source_groups')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-groups'] });
      toast.success('Grupo atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar grupo: ' + error.message);
    }
  });
}

export function useDeleteAutoPostGroup() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('autopost_source_groups')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-groups'] });
      toast.success('Grupo excluído');
    },
    onError: (error) => {
      toast.error('Erro ao excluir grupo: ' + error.message);
    }
  });
}

// =====================================================
// SOURCES
// =====================================================

export function useAutoPostSources(filters?: { status?: Database['public']['Enums']['autopost_source_status']; groupId?: string }) {
  return useQuery({
    queryKey: ['autopost-sources', filters],
    queryFn: async () => {
      let query = supabase
        .from('autopost_sources')
        .select(`
          *,
          group:autopost_source_groups(id, name),
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.groupId) {
        query = query.eq('group_id', filters.groupId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useAutoPostSource(id: string | undefined) {
  return useQuery({
    queryKey: ['autopost-source', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('autopost_sources')
        .select(`
          *,
          group:autopost_source_groups(id, name),
          category:categories(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useCreateAutoPostSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (source: Database['public']['Tables']['autopost_sources']['Insert']) => {
      const { data, error } = await supabase
        .from('autopost_sources')
        .insert(source)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-sources'] });
      toast.success('Fonte criada com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao criar fonte: ' + error.message);
    }
  });
}

export function useUpdateAutoPostSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Source> & { id: string }) => {
      const { data, error } = await supabase
        .from('autopost_sources')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['autopost-sources'] });
      queryClient.invalidateQueries({ queryKey: ['autopost-source', variables.id] });
      toast.success('Fonte atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar fonte: ' + error.message);
    }
  });
}

export function useDeleteAutoPostSource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('autopost_sources')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-sources'] });
      toast.success('Fonte excluída');
    },
    onError: (error) => {
      toast.error('Erro ao excluir fonte: ' + error.message);
    }
  });
}

// =====================================================
// RULES
// =====================================================

export function useAutoPostRules() {
  return useQuery({
    queryKey: ['autopost-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autopost_rules')
        .select('*')
        .order('priority');
      
      if (error) throw error;
      return data as Rule[];
    }
  });
}

export function useCreateAutoPostRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rule: Database['public']['Tables']['autopost_rules']['Insert']) => {
      const { data, error } = await supabase
        .from('autopost_rules')
        .insert(rule)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-rules'] });
      toast.success('Regra criada');
    },
    onError: (error) => {
      toast.error('Erro ao criar regra: ' + error.message);
    }
  });
}

export function useUpdateAutoPostRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Rule> & { id: string }) => {
      const { data, error } = await supabase
        .from('autopost_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-rules'] });
      toast.success('Regra atualizada');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar regra: ' + error.message);
    }
  });
}

export function useDeleteAutoPostRule() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('autopost_rules')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-rules'] });
      toast.success('Regra excluída');
    },
    onError: (error) => {
      toast.error('Erro ao excluir regra: ' + error.message);
    }
  });
}

// =====================================================
// INGEST JOBS
// =====================================================

export function useAutoPostJobs(sourceId?: string) {
  return useQuery({
    queryKey: ['autopost-jobs', sourceId],
    queryFn: async () => {
      let query = supabase
        .from('autopost_ingest_jobs')
        .select(`
          *,
          source:autopost_sources(id, name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (sourceId) {
        query = query.eq('source_id', sourceId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

// =====================================================
// INGEST ITEMS (Queue)
// =====================================================

export function useAutoPostQueue(status?: Database['public']['Enums']['autopost_item_status']) {
  return useQuery({
    queryKey: ['autopost-queue', status],
    queryFn: async () => {
      let query = supabase
        .from('autopost_ingest_items')
        .select(`
          *,
          source:autopost_sources(id, name, site_url),
          rewritten_post:autopost_rewritten_posts(*)
        `)
        .order('created_at', { ascending: false })
        .limit(200);
      
      if (status) {
        query = query.eq('status', status);
      } else {
        query = query.in('status', ['captured', 'processed', 'queued', 'approved', 'scheduled']);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useAutoPostItem(id: string | undefined) {
  return useQuery({
    queryKey: ['autopost-item', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('autopost_ingest_items')
        .select(`
          *,
          source:autopost_sources(*),
          rewritten_post:autopost_rewritten_posts(*)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });
}

export function useUpdateAutoPostItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<IngestItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('autopost_ingest_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['autopost-queue'] });
      queryClient.invalidateQueries({ queryKey: ['autopost-item', variables.id] });
      toast.success('Item atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar item: ' + error.message);
    }
  });
}

// =====================================================
// REWRITTEN POSTS
// =====================================================

export function useAutoPostPosts(status?: Database['public']['Enums']['autopost_publish_status']) {
  return useQuery({
    queryKey: ['autopost-posts', status],
    queryFn: async () => {
      let query = supabase
        .from('autopost_rewritten_posts')
        .select(`
          *,
          ingest_item:autopost_ingest_items(
            id, original_title, original_url,
            source:autopost_sources(id, name)
          ),
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('publish_status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });
}

export function useUpdateAutoPostPost() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<RewrittenPost> & { id: string }) => {
      const { data, error } = await supabase
        .from('autopost_rewritten_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-posts'] });
      queryClient.invalidateQueries({ queryKey: ['autopost-queue'] });
      toast.success('Post atualizado');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar post: ' + error.message);
    }
  });
}

// =====================================================
// SETTINGS
// =====================================================

export function useAutoPostSettings() {
  return useQuery({
    queryKey: ['autopost-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('autopost_settings')
        .select('*')
        .order('category');
      
      if (error) throw error;
      return data as Setting[];
    }
  });
}

export function useUpdateAutoPostSetting() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: unknown }) => {
      const { data, error } = await supabase
        .from('autopost_settings')
        .update({ value: value as Database['public']['Tables']['autopost_settings']['Row']['value'] })
        .eq('key', key)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['autopost-settings'] });
      toast.success('Configuração salva');
    },
    onError: (error) => {
      toast.error('Erro ao salvar configuração: ' + error.message);
    }
  });
}

// =====================================================
// AUDIT LOGS
// =====================================================

export function useAutoPostLogs(filters?: { entityType?: string; action?: string }) {
  return useQuery({
    queryKey: ['autopost-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('autopost_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      
      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLog[];
    }
  });
}

// =====================================================
// STATS
// =====================================================

export function useAutoPostStats() {
  return useQuery({
    queryKey: ['autopost-stats'],
    queryFn: async () => {
      // Get stats from multiple queries since we can't call RPC easily
      const today = new Date().toISOString().split('T')[0];
      
      const [capturedRes, publishedRes, queueRes, duplicatesRes, errorsRes] = await Promise.all([
        supabase
          .from('autopost_ingest_items')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from('autopost_rewritten_posts')
          .select('id', { count: 'exact', head: true })
          .gte('published_at', today),
        supabase
          .from('autopost_ingest_items')
          .select('id', { count: 'exact', head: true })
          .in('status', ['queued', 'processed', 'approved']),
        supabase
          .from('autopost_ingest_items')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'duplicate'),
        supabase
          .from('autopost_sources')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'error')
      ]);
      
      return {
        capturedToday: capturedRes.count || 0,
        publishedToday: publishedRes.count || 0,
        inQueue: queueRes.count || 0,
        duplicatesBlocked: duplicatesRes.count || 0,
        sourcesWithErrors: errorsRes.count || 0
      };
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}
