import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Calendar, Check, Clock, AlertCircle, Bell, Mail, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCampaignCycles, useCreateCycle, useConfirmCycle } from '@/hooks/useCampaignCycles';
import { useSendPushCampaign } from '@/hooks/usePushCampaign';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ChannelType, CycleStatus, CampaignCycle } from '@/types/campaigns-unified';

interface CycleSelectorCardProps {
  campaignId: string;
  enabledChannels: ChannelType[];
}

const CHANNEL_LABELS: Record<ChannelType, string> = {
  ads: 'Ads',
  publidoor: 'Publidoor',
  webstories: 'WebStories',
  push: 'Push',
  newsletter: 'Newsletter',
  exit_intent: 'Exit-Intent',
  login_panel: 'Login Panel',
};

const STATUS_CONFIG: Record<CycleStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  scheduled: { label: 'Agendado', variant: 'outline' },
  active: { label: 'Ativo', variant: 'default' },
  completed: { label: 'Concluído', variant: 'secondary' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

const REQUIRES_CONFIRMATION: ChannelType[] = ['push', 'newsletter'];

export function CycleSelectorCard({ campaignId, enabledChannels }: CycleSelectorCardProps) {
  const { data: cycles = [], isLoading } = useCampaignCycles(campaignId);
  const createMutation = useCreateCycle();
  const confirmMutation = useConfirmCycle();
  const sendPushMutation = useSendPushCampaign();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sendingPush, setSendingPush] = useState<string | null>(null);
  const [sendingNewsletter, setSendingNewsletter] = useState<string | null>(null);
  const [newCycle, setNewCycle] = useState({
    name: '',
    starts_at: '',
    ends_at: '',
    active_channels: [] as ChannelType[],
  });

  const handleCreateCycle = () => {
    if (!newCycle.name.trim()) return;

    createMutation.mutate({
      campaignId,
      data: {
        name: newCycle.name,
        starts_at: newCycle.starts_at || undefined,
        ends_at: newCycle.ends_at || undefined,
        active_channels: newCycle.active_channels,
      },
    }, {
      onSuccess: () => {
        setIsDialogOpen(false);
        setNewCycle({ name: '', starts_at: '', ends_at: '', active_channels: [] });
      },
    });
  };

  const handleConfirmCycle = (cycleId: string) => {
    confirmMutation.mutate(cycleId);
  };

  const handleSendPush = async (cycle: CampaignCycle) => {
    if (!cycle.active_channels.includes('push')) return;
    
    setSendingPush(cycle.id);
    try {
      // Get push config from campaign channels
      const { data: channelData } = await supabase
        .from('campaign_channels')
        .select('config')
        .eq('campaign_id', campaignId)
        .eq('channel_type', 'push')
        .single();

      if (!channelData?.config) {
        toast.error('Configuração de Push não encontrada');
        return;
      }

      const config = channelData.config as { title?: string; body?: string; icon_url?: string; action_url?: string; target_audience?: 'all' | 'segment' | 'subscribers' };
      
      sendPushMutation.mutate({
        campaignId,
        cycleId: cycle.id,
        config: {
          title: config.title || 'Nova mensagem',
          body: config.body || '',
          icon_url: config.icon_url,
          action_url: config.action_url,
          target_audience: config.target_audience ?? 'all',
        },
      });
    } finally {
      setSendingPush(null);
    }
  };

  const handleSendNewsletter = async (cycle: CampaignCycle) => {
    if (!cycle.active_channels.includes('newsletter')) return;
    
    setSendingNewsletter(cycle.id);
    try {
      // Get newsletter config from campaign channels
      const { data: channelData } = await supabase
        .from('campaign_channels')
        .select('config')
        .eq('campaign_id', campaignId)
        .eq('channel_type', 'newsletter')
        .single();

      if (!channelData?.config) {
        toast.error('Configuração de Newsletter não encontrada');
        return;
      }

      const config = channelData.config as { subject?: string; preview_text?: string; content_html?: string; target_list?: string };
      
      const { error } = await supabase.functions.invoke('campaign-newsletter', {
        body: {
          campaign_id: campaignId,
          cycle_id: cycle.id,
          subject: config.subject || 'Newsletter',
          preview_text: config.preview_text || '',
          content_html: config.content_html,
          target_list: config.target_list || 'all',
        },
      });

      if (error) {
        toast.error('Erro ao enviar newsletter');
      } else {
        toast.success('Newsletter enviada com sucesso!');
      }
    } catch (err) {
      toast.error('Erro ao enviar newsletter');
    } finally {
      setSendingNewsletter(null);
    }
  };

  const toggleChannel = (channel: ChannelType) => {
    setNewCycle(prev => ({
      ...prev,
      active_channels: prev.active_channels.includes(channel)
        ? prev.active_channels.filter(c => c !== channel)
        : [...prev.active_channels, channel],
    }));
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), "dd/MM/yyyy HH:mm", { locale: ptBR });
  };

  const needsConfirmation = (cycle: CampaignCycle) => {
    return cycle.requires_confirmation && !cycle.confirmed_at;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ciclos de Distribuição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded" />
            <div className="h-16 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg">Ciclos de Distribuição</CardTitle>
          <CardDescription>
            Gerencie rodadas de exibição/envio da campanha
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Novo Ciclo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Ciclo</DialogTitle>
              <DialogDescription>
                Um ciclo representa uma rodada de exibição/envio
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="cycle-name">Nome do Ciclo</Label>
                <Input
                  id="cycle-name"
                  placeholder="Ex: Lançamento, Reforço, Semana 2"
                  value={newCycle.name}
                  onChange={(e) => setNewCycle(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cycle-start">Início</Label>
                  <Input
                    id="cycle-start"
                    type="datetime-local"
                    value={newCycle.starts_at}
                    onChange={(e) => setNewCycle(prev => ({ ...prev, starts_at: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cycle-end">Fim</Label>
                  <Input
                    id="cycle-end"
                    type="datetime-local"
                    value={newCycle.ends_at}
                    onChange={(e) => setNewCycle(prev => ({ ...prev, ends_at: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Canais ativos neste ciclo</Label>
                <div className="grid grid-cols-2 gap-2">
                  {enabledChannels.map(channel => (
                    <div key={channel} className="flex items-center gap-2">
                      <Checkbox
                        id={`channel-${channel}`}
                        checked={newCycle.active_channels.includes(channel)}
                        onCheckedChange={() => toggleChannel(channel)}
                      />
                      <Label 
                        htmlFor={`channel-${channel}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {CHANNEL_LABELS[channel]}
                        {REQUIRES_CONFIRMATION.includes(channel) && (
                          <span className="text-xs text-muted-foreground ml-1">*</span>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
                {newCycle.active_channels.some(ch => REQUIRES_CONFIRMATION.includes(ch)) && (
                  <p className="text-xs text-amber-600 mt-2">
                    * Push e Newsletter exigem confirmação manual antes do envio
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateCycle}
                disabled={!newCycle.name.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? 'Criando...' : 'Criar Ciclo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        {cycles.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Nenhum ciclo criado ainda</p>
            <p className="text-sm">Crie o primeiro ciclo para agendar exibições</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cycles.map(cycle => (
              <div
                key={cycle.id}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{cycle.name}</h4>
                      <Badge variant={STATUS_CONFIG[cycle.status].variant}>
                        {STATUS_CONFIG[cycle.status].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(cycle.starts_at)} — {formatDate(cycle.ends_at)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cycle.active_channels.map(channel => (
                    <Badge key={channel} variant="secondary" className="text-xs">
                      {CHANNEL_LABELS[channel]}
                    </Badge>
                  ))}
                </div>

                {needsConfirmation(cycle) && (
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="flex items-center justify-between">
                      <span className="text-amber-800">
                        Este ciclo inclui Push/Newsletter e requer confirmação manual
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleConfirmCycle(cycle.id)}
                        disabled={confirmMutation.isPending}
                        className="ml-4"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirmar Envio
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {cycle.confirmed_at && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Confirmado em {formatDate(cycle.confirmed_at)}
                  </p>
                )}

                {/* Send buttons for confirmed cycles */}
                {cycle.confirmed_at && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    {cycle.active_channels.includes('push') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendPush(cycle)}
                        disabled={sendingPush === cycle.id || sendPushMutation.isPending}
                        className="flex items-center gap-1"
                      >
                        <Bell className="h-4 w-4" />
                        {sendingPush === cycle.id ? 'Enviando...' : 'Enviar Push'}
                      </Button>
                    )}
                    {cycle.active_channels.includes('newsletter') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSendNewsletter(cycle)}
                        disabled={sendingNewsletter === cycle.id}
                        className="flex items-center gap-1"
                      >
                        <Mail className="h-4 w-4" />
                        {sendingNewsletter === cycle.id ? 'Enviando...' : 'Enviar Newsletter'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
