import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  permission: NotificationPermission | 'default';
  isLoading: boolean;
}

let cachedVapidKey: string | null = null;

async function getVapidPublicKey(): Promise<string> {
  // Use cached value
  if (cachedVapidKey) return cachedVapidKey;

  // Check env var first
  const envKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (envKey) {
    cachedVapidKey = envKey;
    return envKey;
  }

  // Fetch from edge function using supabase client (more reliable than raw fetch)
  try {
    const { data, error } = await supabase.functions.invoke('get-vapid-key');
    if (!error && data?.publicKey) {
      cachedVapidKey = data.publicKey;
      return cachedVapidKey;
    }
    console.warn('[Push] get-vapid-key returned:', error || 'no publicKey');
  } catch (e) {
    console.error('[Push] Failed to fetch VAPID key:', e);
  }
  return '';
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
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
    isLoading: true,
  });

  const checkSupport = useCallback(() => {
    return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  }, []);

  const getSubscriptionStatus = useCallback(async () => {
    if (!checkSupport()) {
      setState(prev => ({ ...prev, isSupported: false, isLoading: false }));
      return;
    }
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      setState(prev => ({
        ...prev,
        isSupported: true,
        isSubscribed: !!subscription,
        permission: Notification.permission,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Erro ao verificar subscription:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [checkSupport]);

  const registerServiceWorker = useCallback(async () => {
    if (!('serviceWorker' in navigator)) return null;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return null;
    }
  }, []);

  // Subscribe — works for both logged-in and anonymous users
  const subscribe = useCallback(async () => {
    if (!checkSupport()) {
      toast.error('Seu navegador não suporta notificações push.');
      return false;
    }

    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      console.error('VAPID_PUBLIC_KEY não configurada');
      toast.error('Push ainda não foi configurado no painel. Contate o administrador.');
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true }));

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState(prev => ({ ...prev, permission, isLoading: false }));
        if (permission === 'denied') {
          toast.error('Você bloqueou as notificações. Libere nas configurações do navegador.');
        } else {
          toast.error('Permissão de notificações não concedida.');
        }
        return false;
      }

      const registration = await registerServiceWorker();
      if (!registration) {
        setState(prev => ({ ...prev, isLoading: false }));
        toast.error('Erro ao registrar service worker');
        return false;
      }

      await navigator.serviceWorker.ready;

      const applicationServerKey = urlBase64ToUint8Array(vapidKey);
      const subscription = await (registration as any).pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey.buffer as ArrayBuffer,
      });

      const subscriptionJson = subscription.toJSON();

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            user_id: user?.id || null,
            endpoint: subscriptionJson.endpoint!,
            p256dh: subscriptionJson.keys!.p256dh,
            auth: subscriptionJson.keys!.auth,
            user_agent: navigator.userAgent,
            is_active: true,
            status: 'active',
          },
          { onConflict: 'endpoint' }
        );

      if (error) {
        console.error('Erro ao salvar subscription:', error);
        toast.error('Erro ao salvar configuração');
        return false;
      }

      setState(prev => ({
        ...prev,
        isSubscribed: true,
        permission: 'granted',
        isLoading: false,
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

  const unsubscribe = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await supabase
          .from('push_subscriptions')
          .update({ is_active: false, status: 'unsubscribed' })
          .eq('endpoint', subscription.endpoint);
      }
      setState(prev => ({ ...prev, isSubscribed: false, isLoading: false }));
      toast.success('Notificações desativadas');
      return true;
    } catch (error) {
      console.error('Erro ao desativar push:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      toast.error('Erro ao desativar notificações');
      return false;
    }
  }, []);

  useEffect(() => {
    registerServiceWorker();
    getSubscriptionStatus();
  }, [registerServiceWorker, getSubscriptionStatus]);

  return { ...state, subscribe, unsubscribe, refresh: getSubscriptionStatus };
}
