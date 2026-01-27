// Hooks para operações do Publidoor Partner
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PublidoorItem, PublidoorItemFormData, PublidoorSchedule, PublidoorMetric } from '@/types/publidoor';

// Buscar Publidoors do parceiro
export function usePartnerPublidoors(advertiserId: string | undefined) {
  return useQuery({
    queryKey: ['partner-publidoors', advertiserId],
    queryFn: async () => {
      if (!advertiserId) return [];
      
      const { data, error } = await supabase
        .from('publidoor_items')
        .select(`
          *,
          campaign:publidoor_campaigns(*),
          template:publidoor_templates(*)
        `)
        .eq('advertiser_id', advertiserId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as unknown as PublidoorItem[];
    },
    enabled: !!advertiserId,
  });
}

// Buscar Publidoor único do parceiro
export function usePartnerPublidoor(publidoorId: string | undefined) {
  return useQuery({
    queryKey: ['partner-publidoor', publidoorId],
    queryFn: async () => {
      if (!publidoorId) return null;
      
      const { data, error } = await supabase
        .from('publidoor_items')
        .select(`
          *,
          campaign:publidoor_campaigns(*),
          template:publidoor_templates(*)
        `)
        .eq('id', publidoorId)
        .single();
      
      if (error) throw error;
      return data as unknown as PublidoorItem;
    },
    enabled: !!publidoorId,
  });
}

// Buscar schedules do parceiro
export function usePartnerSchedules(publidoorId: string | undefined) {
  return useQuery({
    queryKey: ['partner-schedules', publidoorId],
    queryFn: async () => {
      if (!publidoorId) return [];
      
      const { data, error } = await supabase
        .from('publidoor_schedules')
        .select('*')
        .eq('publidoor_id', publidoorId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PublidoorSchedule[];
    },
    enabled: !!publidoorId,
  });
}

// Buscar métricas do parceiro
export function usePartnerMetrics(publidoorId: string | undefined, days: number = 7) {
  return useQuery({
    queryKey: ['partner-metrics', publidoorId, days],
    queryFn: async () => {
      if (!publidoorId) return [];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('publidoor_metrics')
        .select('*')
        .eq('publidoor_id', publidoorId)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) throw error;
      return data as PublidoorMetric[];
    },
    enabled: !!publidoorId,
  });
}

// Atualizar Publidoor (sempre vai para review)
export function usePartnerUpdatePublidoor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...formData }: { id: string } & Partial<PublidoorItemFormData>) => {
      const updateData = {
        ...formData,
        status: 'review' as const, // Sempre volta para análise
        updated_at: new Date().toISOString(),
      };
      
      const { data, error } = await supabase
        .from('publidoor_items')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-publidoors'] });
      queryClient.invalidateQueries({ queryKey: ['partner-publidoor'] });
      toast.success('Sua vitrine foi enviada para análise!');
    },
    onError: (error) => {
      console.error('Error updating publidoor:', error);
      toast.error('Erro ao atualizar vitrine');
    },
  });
}

// Criar novo Publidoor
export function usePartnerCreatePublidoor() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: PublidoorItemFormData & { advertiser_id: string }) => {
      const insertData = {
        ...formData,
        status: 'review' as const, // Sempre começa em análise
      };
      
      const { data, error } = await supabase
        .from('publidoor_items')
        .insert(insertData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-publidoors'] });
      toast.success('Sua vitrine foi criada e enviada para análise!');
    },
    onError: (error) => {
      console.error('Error creating publidoor:', error);
      toast.error('Erro ao criar vitrine');
    },
  });
}

// Métricas agregadas
export function usePartnerAggregatedMetrics(publidoorId: string | undefined, days: number = 7) {
  const { data: metrics = [], isLoading } = usePartnerMetrics(publidoorId, days);
  
  const aggregated = {
    totalImpressions: metrics.reduce((sum, m) => sum + (m.impressions || 0), 0),
    totalClicks: metrics.reduce((sum, m) => sum + (m.clicks || 0), 0),
    ctr: 0,
    avgTimeOnScreen: metrics.reduce((sum, m) => sum + (m.avg_time_on_screen || 0), 0) / (metrics.length || 1),
  };
  
  aggregated.ctr = aggregated.totalImpressions > 0 
    ? (aggregated.totalClicks / aggregated.totalImpressions) * 100 
    : 0;
  
  return { data: aggregated, isLoading, metrics };
}
