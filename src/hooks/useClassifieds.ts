import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Classified {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  category: string;
  price: number | null;
  is_negotiable: boolean;
  contact_name: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_email: string | null;
  images: string[];
  location: string | null;
  neighborhood: string | null;
  status: string;
  rejection_reason: string | null;
  views_count: number;
  favorites_count: number;
  expires_at: string;
  approved_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export type ClassifiedCategory = 
  | 'veiculos' 
  | 'imoveis' 
  | 'eletronicos' 
  | 'moveis' 
  | 'servicos' 
  | 'animais' 
  | 'moda' 
  | 'outros';

export const CLASSIFIED_CATEGORIES: { value: ClassifiedCategory; label: string }[] = [
  { value: 'veiculos', label: 'Veículos' },
  { value: 'imoveis', label: 'Imóveis' },
  { value: 'eletronicos', label: 'Eletrônicos' },
  { value: 'moveis', label: 'Móveis' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'animais', label: 'Animais' },
  { value: 'moda', label: 'Moda' },
  { value: 'outros', label: 'Outros' },
];

interface ClassifiedFilters {
  category?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export function useClassifieds(filters?: ClassifiedFilters) {
  return useQuery({
    queryKey: ['classifieds', filters],
    queryFn: async () => {
      let query = supabase
        .from('classifieds')
        .select('*')
        .eq('status', 'approved')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.neighborhood) {
        query = query.eq('neighborhood', filters.neighborhood);
      }
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice);
      }
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Classified[];
    },
  });
}

export function useClassifiedById(id: string | undefined) {
  return useQuery({
    queryKey: ['classified', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('classifieds')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Increment view count
      await supabase.rpc('increment_classified_views', { p_id: id });
      
      return data as Classified;
    },
    enabled: !!id,
  });
}

export function useMyClassifieds() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-classifieds', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('classifieds')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Classified[];
    },
    enabled: !!user,
  });
}

export function useAdminClassifieds(statusFilter?: string) {
  return useQuery({
    queryKey: ['admin-classifieds', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('classifieds')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Classified[];
    },
  });
}

export function useCreateClassified() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<Classified>) => {
      if (!user) throw new Error('Você precisa estar logado');

      const { data: result, error } = await supabase
        .from('classifieds')
        .insert([{
          title: data.title!,
          description: data.description!,
          category: data.category!,
          price: data.price,
          is_negotiable: data.is_negotiable,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          contact_whatsapp: data.contact_whatsapp,
          contact_email: data.contact_email,
          images: data.images || [],
          location: data.location,
          neighborhood: data.neighborhood,
          user_id: user.id,
          status: 'pending',
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifieds'] });
      queryClient.invalidateQueries({ queryKey: ['my-classifieds'] });
      toast.success('Anúncio enviado para moderação!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateClassified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Classified> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('classifieds')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifieds'] });
      queryClient.invalidateQueries({ queryKey: ['my-classifieds'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classifieds'] });
      toast.success('Anúncio atualizado!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteClassified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classifieds')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classifieds'] });
      queryClient.invalidateQueries({ queryKey: ['my-classifieds'] });
      queryClient.invalidateQueries({ queryKey: ['admin-classifieds'] });
      toast.success('Anúncio removido!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useApproveClassified() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('classifieds')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classifieds'] });
      toast.success('Anúncio aprovado!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useRejectClassified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { error } = await supabase
        .from('classifieds')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-classifieds'] });
      toast.success('Anúncio rejeitado!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
