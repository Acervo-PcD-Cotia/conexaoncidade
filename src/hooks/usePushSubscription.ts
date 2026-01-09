import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// VAPID public key from environment
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function usePushSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    permission: 'default',
    isLoading: true
  });

  // Check if push is supported
  const checkSupport = useCallback(() => {
    const isSupported = 'serviceWorker' in navigator && 
                        'PushManager' in window && 
                        'Notification' in window;
    return isSupported;
  }, []);

  // Get current subscription status
  const getSubscriptionStatus = useCallback(async () => {
    if (!checkSupport()) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({
        ...prev,
        isSupported: true,
        isSubscribed: !!subscription,
        permission: Notification.permission,
        isLoading: false
      }));
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkSupport]);

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return null;
    }
  }, []);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!user) {
      toast.error('Você precisa estar logado para ativar notificações');
      return false;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID_PUBLIC_KEY não configurada');
      toast.error('Configuração de push não encontrada');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission, isLoading: false }));
        toast.error('Permissão de notificações negada');
        return false;
      }

      // Register service worker
      const registration = await registerServiceWorker();
      if (!registration) {
        setState(prev => ({ ...prev, isLoading: false }));
        toast.error('Erro ao registrar service worker');
        return false;
      }

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;

      // Subscribe to push
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer
      });

      const subscriptionJson = subscription.toJSON();

      // Save to database
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint: subscriptionJson.endpoint!,
          p256dh: subscriptionJson.keys!.p256dh,
          auth: subscriptionJson.keys!.auth,
          user_agent: navigator.userAgent,
          is_active: true
        }, {
          onConflict: 'endpoint'
        });

      if (error) {
        console.error('Erro ao salvar subscription:', error);
        toast.error('Erro ao salvar configuração');
        return false;
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        isLoading: false
      }));

      toast.success('Notificações ativadas com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao ativar push:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Erro ao ativar notificações');
      return false;
    }
  }, [user, registerServiceWorker]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove from database
        if (user) {
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', subscription.endpoint);
        }
      }

      setState(prev => ({
        ...prev,
        isSubscribed: false,
        isLoading: false
      }));

      toast.success('Notificações desativadas');
      return true;
    } catch (error) {
      console.error('Erro ao desativar push:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Erro ao desativar notificações');
      return false;
    }
  }, [user]);

  // Initialize on mount
  useEffect(() => {
    registerServiceWorker();
    getSubscriptionStatus();
  }, [registerServiceWorker, getSubscriptionStatus]);

  return {
    ...state,
    subscribe,
    unsubscribe,
    refresh: getSubscriptionStatus
  };
}
