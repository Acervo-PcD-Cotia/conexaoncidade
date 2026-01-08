import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BioPage {
  id: string;
  site_id: string | null;
  slug: string;
  title: string;
  description: string | null;
  logo_url: string | null;
  background_color: string | null;
  text_color: string | null;
  is_active: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface BioButton {
  id: string;
  bio_page_id: string;
  link_id: string | null;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  click_count: number;
  created_at: string;
}

export interface CreateBioPageInput {
  slug: string;
  title: string;
  site_id?: string;
  description?: string;
  logo_url?: string;
  background_color?: string;
  text_color?: string;
}

export interface CreateBioButtonInput {
  bio_page_id: string;
  label: string;
  url: string;
  link_id?: string;
  icon?: string;
  sort_order?: number;
}

export function useBioPages() {
  return useQuery({
    queryKey: ['bio-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bio_pages')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as BioPage[];
    },
  });
}

export function useBioPage(slug: string) {
  return useQuery({
    queryKey: ['bio-page', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bio_pages')
        .select('*')
        .eq('slug', slug)
        .single();
      if (error) throw error;
      return data as BioPage;
    },
    enabled: !!slug,
  });
}

export function useBioButtons(bioPageId: string) {
  return useQuery({
    queryKey: ['bio-buttons', bioPageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bio_buttons')
        .select('*')
        .eq('bio_page_id', bioPageId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as BioButton[];
    },
    enabled: !!bioPageId,
  });
}

export function useCreateBioPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: CreateBioPageInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('bio_pages')
        .insert({
          ...input,
          owner_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as BioPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bio-pages'] });
      toast({ title: 'Página Bio criada com sucesso!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar página',
        description: error.message,
      });
    },
  });
}

export function useUpdateBioPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BioPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('bio_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BioPage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bio-pages'] });
      toast({ title: 'Página atualizada!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao atualizar página',
        description: error.message,
      });
    },
  });
}

export function useCreateBioButton() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (input: CreateBioButtonInput) => {
      const { data, error } = await supabase
        .from('bio_buttons')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as BioButton;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bio-buttons', variables.bio_page_id] });
      toast({ title: 'Botão adicionado!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao adicionar botão',
        description: error.message,
      });
    },
  });
}

export function useUpdateBioButton() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, bio_page_id, ...updates }: Partial<BioButton> & { id: string; bio_page_id: string }) => {
      const { data, error } = await supabase
        .from('bio_buttons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as BioButton;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bio-buttons', variables.bio_page_id] });
    },
  });
}

export function useDeleteBioButton() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ id, bio_page_id }: { id: string; bio_page_id: string }) => {
      const { error } = await supabase
        .from('bio_buttons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return bio_page_id;
    },
    onSuccess: (bio_page_id) => {
      queryClient.invalidateQueries({ queryKey: ['bio-buttons', bio_page_id] });
      toast({ title: 'Botão removido!' });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Erro ao remover botão',
        description: error.message,
      });
    },
  });
}
