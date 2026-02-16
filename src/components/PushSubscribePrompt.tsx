import { useState, useEffect, useCallback } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { supabase } from '@/integrations/supabase/client';

const CATEGORIES = [
  { label: 'Cotia', value: 'cotia' },
  { label: 'Brasil', value: 'brasil' },
  { label: 'Esportes', value: 'esportes' },
  { label: 'Educação', value: 'educacao' },
  { label: 'Saúde', value: 'saude' },
  { label: 'Política', value: 'politica' },
  { label: 'Cultura', value: 'cultura' },
  { label: 'Economia', value: 'economia' },
];

type PromptState = 'idle' | 'prompt' | 'preferences' | 'done';

export function PushSubscribePrompt() {
  const { isSupported, isSubscribed, permission, isLoading, subscribe } = usePushSubscription();
  const [state, setState] = useState<PromptState>('idle');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Don't show if not supported, already subscribed, or permission denied
    if (!isSupported || isSubscribed || permission === 'denied' || isLoading) return;

    // Check localStorage for dismiss state
    const promptState = localStorage.getItem('push_prompt_state');
    const nextAt = localStorage.getItem('push_prompt_next_at');

    if (promptState === 'accepted') return;
    if (promptState === 'dismissed' && nextAt) {
      if (Date.now() < parseInt(nextAt)) return;
    }
    if (promptState === 'denied') return;

    // Show after 4 seconds
    const timer = setTimeout(() => {
      setState('prompt');
    }, 4000);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission, isLoading]);

  const handleDismiss = useCallback(() => {
    setState('idle');
    localStorage.setItem('push_prompt_state', 'dismissed');
    // 7 days cooldown
    localStorage.setItem('push_prompt_next_at', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  }, []);

  const handleAccept = useCallback(async () => {
    const success = await subscribe();
    if (success) {
      localStorage.setItem('push_prompt_state', 'accepted');
      setState('preferences');
    } else {
      if (Notification.permission === 'denied') {
        localStorage.setItem('push_prompt_state', 'denied');
        setState('idle');
      }
    }
  }, [subscribe]);

  const toggleCategory = (value: string) => {
    setSelectedCategories(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    );
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await (registration as any).pushManager.getSubscription();
      if (subscription) {
        await supabase
          .from('push_subscriptions')
          .update({
            categories: selectedCategories,
            city: selectedCategories.includes('cotia') ? 'Cotia' : null,
          })
          .eq('endpoint', subscription.endpoint);
      }
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
    setSaving(false);
    setState('done');
    setTimeout(() => setState('idle'), 2000);
  };

  const handleSkipPreferences = () => {
    setState('done');
    setTimeout(() => setState('idle'), 1500);
  };

  const isOpen = state === 'prompt' || state === 'preferences' || state === 'done';
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDismiss(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
        {state === 'prompt' && (
          <div className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Receba as Novidades!</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Permita receber notificações para ficar por dentro das últimas notícias e atualizações.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={handleDismiss} disabled={isLoading}>
                Agora não
              </Button>
              <Button onClick={handleAccept} disabled={isLoading}>
                {isLoading ? 'Ativando...' : 'Aceitar'}
              </Button>
            </div>
          </div>
        )}

        {state === 'preferences' && (
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Check className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Notificações ativadas!</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Quais novidades você quer receber?
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map(cat => (
                <Badge
                  key={cat.value}
                  variant={selectedCategories.includes(cat.value) ? 'default' : 'outline'}
                  className="cursor-pointer select-none text-sm px-3 py-1.5"
                  onClick={() => toggleCategory(cat.value)}
                >
                  {cat.label}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleSkipPreferences}>
                Pular
              </Button>
              <Button size="sm" onClick={handleSavePreferences} disabled={saving} className="flex-1">
                {saving ? 'Salvando...' : 'Salvar preferências'}
              </Button>
            </div>
          </div>
        )}

        {state === 'done' && (
          <div className="p-6 text-center">
            <Check className="w-12 h-12 text-primary mx-auto mb-3" />
            <p className="font-semibold">Tudo pronto!</p>
            <p className="text-sm text-muted-foreground">Você receberá nossas novidades.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
