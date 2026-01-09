import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useAuth } from '@/contexts/AuthContext';

export function PushPermissionBanner() {
  const { user } = useAuth();
  const { isSupported, isSubscribed, permission, isLoading, subscribe } = usePushSubscription();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner previously
    const dismissed = localStorage.getItem('push-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }

    // Show banner after 3 seconds if conditions are met
    const timer = setTimeout(() => {
      if (isSupported && !isSubscribed && permission !== 'denied' && user && !dismissed) {
        setShowBanner(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission, user]);

  const handleDismiss = () => {
    setShowBanner(false);
    setIsDismissed(true);
    localStorage.setItem('push-banner-dismissed', 'true');
  };

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setShowBanner(false);
    }
  };

  if (!showBanner || isDismissed || isLoading) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="p-4 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">Ative as notificações</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Receba alertas sobre novos eventos, edições digitais e conteúdos exclusivos.
            </p>
            
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                onClick={handleSubscribe}
                disabled={isLoading}
              >
                {isLoading ? 'Ativando...' : 'Ativar'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={handleDismiss}
              >
                Agora não
              </Button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}
