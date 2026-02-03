import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PushChannelConfig } from '@/types/campaigns-unified';

interface SendPushParams {
  campaignId: string;
  cycleId?: string;
  config: PushChannelConfig;
}

/**
 * Hook to send push notifications for a campaign
 */
export function useSendPushCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, cycleId, config }: SendPushParams) => {
      const { data, error } = await supabase.functions.invoke('campaign-push', {
        body: {
          campaign_id: campaignId,
          cycle_id: cycleId,
          title: config.title,
          body: config.body,
          icon_url: config.icon_url,
          action_url: config.action_url,
          target_audience: config.target_audience,
          segment_id: config.segment_id,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaign-cycles'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-events'] });
      toast.success(data.message || 'Push notification enviado!');
    },
    onError: (error) => {
      console.error('Error sending push:', error);
      toast.error('Erro ao enviar push notification');
    },
  });
}

/**
 * Hook to subscribe current user to push notifications
 */
export function useSubscribeToPush() {
  return useMutation({
    mutationFn: async (subscription: PushSubscription) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const keys = subscription.toJSON().keys;
      
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscription.endpoint,
          p256dh: keys?.p256dh || '',
          auth: keys?.auth || '',
        }, {
          onConflict: 'user_id,endpoint',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Notificações ativadas!');
    },
    onError: (error) => {
      console.error('Error subscribing to push:', error);
      toast.error('Erro ao ativar notificações');
    },
  });
}

/**
 * Hook to unsubscribe from push notifications
 */
export function useUnsubscribeFromPush() {
  return useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Notificações desativadas');
    },
    onError: (error) => {
      console.error('Error unsubscribing from push:', error);
      toast.error('Erro ao desativar notificações');
    },
  });
}
