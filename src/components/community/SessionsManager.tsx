import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Monitor, Smartphone, Globe, LogOut, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SessionLog {
  id: string;
  device_info: string | null;
  browser: string | null;
  ip_address: string | null;
  location: string | null;
  is_current: boolean;
  created_at: string;
  last_active_at: string;
  ended_at: string | null;
}

function parseUserAgent(ua: string): { browser: string; device: string; os: string } {
  let browser = 'Navegador desconhecido';
  let device = 'desktop';
  let os = 'Sistema desconhecido';

  // Detect browser
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Opera') || ua.includes('OPR')) browser = 'Opera';

  // Detect OS
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac OS')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS';

  // Detect device type
  if (ua.includes('Mobile') || ua.includes('Android') || ua.includes('iPhone')) {
    device = 'mobile';
  } else if (ua.includes('Tablet') || ua.includes('iPad')) {
    device = 'tablet';
  }

  return { browser, device, os };
}

export function SessionsManager() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminating, setIsTerminating] = useState(false);

  const fetchSessions = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_sessions_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions((data as SessionLog[]) || []);
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      toast.error('Erro ao carregar histórico de sessões');
    } finally {
      setIsLoading(false);
    }
  };

  const registerCurrentSession = async () => {
    if (!user) return;

    const ua = navigator.userAgent;
    const { browser, device, os } = parseUserAgent(ua);

    try {
      // Check if there's already a current session
      const { data: existing } = await supabase
        .from('user_sessions_log')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_current', true)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from('user_sessions_log')
          .insert({
            user_id: user.id,
            device_info: `${device} - ${os}`,
            browser,
            is_current: true,
            last_active_at: new Date().toISOString()
          });
      } else {
        // Update last active
        await supabase
          .from('user_sessions_log')
          .update({ last_active_at: new Date().toISOString() })
          .eq('id', existing.id);
      }
    } catch (error) {
      console.error('Erro ao registrar sessão:', error);
    }
  };

  const terminateOtherSessions = async () => {
    if (!user) return;

    setIsTerminating(true);
    try {
      // Sign out from all other sessions
      const { error } = await supabase.auth.signOut({ scope: 'others' });
      if (error) throw error;

      // Mark all non-current sessions as ended
      await supabase
        .from('user_sessions_log')
        .update({ ended_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_current', false)
        .is('ended_at', null);

      toast.success('Todas as outras sessões foram encerradas');
      await fetchSessions();
    } catch (error) {
      console.error('Erro ao encerrar sessões:', error);
      toast.error('Erro ao encerrar sessões');
    } finally {
      setIsTerminating(false);
    }
  };

  useEffect(() => {
    if (user) {
      registerCurrentSession();
      fetchSessions();
    }
  }, [user]);

  const getDeviceIcon = (deviceInfo: string | null) => {
    if (!deviceInfo) return <Monitor className="h-5 w-5" />;
    const lower = deviceInfo.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'agora';
      if (diffMins < 60) return `há ${diffMins} min`;
      if (diffHours < 24) return `há ${diffHours}h`;

      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Sessões Ativas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const activeSessions = sessions.filter(s => !s.ended_at);
  const hasOtherActiveSessions = activeSessions.filter(s => !s.is_current).length > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sessões Ativas
            </CardTitle>
            <CardDescription>
              Gerencie suas sessões de login em diferentes dispositivos
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={fetchSessions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma sessão registrada
          </p>
        ) : (
          <>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    session.is_current ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  } ${session.ended_at ? 'opacity-50' : ''}`}
                >
                  <div className="mt-0.5 text-muted-foreground">
                    {getDeviceIcon(session.device_info)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">
                        {session.browser || 'Navegador'}
                      </span>
                      {session.device_info && (
                        <span className="text-xs text-muted-foreground">
                          · {session.device_info}
                        </span>
                      )}
                      {session.is_current && (
                        <Badge variant="secondary" className="text-xs">
                          Este dispositivo
                        </Badge>
                      )}
                      {session.ended_at && (
                        <Badge variant="outline" className="text-xs">
                          Encerrada
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.ended_at 
                        ? `Encerrada ${formatDate(session.ended_at)}`
                        : `Última atividade: ${formatDate(session.last_active_at)}`
                      }
                    </p>
                    {session.location && (
                      <p className="text-xs text-muted-foreground">
                        {session.location}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {hasOtherActiveSessions && (
              <Button
                variant="destructive"
                className="w-full"
                onClick={terminateOtherSessions}
                disabled={isTerminating}
              >
                {isTerminating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 mr-2" />
                )}
                Encerrar todas as outras sessões
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
