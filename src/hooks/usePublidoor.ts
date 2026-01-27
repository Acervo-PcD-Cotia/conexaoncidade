import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import type {
  PublidoorItem,
  PublidoorItemFormData,
  PublidoorItemStatus,
  PublidoorCampaign,
  PublidoorCampaignFormData,
  PublidoorCampaignStatus,
  PublidoorAdvertiser,
  PublidoorAdvertiserFormData,
  PublidoorTemplate,
  PublidoorLocation,
  PublidoorLocationAssignment,
  PublidoorSchedule,
  PublidoorMetric,
  PublidoorApproval,
  PublidoorApprovalAction,
  PublidoorSetting,
  PublidoorDashboardStats,
  PublidoorColorPalette,
} from '@/types/publidoor';
import { toast } from 'sonner';

// =============================================
// PUBLIDOOR ITEMS
// =============================================

export function usePublidoorItems(status?: PublidoorItemStatus) {
  return useQuery({
    queryKey: ['publidoor-items', status],
    queryFn: async () => {
      let query = supabase
        .from('publidoor_items')
        .select(`
          *,
          advertiser:publidoor_advertisers(*),
          campaign:publidoor_campaigns(*),
          template:publidoor_templates(*)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((item) => ({
        ...item,
        template: item.template ? {
          ...item.template,
          color_palette: (item.template.color_palette || { primary: '#000', secondary: '#fff', accent: '#3b82f6' }) as unknown as PublidoorColorPalette,
        } : null,
      })) as PublidoorItem[];
    },
  });
}

export function usePublidoorItem(id: string | undefined) {
  return useQuery({
    queryKey: ['publidoor-item', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('publidoor_items')
        .select(`
          *,
          advertiser:publidoor_advertisers(*),
          campaign:publidoor_campaigns(*),
          template:publidoor_templates(*)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        ...data,
        template: data.template ? {
          ...data.template,
          color_palette: (data.template.color_palette || { primary: '#000', secondary: '#fff', accent: '#3b82f6' }) as unknown as PublidoorColorPalette,
        } : null,
      } as PublidoorItem;
    },
    enabled: !!id,
  });
}

export function useCreatePublidoorItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PublidoorItemFormData) => {
      const { data: result, error } = await supabase
        .from('publidoor_items')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-items'] });
      toast.success('Publidoor criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar Publidoor: ' + error.message);
    },
  });
}

export function useUpdatePublidoorItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: PublidoorItemFormData & { id: string }) => {
      const { data: result, error } = await supabase
        .from('publidoor_items')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-items'] });
      queryClient.invalidateQueries({ queryKey: ['publidoor-item', variables.id] });
      toast.success('Publidoor atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar Publidoor: ' + error.message);
    },
  });
}

export function useUpdatePublidoorStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PublidoorItemStatus }) => {
      const { data: result, error } = await supabase
        .from('publidoor_items')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-items'] });
      queryClient.invalidateQueries({ queryKey: ['publidoor-item', variables.id] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });
}

export function useDeletePublidoorItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('publidoor_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-items'] });
      toast.success('Publidoor excluído!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });
}

// =============================================
// CAMPAIGNS
// =============================================

export function usePublidoorCampaigns(status?: PublidoorCampaignStatus) {
  return useQuery({
    queryKey: ['publidoor-campaigns', status],
    queryFn: async () => {
      let query = supabase
        .from('publidoor_campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PublidoorCampaign[];
    },
  });
}

export function usePublidoorCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['publidoor-campaign', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('publidoor_campaigns')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as PublidoorCampaign;
    },
    enabled: !!id,
  });
}

export function useCreatePublidoorCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PublidoorCampaignFormData) => {
      const { data: result, error } = await supabase
        .from('publidoor_campaigns')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-campaigns'] });
      toast.success('Campanha criada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar campanha: ' + error.message);
    },
  });
}

export function useUpdatePublidoorCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: PublidoorCampaignFormData & { id: string }) => {
      const { data: result, error } = await supabase
        .from('publidoor_campaigns')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['publidoor-campaign', variables.id] });
      toast.success('Campanha atualizada!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar campanha: ' + error.message);
    },
  });
}

export function useUpdatePublidoorCampaignStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PublidoorCampaignStatus }) => {
      const { data: result, error } = await supabase
        .from('publidoor_campaigns')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-campaigns'] });
      toast.success('Status da campanha atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });
}

export function useDeletePublidoorCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('publidoor_campaigns').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-campaigns'] });
      toast.success('Campanha excluída!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir campanha: ' + error.message);
    },
  });
}

// =============================================
// ADVERTISERS
// =============================================

export function usePublidoorAdvertisers(status?: 'active' | 'inactive') {
  return useQuery({
    queryKey: ['publidoor-advertisers', status],
    queryFn: async () => {
      let query = supabase
        .from('publidoor_advertisers')
        .select('*')
        .order('company_name', { ascending: true });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PublidoorAdvertiser[];
    },
  });
}

export function usePublidoorAdvertiser(id: string | undefined) {
  return useQuery({
    queryKey: ['publidoor-advertiser', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('publidoor_advertisers')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as PublidoorAdvertiser;
    },
    enabled: !!id,
  });
}

export function useCreatePublidoorAdvertiser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: PublidoorAdvertiserFormData) => {
      const { data: result, error } = await supabase
        .from('publidoor_advertisers')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-advertisers'] });
      toast.success('Anunciante cadastrado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao cadastrar anunciante: ' + error.message);
    },
  });
}

export function useUpdatePublidoorAdvertiser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: PublidoorAdvertiserFormData & { id: string }) => {
      const { data: result, error } = await supabase
        .from('publidoor_advertisers')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-advertisers'] });
      queryClient.invalidateQueries({ queryKey: ['publidoor-advertiser', variables.id] });
      toast.success('Anunciante atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar anunciante: ' + error.message);
    },
  });
}

export function useTogglePublidoorAdvertiserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'inactive' }) => {
      const { data: result, error } = await supabase
        .from('publidoor_advertisers')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-advertisers'] });
      toast.success('Status atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });
}

export function useDeletePublidoorAdvertiser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('publidoor_advertisers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-advertisers'] });
      toast.success('Anunciante excluído!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir anunciante: ' + error.message);
    },
  });
}

// =============================================
// TEMPLATES
// =============================================

export function usePublidoorTemplates(activeOnly = true) {
  return useQuery({
    queryKey: ['publidoor-templates', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('publidoor_templates')
        .select('*')
        .order('name', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []).map((t) => ({
        ...t,
        color_palette: (t.color_palette || { primary: '#000', secondary: '#fff', accent: '#3b82f6' }) as unknown as PublidoorColorPalette,
      })) as PublidoorTemplate[];
    },
  });
}

export function usePublidoorTemplate(id: string | undefined) {
  return useQuery({
    queryKey: ['publidoor-template', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('publidoor_templates')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return {
        ...data,
        color_palette: (data.color_palette || { primary: '#000', secondary: '#fff', accent: '#3b82f6' }) as unknown as PublidoorColorPalette,
      } as PublidoorTemplate;
    },
    enabled: !!id,
  });
}

// =============================================
// LOCATIONS
// =============================================

export function usePublidoorLocations(activeOnly = true) {
  return useQuery({
    queryKey: ['publidoor-locations', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('publidoor_locations')
        .select('*')
        .order('name', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PublidoorLocation[];
    },
  });
}

export function usePublidoorLocationAssignments(publidoorId: string | undefined) {
  return useQuery({
    queryKey: ['publidoor-location-assignments', publidoorId],
    queryFn: async () => {
      if (!publidoorId) return [];
      const { data, error } = await supabase
        .from('publidoor_location_assignments')
        .select(`
          *,
          location:publidoor_locations(*)
        `)
        .eq('publidoor_id', publidoorId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as PublidoorLocationAssignment[];
    },
    enabled: !!publidoorId,
  });
}

export function useAssignPublidoorLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      publidoor_id,
      location_id,
      is_exclusive = false,
      sort_order = 0,
    }: {
      publidoor_id: string;
      location_id: string;
      is_exclusive?: boolean;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('publidoor_location_assignments')
        .insert({ publidoor_id, location_id, is_exclusive, sort_order })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-location-assignments', variables.publidoor_id] });
      toast.success('Local atribuído!');
    },
    onError: (error) => {
      toast.error('Erro ao atribuir local: ' + error.message);
    },
  });
}

export function useRemovePublidoorLocationAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, publidoor_id }: { id: string; publidoor_id: string }) => {
      const { error } = await supabase.from('publidoor_location_assignments').delete().eq('id', id);
      if (error) throw error;
      return publidoor_id;
    },
    onSuccess: (publidoor_id) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-location-assignments', publidoor_id] });
      toast.success('Local removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover local: ' + error.message);
    },
  });
}

// =============================================
// SCHEDULES
// =============================================

export function usePublidoorSchedules(publidoorId: string | undefined) {
  return useQuery({
    queryKey: ['publidoor-schedules', publidoorId],
    queryFn: async () => {
      if (!publidoorId) return [];
      const { data, error } = await supabase
        .from('publidoor_schedules')
        .select('*')
        .eq('publidoor_id', publidoorId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as PublidoorSchedule[];
    },
    enabled: !!publidoorId,
  });
}

export function useCreatePublidoorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<PublidoorSchedule, 'id' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from('publidoor_schedules')
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-schedules', variables.publidoor_id] });
      toast.success('Programação criada!');
    },
    onError: (error) => {
      toast.error('Erro ao criar programação: ' + error.message);
    },
  });
}

export function useDeletePublidoorSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, publidoor_id }: { id: string; publidoor_id: string }) => {
      const { error } = await supabase.from('publidoor_schedules').delete().eq('id', id);
      if (error) throw error;
      return publidoor_id;
    },
    onSuccess: (publidoor_id) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-schedules', publidoor_id] });
      toast.success('Programação removida!');
    },
    onError: (error) => {
      toast.error('Erro ao remover programação: ' + error.message);
    },
  });
}

// =============================================
// METRICS
// =============================================

export function usePublidoorMetrics(publidoorId?: string, days = 30) {
  return useQuery({
    queryKey: ['publidoor-metrics', publidoorId, days],
    queryFn: async () => {
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - days);

      let query = supabase
        .from('publidoor_metrics')
        .select('*')
        .gte('date', fromDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (publidoorId) {
        query = query.eq('publidoor_id', publidoorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PublidoorMetric[];
    },
  });
}

export function useRecordPublidoorImpression() {
  return useMutation({
    mutationFn: async ({
      publidoor_id,
      device,
    }: {
      publidoor_id: string;
      device?: 'desktop' | 'mobile' | 'tablet';
    }) => {
      const today = new Date().toISOString().split('T')[0];

      // Try to update existing record
      const { data: existing } = await supabase
        .from('publidoor_metrics')
        .select('id, impressions')
        .eq('publidoor_id', publidoor_id)
        .eq('date', today)
        .eq('device', device || 'desktop')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('publidoor_metrics')
          .update({ impressions: existing.impressions + 1 })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('publidoor_metrics')
          .insert({ publidoor_id, date: today, device: device || 'desktop', impressions: 1 });
        if (error) throw error;
      }
    },
  });
}

export function useRecordPublidoorClick() {
  return useMutation({
    mutationFn: async ({
      publidoor_id,
      device,
    }: {
      publidoor_id: string;
      device?: 'desktop' | 'mobile' | 'tablet';
    }) => {
      const today = new Date().toISOString().split('T')[0];

      const { data: existing } = await supabase
        .from('publidoor_metrics')
        .select('id, clicks')
        .eq('publidoor_id', publidoor_id)
        .eq('date', today)
        .eq('device', device || 'desktop')
        .single();

      if (existing) {
        const { error } = await supabase
          .from('publidoor_metrics')
          .update({ clicks: existing.clicks + 1 })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('publidoor_metrics')
          .insert({ publidoor_id, date: today, device: device || 'desktop', clicks: 1 });
        if (error) throw error;
      }
    },
  });
}

// =============================================
// APPROVALS
// =============================================

export function usePublidoorApprovals(publidoorId?: string) {
  return useQuery({
    queryKey: ['publidoor-approvals', publidoorId],
    queryFn: async () => {
      let query = supabase
        .from('publidoor_approvals')
        .select('*')
        .order('created_at', { ascending: false });

      if (publidoorId) {
        query = query.eq('publidoor_id', publidoorId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PublidoorApproval[];
    },
  });
}

export function useCreatePublidoorApproval() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      publidoor_id,
      action,
      comment,
    }: {
      publidoor_id: string;
      action: PublidoorApprovalAction;
      comment?: string;
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('publidoor_approvals')
        .insert({
          publidoor_id,
          action,
          comment,
          reviewer_id: userData.user?.id,
        })
        .select()
        .single();
      if (error) throw error;

      // Update item status based on action
      let newStatus: PublidoorItemStatus = 'draft';
      if (action === 'submitted') newStatus = 'review';
      else if (action === 'approved') newStatus = 'approved';
      else if (action === 'rejected' || action === 'revision_requested') newStatus = 'draft';

      await supabase
        .from('publidoor_items')
        .update({ status: newStatus })
        .eq('id', publidoor_id);

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-approvals', variables.publidoor_id] });
      queryClient.invalidateQueries({ queryKey: ['publidoor-items'] });
      queryClient.invalidateQueries({ queryKey: ['publidoor-item', variables.publidoor_id] });
      toast.success('Ação registrada!');
    },
    onError: (error) => {
      toast.error('Erro ao registrar ação: ' + error.message);
    },
  });
}

// =============================================
// SETTINGS
// =============================================

export function usePublidoorSettings() {
  return useQuery({
    queryKey: ['publidoor-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publidoor_settings')
        .select('*')
        .order('key', { ascending: true });
      if (error) throw error;
      return data as PublidoorSetting[];
    },
  });
}

export function usePublidoorSetting(key: string) {
  return useQuery({
    queryKey: ['publidoor-setting', key],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('publidoor_settings')
        .select('*')
        .eq('key', key)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as PublidoorSetting | null;
    },
  });
}

export function useUpdatePublidoorSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string | number | boolean | object }) => {
      const { data: existing } = await supabase
        .from('publidoor_settings')
        .select('id')
        .eq('key', key)
        .single();

      if (existing) {
        const { data, error } = await supabase
          .from('publidoor_settings')
          .update({ value: value as Json })
          .eq('id', existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('publidoor_settings')
          .insert([{ key, value: value as Json }])
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['publidoor-settings'] });
      queryClient.invalidateQueries({ queryKey: ['publidoor-setting', variables.key] });
      toast.success('Configuração salva!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar configuração: ' + error.message);
    },
  });
}

// =============================================
// DASHBOARD STATS
// =============================================

export function usePublidoorDashboardStats() {
  return useQuery({
    queryKey: ['publidoor-dashboard-stats'],
    queryFn: async () => {
      // Get items by status
      const { data: items } = await supabase
        .from('publidoor_items')
        .select('id, status');

      const activeCount = items?.filter((i) => i.status === 'published').length || 0;
      const scheduledCount = items?.filter((i) => i.status === 'approved').length || 0;

      // Get active campaigns
      const { data: campaigns } = await supabase
        .from('publidoor_campaigns')
        .select('id')
        .eq('status', 'active');

      const activeCampaigns = campaigns?.length || 0;

      // Get locations
      const { data: locations } = await supabase
        .from('publidoor_locations')
        .select('id, max_items')
        .eq('is_active', true);

      const totalSpaces = locations?.reduce((sum, l) => sum + l.max_items, 0) || 0;
      const availableSpaces = Math.max(0, totalSpaces - activeCount);

      // Get metrics from last 30 days
      const fromDate = new Date();
      fromDate.setDate(fromDate.getDate() - 30);

      const { data: metrics } = await supabase
        .from('publidoor_metrics')
        .select('impressions, clicks')
        .gte('date', fromDate.toISOString().split('T')[0]);

      const totalImpressions = metrics?.reduce((sum, m) => sum + m.impressions, 0) || 0;
      const totalClicks = metrics?.reduce((sum, m) => sum + m.clicks, 0) || 0;
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

      // Estimated revenue (placeholder - could be based on CPM/CPC from campaigns)
      const estimatedRevenue = totalImpressions * 0.005 + totalClicks * 0.50;

      return {
        activeCount,
        scheduledCount,
        availableSpaces,
        activeCampaigns,
        totalImpressions,
        totalClicks,
        ctr: Math.round(ctr * 100) / 100,
        estimatedRevenue: Math.round(estimatedRevenue * 100) / 100,
      } as PublidoorDashboardStats;
    },
  });
}
