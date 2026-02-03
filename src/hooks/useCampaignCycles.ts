import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { 
  CampaignCycle, 
  CycleFormData, 
  ChannelType,
  CHANNELS_REQUIRING_CONFIRMATION 
} from '@/types/campaigns-unified';
import { parseJsonArray } from '@/types/json';
import type { Json } from '@/integrations/supabase/types';

/**
 * Fetch all cycles for a campaign
 */
export function useCampaignCycles(campaignId: string | undefined) {
  return useQuery({
    queryKey: ['campaign-cycles', campaignId],
    queryFn: async (): Promise<CampaignCycle[]> => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from('campaign_cycles')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transformCycleFromDb);
    },
    enabled: !!campaignId,
    staleTime: 60000,
  });
}

/**
 * Get a single cycle by ID
 */
export function useCampaignCycle(cycleId: string | undefined) {
  return useQuery({
    queryKey: ['campaign-cycle', cycleId],
    queryFn: async (): Promise<CampaignCycle | null> => {
      if (!cycleId) return null;

      const { data, error } = await supabase
        .from('campaign_cycles')
        .select('*')
        .eq('id', cycleId)
        .single();

      if (error) throw error;

      return transformCycleFromDb(data);
    },
    enabled: !!cycleId,
  });
}

/**
 * Create a new cycle
 */
export function useCreateCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      data,
    }: {
      campaignId: string;
      data: CycleFormData;
    }): Promise<CampaignCycle> => {
      // Check if any channel requires confirmation
      const requiresConfirmation = data.active_channels.some(
        channel => ['push', 'newsletter'].includes(channel)
      );

      const { data: cycle, error } = await supabase
        .from('campaign_cycles')
        .insert([{
          campaign_id: campaignId,
          name: data.name,
          starts_at: data.starts_at || null,
          ends_at: data.ends_at || null,
          active_channels: data.active_channels,
          status: 'scheduled',
          requires_confirmation: requiresConfirmation,
        }])
        .select()
        .single();

      if (error) throw error;

      return transformCycleFromDb(cycle);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-cycles', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns-unified'] });
    },
  });
}

/**
 * Update a cycle
 */
export function useUpdateCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cycleId,
      data,
    }: {
      cycleId: string;
      data: Partial<CycleFormData>;
    }): Promise<CampaignCycle> => {
      const updateData: Record<string, unknown> = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.starts_at !== undefined) updateData.starts_at = data.starts_at;
      if (data.ends_at !== undefined) updateData.ends_at = data.ends_at;
      if (data.active_channels !== undefined) {
        updateData.active_channels = data.active_channels;
        updateData.requires_confirmation = data.active_channels.some(
          channel => ['push', 'newsletter'].includes(channel)
        );
      }

      const { data: cycle, error } = await supabase
        .from('campaign_cycles')
        .update(updateData)
        .eq('id', cycleId)
        .select()
        .single();

      if (error) throw error;

      return transformCycleFromDb(cycle);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-cycle', data.id] });
      queryClient.invalidateQueries({ queryKey: ['campaign-cycles', data.campaign_id] });
    },
  });
}

/**
 * Update cycle status
 */
export function useUpdateCycleStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cycleId,
      status,
    }: {
      cycleId: string;
      status: 'scheduled' | 'active' | 'completed' | 'cancelled';
    }): Promise<CampaignCycle> => {
      const { data: cycle, error } = await supabase
        .from('campaign_cycles')
        .update({ status })
        .eq('id', cycleId)
        .select()
        .single();

      if (error) throw error;

      return transformCycleFromDb(cycle);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-cycle', data.id] });
      queryClient.invalidateQueries({ queryKey: ['campaign-cycles', data.campaign_id] });
    },
  });
}

/**
 * Confirm a cycle (for push/newsletter)
 */
export function useConfirmCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cycleId: string): Promise<CampaignCycle> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Usuário não autenticado');

      const { data: cycle, error } = await supabase
        .from('campaign_cycles')
        .update({
          confirmed_at: new Date().toISOString(),
          confirmed_by: user.id,
          status: 'active',
        })
        .eq('id', cycleId)
        .select()
        .single();

      if (error) throw error;

      return transformCycleFromDb(cycle);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-cycle', data.id] });
      queryClient.invalidateQueries({ queryKey: ['campaign-cycles', data.campaign_id] });
    },
  });
}

/**
 * Delete a cycle
 */
export function useDeleteCycle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cycleId: string): Promise<void> => {
      // First get the campaign_id for cache invalidation
      const { data: cycle } = await supabase
        .from('campaign_cycles')
        .select('campaign_id')
        .eq('id', cycleId)
        .single();

      const { error } = await supabase
        .from('campaign_cycles')
        .delete()
        .eq('id', cycleId);

      if (error) throw error;

      if (cycle) {
        queryClient.invalidateQueries({ queryKey: ['campaign-cycles', cycle.campaign_id] });
      }
    },
  });
}

/**
 * Get active cycles for a channel (used by portal rendering)
 */
export function useActiveCyclesForChannel(channelType: ChannelType) {
  return useQuery({
    queryKey: ['active-cycles-channel', channelType],
    queryFn: async (): Promise<CampaignCycle[]> => {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from('campaign_cycles')
        .select('*')
        .eq('status', 'active')
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`);

      if (error) throw error;

      // Filter by channel type in JS (JSONB array containment)
      return (data || [])
        .map(transformCycleFromDb)
        .filter(cycle => cycle.active_channels.includes(channelType));
    },
    staleTime: 60000,
  });
}

// Helper function to transform DB row to CampaignCycle
function transformCycleFromDb(row: {
  id: string;
  campaign_id: string;
  name: string;
  starts_at: string | null;
  ends_at: string | null;
  active_channels: Json;
  status: string;
  requires_confirmation: boolean | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}): CampaignCycle {
  return {
    id: row.id,
    campaign_id: row.campaign_id,
    name: row.name,
    starts_at: row.starts_at || undefined,
    ends_at: row.ends_at || undefined,
    active_channels: parseJsonArray<ChannelType>(row.active_channels as Json, ['ads']),
    status: row.status as CampaignCycle['status'],
    requires_confirmation: row.requires_confirmation || false,
    confirmed_at: row.confirmed_at || undefined,
    confirmed_by: row.confirmed_by || undefined,
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  };
}
