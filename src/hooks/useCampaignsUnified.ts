import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type {
  CampaignUnified,
  CampaignChannel,
  CampaignAsset,
  CampaignFormData,
  CampaignFilters,
  ChannelType,
  ChannelConfig,
  AdsChannelConfig,
  LoginPanelChannelConfig,
} from '@/types/campaigns-unified';
import { asJson, parseJsonObject } from '@/types/json';
import type { Json } from '@/integrations/supabase/types';

const QUERY_KEY = 'campaigns-unified';

/**
 * Fetch all unified campaigns with optional filters
 */
export function useCampaignsUnified(filters?: CampaignFilters) {
  return useQuery({
    queryKey: [QUERY_KEY, filters],
    queryFn: async (): Promise<CampaignUnified[]> => {
      let query = supabase
        .from('campaigns_unified')
        .select(`
          *,
          channels:campaign_channels(*),
          assets:campaign_assets(*)
        `)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
        query = query.in('status', statuses);
      }

      if (filters?.advertiser) {
        query = query.ilike('advertiser', `%${filters.advertiser}%`);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,advertiser.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform and filter by channel if needed
      let campaigns = (data || []).map(transformCampaign);

      if (filters?.channel) {
        const channels = Array.isArray(filters.channel) ? filters.channel : [filters.channel];
        campaigns = campaigns.filter(c => 
          c.channels?.some(ch => channels.includes(ch.channel_type) && ch.enabled)
        );
      }

      return campaigns;
    },
  });
}

/**
 * Fetch a single campaign by ID with all relations
 */
export function useCampaignUnified(id: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async (): Promise<CampaignUnified | null> => {
      if (!id) return null;

      const { data, error } = await supabase
        .from('campaigns_unified')
        .select(`
          *,
          channels:campaign_channels(*),
          assets:campaign_assets(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? transformCampaign(data) : null;
    },
    enabled: !!id,
  });
}

/**
 * Create a new unified campaign with channels and assets
 */
export function useCreateCampaignUnified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: CampaignFormData): Promise<CampaignUnified> => {
      // 1. Create the campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns_unified')
        .insert({
          name: formData.name,
          advertiser: formData.advertiser,
          description: formData.description,
          status: formData.status,
          starts_at: formData.starts_at || null,
          ends_at: formData.ends_at || null,
          priority: formData.priority,
          cta_text: formData.cta_text,
          cta_url: formData.cta_url,
          frequency_cap_per_day: formData.frequency_cap_per_day,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // 2. Create channels
      if (formData.enabledChannels.length > 0) {
        const channelInserts = formData.enabledChannels.map(channelType => ({
          campaign_id: campaign.id,
          channel_type: channelType, // ChannelType is already correctly typed
          enabled: true,
          config: asJson(getChannelConfig(channelType, formData)),
        }));

        const { error: channelsError } = await supabase
          .from('campaign_channels')
          .insert(channelInserts as any);
        if (channelsError) throw channelsError;
      }

      // 3. Create assets
      if (formData.assets.length > 0) {
        const assets = formData.assets.map(asset => ({
          ...asset,
          campaign_id: campaign.id,
        }));

        const { error: assetsError } = await supabase
          .from('campaign_assets')
          .insert(assets as any);

        if (assetsError) throw assetsError;
      }

      return transformCampaign(campaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campanha criada com sucesso');
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
      toast.error('Erro ao criar campanha');
    },
  });
}

/**
 * Update an existing campaign
 */
export function useUpdateCampaignUnified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CampaignFormData> }): Promise<void> => {
      // Update campaign base data
      const updateData: Record<string, unknown> = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.advertiser !== undefined) updateData.advertiser = data.advertiser;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.starts_at !== undefined) updateData.starts_at = data.starts_at || null;
      if (data.ends_at !== undefined) updateData.ends_at = data.ends_at || null;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.cta_text !== undefined) updateData.cta_text = data.cta_text;
      if (data.cta_url !== undefined) updateData.cta_url = data.cta_url;
      if (data.frequency_cap_per_day !== undefined) updateData.frequency_cap_per_day = data.frequency_cap_per_day;

      if (Object.keys(updateData).length > 0) {
        const { error } = await supabase
          .from('campaigns_unified')
          .update(updateData)
          .eq('id', id);

        if (error) throw error;
      }

      // Update channels if provided
      if (data.enabledChannels) {
        // Delete existing channels
        await supabase.from('campaign_channels').delete().eq('campaign_id', id);

        // Insert new channels
        if (data.enabledChannels.length > 0) {
          const channelInserts = data.enabledChannels.map(channelType => ({
            campaign_id: id,
            channel_type: channelType, // ChannelType is already correctly typed
            enabled: true,
            config: asJson(getChannelConfig(channelType, data as CampaignFormData)),
          }));

          const { error: channelsError } = await supabase
            .from('campaign_channels')
            .insert(channelInserts as any);

          if (channelsError) throw channelsError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campanha atualizada');
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
      toast.error('Erro ao atualizar campanha');
    },
  });
}

/**
 * Delete a campaign
 */
export function useDeleteCampaignUnified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('campaigns_unified')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campanha excluída');
    },
    onError: (error) => {
      console.error('Error deleting campaign:', error);
      toast.error('Erro ao excluir campanha');
    },
  });
}

/**
 * Toggle a specific channel for a campaign
 */
export function useToggleCampaignChannel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      channelType, 
      enabled 
    }: { 
      campaignId: string; 
      channelType: ChannelType; 
      enabled: boolean;
    }): Promise<void> => {
      const { error } = await supabase
        .from('campaign_channels')
        .update({ enabled })
        .eq('campaign_id', campaignId)
        .eq('channel_type', channelType as any);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Canal atualizado');
    },
    onError: (error) => {
      console.error('Error toggling channel:', error);
      toast.error('Erro ao atualizar canal');
    },
  });
}

/**
 * Add a new channel to an existing campaign
 */
export function useAddChannelToCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      campaignId, 
      channelType, 
      config 
    }: { 
      campaignId: string; 
      channelType: ChannelType; 
      config: ChannelConfig;
    }): Promise<CampaignChannel> => {
      const { data, error } = await supabase
        .from('campaign_channels')
        .insert({
          campaign_id: campaignId,
          channel_type: channelType as any,
          enabled: true,
          config: asJson(config),
        } as any)
        .select()
        .single();

      if (error) throw error;
      return transformChannel(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Canal adicionado');
    },
    onError: (error) => {
      console.error('Error adding channel:', error);
      toast.error('Erro ao adicionar canal');
    },
  });
}

/**
 * Add an asset to a campaign
 */
export function useAddCampaignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (asset: Omit<CampaignAsset, 'id' | 'created_at'>): Promise<CampaignAsset> => {
      const { data, error } = await supabase
        .from('campaign_assets')
        .insert(asset as any)
        .select()
        .single();

      if (error) throw error;
      return transformAsset(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Asset adicionado');
    },
    onError: (error) => {
      console.error('Error adding asset:', error);
      toast.error('Erro ao adicionar asset');
    },
  });
}

/**
 * Delete an asset from a campaign
 */
export function useDeleteCampaignAsset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assetId: string): Promise<void> => {
      const { error } = await supabase
        .from('campaign_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Asset removido');
    },
    onError: (error) => {
      console.error('Error deleting asset:', error);
      toast.error('Erro ao remover asset');
    },
  });
}

/**
 * Duplicate an existing campaign (clone with new name and draft status)
 */
export function useDuplicateCampaignUnified() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sourceId: string): Promise<CampaignUnified> => {
      // 1. Fetch source campaign
      const { data: source, error: fetchError } = await supabase
        .from('campaigns_unified')
        .select(`
          *,
          channels:campaign_channels(*),
          assets:campaign_assets(*)
        `)
        .eq('id', sourceId)
        .single();

      if (fetchError) throw fetchError;

      // 2. Create cloned campaign
      const { data: newCampaign, error: insertError } = await supabase
        .from('campaigns_unified')
        .insert({
          name: `${source.name} (Cópia)`,
          advertiser: source.advertiser,
          description: source.description,
          status: 'draft',
          starts_at: null,
          ends_at: null,
          priority: source.priority,
          cta_text: source.cta_text,
          cta_url: source.cta_url,
          frequency_cap_per_day: source.frequency_cap_per_day,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // 3. Clone channels
      const channels = source.channels as Record<string, unknown>[] | null;
      if (channels && channels.length > 0) {
        const channelInserts = channels.map((ch: Record<string, unknown>) => ({
          campaign_id: newCampaign.id,
          channel_type: ch.channel_type,
          enabled: ch.enabled,
          config: ch.config,
        }));

        await supabase.from('campaign_channels').insert(channelInserts as any);
      }

      // 4. Clone assets
      const assets = source.assets as Record<string, unknown>[] | null;
      if (assets && assets.length > 0) {
        const assetInserts = assets.map((a: Record<string, unknown>) => ({
          campaign_id: newCampaign.id,
          asset_type: a.asset_type,
          file_url: a.file_url,
          width: a.width,
          height: a.height,
          alt_text: a.alt_text,
          channel_type: a.channel_type,
          format_key: a.format_key,
        }));

        await supabase.from('campaign_assets').insert(assetInserts as any);
      }

      return transformCampaign(newCampaign);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Campanha duplicada com sucesso');
    },
    onError: (error) => {
      console.error('Error duplicating campaign:', error);
      toast.error('Erro ao duplicar campanha');
    },
  });
}

// Helper functions
function getChannelConfig(channelType: ChannelType, formData: CampaignFormData): ChannelConfig {
  switch (channelType) {
    case 'ads':
      return {
        slot_type: formData.adsConfig?.slot_type || 'home_top',
        size: formData.adsConfig?.size || '970x250',
        sort_order: formData.adsConfig?.sort_order || 0,
        link_target: formData.adsConfig?.link_target || '_blank',
      };
    case 'publidoor':
      return {
        type: formData.publidoorConfig?.type || 'narrativo',
        phrase_1: formData.publidoorConfig?.phrase_1 || '',
        phrase_2: formData.publidoorConfig?.phrase_2,
        phrase_3: formData.publidoorConfig?.phrase_3,
        location_id: formData.publidoorConfig?.location_id,
        template_id: formData.publidoorConfig?.template_id,
      };
    case 'webstories':
      return {
        story_type: formData.webstoriesConfig?.story_type || 'external',
        story_url: formData.webstoriesConfig?.story_url,
        story_id: formData.webstoriesConfig?.story_id,
      };
    case 'push':
      return {
        title: formData.pushConfig?.title || '',
        body: formData.pushConfig?.body || '',
        icon_url: formData.pushConfig?.icon_url,
        action_url: formData.pushConfig?.action_url || '',
        target_audience: formData.pushConfig?.target_audience || 'all',
        segment_id: formData.pushConfig?.segment_id,
      };
    case 'newsletter':
      return {
        subject: formData.newsletterConfig?.subject || '',
        preview_text: formData.newsletterConfig?.preview_text || '',
        template_id: formData.newsletterConfig?.template_id,
        target_list: formData.newsletterConfig?.target_list || '',
        send_at: formData.newsletterConfig?.send_at,
      };
    case 'exit_intent':
      return {
        hero_type: formData.exitIntentConfig?.hero_type || 'publidoor',
        hero_asset_id: formData.exitIntentConfig?.hero_asset_id,
        secondary_1_asset_id: formData.exitIntentConfig?.secondary_1_asset_id,
        secondary_2_asset_id: formData.exitIntentConfig?.secondary_2_asset_id,
        cta_text: formData.exitIntentConfig?.cta_text || 'Continuar navegando',
        priority_type: formData.exitIntentConfig?.priority_type || 'commercial',
      };
    case 'login_panel':
      return {
        display_type: formData.loginPanelConfig?.display_type || 'publidoor',
        asset_id: formData.loginPanelConfig?.asset_id,
        short_text: formData.loginPanelConfig?.short_text,
        cta_text: formData.loginPanelConfig?.cta_text,
        cta_url: formData.loginPanelConfig?.cta_url,
      } as LoginPanelChannelConfig;
    case 'banner_intro':
      return {
        cta_text: formData.bannerIntroConfig?.cta_text || '',
        cta_url: formData.bannerIntroConfig?.cta_url || '',
        display_dates: formData.bannerIntroConfig?.display_dates,
        scheduled_start: formData.bannerIntroConfig?.scheduled_start,
        scheduled_end: formData.bannerIntroConfig?.scheduled_end,
      };
    case 'floating_ad':
      return {
        position: formData.floatingAdConfig?.position || 'right',
        frequency_limit: formData.floatingAdConfig?.frequency_limit || 1,
        cta_text: formData.floatingAdConfig?.cta_text,
        cta_url: formData.floatingAdConfig?.cta_url,
      };
    default:
      // Return a default config for unknown channel types
      return { slot_type: '', size: '', sort_order: 0, link_target: '_blank' } as AdsChannelConfig;
  }
}

function transformCampaign(data: Record<string, unknown>): CampaignUnified {
  return {
    id: data.id as string,
    tenant_id: data.tenant_id as string | undefined,
    name: data.name as string,
    advertiser: data.advertiser as string,
    description: data.description as string | undefined,
    status: data.status as CampaignUnified['status'],
    starts_at: data.starts_at as string | undefined,
    ends_at: data.ends_at as string | undefined,
    priority: (data.priority as number) || 0,
    cta_text: data.cta_text as string | undefined,
    cta_url: data.cta_url as string | undefined,
    frequency_cap_per_day: (data.frequency_cap_per_day as number) || 0,
    created_by: data.created_by as string | undefined,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
    channels: (data.channels as Record<string, unknown>[] | undefined)?.map(transformChannel),
    assets: (data.assets as Record<string, unknown>[] | undefined)?.map(transformAsset),
  };
}

function transformChannel(data: Record<string, unknown>): CampaignChannel {
  const rawConfig = data.config;
  let parsedConfig: ChannelConfig;
  
  if (typeof rawConfig === 'object' && rawConfig !== null && !Array.isArray(rawConfig)) {
    parsedConfig = rawConfig as unknown as ChannelConfig;
  } else {
    parsedConfig = { slot_type: '', size: '', sort_order: 0, link_target: '_blank' };
  }
  
  return {
    id: data.id as string,
    campaign_id: data.campaign_id as string,
    channel_type: data.channel_type as ChannelType,
    enabled: data.enabled as boolean,
    config: parsedConfig,
    created_at: data.created_at as string,
    updated_at: data.updated_at as string,
  };
}

function transformAsset(data: Record<string, unknown>): CampaignAsset {
  return {
    id: data.id as string,
    campaign_id: data.campaign_id as string,
    asset_type: data.asset_type as CampaignAsset['asset_type'],
    file_url: data.file_url as string,
    width: data.width as number | undefined,
    height: data.height as number | undefined,
    alt_text: data.alt_text as string | undefined,
    channel_type: data.channel_type as ChannelType | undefined,
    format_key: data.format_key as string | undefined,
    created_at: data.created_at as string,
  };
}
