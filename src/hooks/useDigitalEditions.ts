import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DigitalEdition {
  id: string;
  tenant_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  published_at: string | null;
  is_public: boolean | null;
  view_count: number | null;
  status: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Campos de acesso gamificado
  acesso_livre_ate: string | null;
  pontuacao_minima: number | null;
  tipo_acesso: 'comunidade' | 'pontuacao' | null;
}

export interface DigitalEditionItem {
  id: string;
  edition_id: string;
  news_id: string | null;
  section: string | null;
  headline_override: string | null;
  summary_override: string | null;
  sort_order: number | null;
  created_at: string | null;
  news?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    featured_image_url: string | null;
    category_id: string | null;
  };
}

export function useDigitalEditions(status?: string) {
  return useQuery({
    queryKey: ['digital_editions', status],
    queryFn: async () => {
      let query = supabase
        .from('digital_editions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as DigitalEdition[];
    },
  });
}

export function useDigitalEdition(id: string | undefined) {
  return useQuery({
    queryKey: ['digital_editions', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('digital_editions')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as DigitalEdition;
    },
    enabled: !!id,
  });
}

export function useDigitalEditionBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['digital_editions', 'slug', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from('digital_editions')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return data as DigitalEdition;
    },
    enabled: !!slug,
  });
}

export function useDigitalEditionItems(editionId: string | undefined) {
  return useQuery({
    queryKey: ['digital_edition_items', editionId],
    queryFn: async () => {
      if (!editionId) return [];
      const { data, error } = await supabase
        .from('digital_edition_items')
        .select(`
          *,
          news:news_id (
            id,
            title,
            slug,
            excerpt,
            featured_image_url,
            category_id
          )
        `)
        .eq('edition_id', editionId)
        .order('sort_order');
      if (error) throw error;
      return data as DigitalEditionItem[];
    },
    enabled: !!editionId,
  });
}

export function useCreateDigitalEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (edition: Omit<DigitalEdition, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('digital_editions')
        .insert(edition as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital_editions'] });
    },
  });
}

export function useUpdateDigitalEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DigitalEdition> & { id: string }) => {
      const { data, error } = await supabase
        .from('digital_editions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['digital_editions'] });
      queryClient.invalidateQueries({ queryKey: ['digital_editions', variables.id] });
    },
  });
}

export function useDeleteDigitalEdition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('digital_editions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['digital_editions'] });
    },
  });
}

export function useAddEditionItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (item: Omit<DigitalEditionItem, 'id' | 'created_at' | 'news'>) => {
      const { data, error } = await supabase
        .from('digital_edition_items')
        .insert(item as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['digital_edition_items', variables.edition_id] });
    },
  });
}

export function useUpdateEditionItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DigitalEditionItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('digital_edition_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['digital_edition_items', data.edition_id] });
    },
  });
}

export function useRemoveEditionItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, editionId }: { id: string; editionId: string }) => {
      const { error } = await supabase.from('digital_edition_items').delete().eq('id', id);
      if (error) throw error;
      return editionId;
    },
    onSuccess: (editionId) => {
      queryClient.invalidateQueries({ queryKey: ['digital_edition_items', editionId] });
    },
  });
}

export function useReorderEditionItems() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ items, editionId }: { items: { id: string; sort_order: number }[]; editionId: string }) => {
      const updates = items.map(item => 
        supabase
          .from('digital_edition_items')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)
      );
      await Promise.all(updates);
      return editionId;
    },
    onSuccess: (editionId) => {
      queryClient.invalidateQueries({ queryKey: ['digital_edition_items', editionId] });
    },
  });
}

export function useRecordEditionView() {
  return useMutation({
    mutationFn: async ({ editionId, sessionId }: { editionId: string; sessionId: string }) => {
      const { error } = await supabase
        .from('digital_edition_views')
        .insert({
          edition_id: editionId,
          session_id: sessionId,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });
      if (error) throw error;
    },
  });
}
