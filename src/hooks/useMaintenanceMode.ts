import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MaintenanceSettings {
  enabled: boolean;
  message: string;
  estimated_end: string | null;
}

export function useMaintenanceMode() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings', 'maintenance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'maintenance')
        .maybeSingle();

      if (error) throw error;
      
      const defaultSettings: MaintenanceSettings = {
        enabled: false,
        message: 'Estamos em manutenção programada. Voltaremos em breve!',
        estimated_end: null
      };
      
      if (!data?.value) return defaultSettings;
      
      const value = data.value as Record<string, unknown>;
      return {
        enabled: Boolean(value.enabled),
        message: String(value.message || defaultSettings.message),
        estimated_end: value.estimated_end ? String(value.estimated_end) : null
      };
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // Check every 30 seconds
  });

  const updateMutation = useMutation({
    mutationFn: async (newSettings: MaintenanceSettings) => {
      const jsonValue = {
        enabled: newSettings.enabled,
        message: newSettings.message,
        estimated_end: newSettings.estimated_end
      };
      
      const { error } = await supabase
        .from('site_settings')
        .update({ 
          value: jsonValue,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'maintenance');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings', 'maintenance'] });
      toast.success('Configurações de manutenção atualizadas');
    },
    onError: (error) => {
      console.error('Error updating maintenance settings:', error);
      toast.error('Erro ao atualizar configurações');
    }
  });

  const toggleMaintenance = (enabled: boolean) => {
    if (!settings) return;
    updateMutation.mutate({ ...settings, enabled });
  };

  const updateMessage = (message: string) => {
    if (!settings) return;
    updateMutation.mutate({ ...settings, message });
  };

  const updateEstimatedEnd = (estimated_end: string | null) => {
    if (!settings) return;
    updateMutation.mutate({ ...settings, estimated_end });
  };

  return {
    isMaintenanceMode: settings?.enabled ?? false,
    message: settings?.message ?? '',
    estimatedEnd: settings?.estimated_end ?? null,
    isLoading,
    toggleMaintenance,
    updateMessage,
    updateEstimatedEnd,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}

export function useAdminNotificationPreferences() {
  const queryClient = useQueryClient();

  const { data: preferences, isLoading } = useQuery({
    queryKey: ['admin-notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('admin_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      return data || {
        notify_pending_news: true,
        notify_pending_factcheck: true,
        notify_community_reports: true,
      };
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newPreferences: {
      notify_pending_news?: boolean;
      notify_pending_factcheck?: boolean;
      notify_community_reports?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('admin_notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notification-preferences'] });
      toast.success('Preferências de notificação atualizadas');
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast.error('Erro ao atualizar preferências');
    }
  });

  return {
    preferences,
    isLoading,
    updatePreferences: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
