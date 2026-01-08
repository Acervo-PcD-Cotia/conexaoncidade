import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Play, Pause, Clock, RefreshCw, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Schedule {
  id: string;
  name: string;
  urls: string[];
  interval: string;
  max_articles: number;
  source_id: string | null;
  auto_publish: boolean;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
}

interface ScheduleLog {
  id: string;
  status: string;
  articles_imported: number;
  errors: string[] | null;
  created_at: string;
}

interface Source {
  id: string;
  name: string;
  badge: string;
}

const INTERVALS = [
  { value: '15min', label: 'A cada 15 minutos' },
  { value: '30min', label: 'A cada 30 minutos' },
  { value: '1h', label: 'A cada hora' },
  { value: '2h', label: 'A cada 2 horas' },
  { value: '6h', label: 'A cada 6 horas' },
  { value: '12h', label: 'A cada 12 horas' },
  { value: '24h', label: 'Uma vez por dia' },
];

const MAX_ARTICLES_OPTIONS = [1, 3, 5, 10, 15, 20];

export function NoticiasAISchedulesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [logs, setLogs] = useState<Record<string, ScheduleLog[]>>({});
  const [expandedLogs, setExpandedLogs] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    urls: '',
    interval: '1h',
    max_articles: 5,
    source_id: '',
    auto_publish: false,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, sourcesRes] = await Promise.all([
        supabase.from('noticias_ai_schedules').select('*').order('created_at', { ascending: false }),
        supabase.from('noticias_ai_sources').select('id, name, badge').eq('is_active', true),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      if (sourcesRes.error) throw sourcesRes.error;

      setSchedules(schedulesRes.data || []);
      setSources(sourcesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async (scheduleId: string) => {
    try {
      const { data, error } = await supabase
        .from('noticias_ai_schedule_logs')
        .select('*')
        .eq('schedule_id', scheduleId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLogs(prev => ({ ...prev, [scheduleId]: data || [] }));
    } catch (error) {
      console.error('Error fetching logs:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggle = async (schedule: Schedule) => {
    try {
      const { error } = await supabase
        .from('noticias_ai_schedules')
        .update({ is_active: !schedule.is_active })
        .eq('id', schedule.id);

      if (error) throw error;

      setSchedules(prev => prev.map(s => 
        s.id === schedule.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({ title: 'Erro ao atualizar agendamento', variant: 'destructive' });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setFormData({
      name: schedule.name,
      urls: schedule.urls.join('\n'),
      interval: schedule.interval,
      max_articles: schedule.max_articles,
      source_id: schedule.source_id || '',
      auto_publish: schedule.auto_publish,
    });
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingId(null);
    setFormData({
      name: '',
      urls: '',
      interval: '1h',
      max_articles: 5,
      source_id: '',
      auto_publish: false,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.urls.trim()) {
      toast({ title: 'Preencha todos os campos obrigatórios', variant: 'destructive' });
      return;
    }

    const urls = formData.urls.split('\n').filter(u => u.trim());
    if (urls.length === 0) {
      toast({ title: 'Adicione pelo menos uma URL', variant: 'destructive' });
      return;
    }

    try {
      const data = {
        name: formData.name,
        urls,
        interval: formData.interval,
        max_articles: formData.max_articles,
        source_id: formData.source_id || null,
        auto_publish: formData.auto_publish,
        created_by: user?.id,
      };

      if (editingId) {
        const { error } = await supabase
          .from('noticias_ai_schedules')
          .update(data)
          .eq('id', editingId);

        if (error) throw error;
        toast({ title: 'Agendamento atualizado!' });
      } else {
        const { error } = await supabase
          .from('noticias_ai_schedules')
          .insert(data);

        if (error) throw error;
        toast({ title: 'Agendamento criado!' });
      }

      setDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast({ title: 'Erro ao salvar agendamento', variant: 'destructive' });
    }
  };

  const handleDelete = async (schedule: Schedule) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return;

    try {
      const { error } = await supabase
        .from('noticias_ai_schedules')
        .delete()
        .eq('id', schedule.id);

      if (error) throw error;
      toast({ title: 'Agendamento excluído!' });
      fetchData();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({ title: 'Erro ao excluir agendamento', variant: 'destructive' });
    }
  };

  const toggleLogs = (scheduleId: string) => {
    if (expandedLogs === scheduleId) {
      setExpandedLogs(null);
    } else {
      setExpandedLogs(scheduleId);
      if (!logs[scheduleId]) {
        fetchLogs(scheduleId);
      }
    }
  };

  return (
    <div className="space-y-4" data-tour="schedules-tab">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Agendamentos Automáticos</CardTitle>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="mr-1 h-4 w-4" />
            Novo Agendamento
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedules.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              Nenhum agendamento configurado.
            </div>
          ) : (
            schedules.map((schedule) => (
              <Collapsible key={schedule.id}>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Switch
                        checked={schedule.is_active}
                        onCheckedChange={() => handleToggle(schedule)}
                      />
                      <div>
                        <h4 className="font-medium">{schedule.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {INTERVALS.find(i => i.value === schedule.interval)?.label}
                          <span>•</span>
                          <FileText className="h-3 w-3" />
                          {schedule.urls.length} URLs
                          <span>•</span>
                          Max {schedule.max_articles} artigos
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={schedule.is_active ? 'default' : 'secondary'}>
                        {schedule.is_active ? 'Ativo' : 'Pausado'}
                      </Badge>
                      
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => toggleLogs(schedule.id)}>
                          {expandedLogs === schedule.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(schedule)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {schedule.last_run_at && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Última execução: {formatDistanceToNow(new Date(schedule.last_run_at), { addSuffix: true, locale: ptBR })}
                    </p>
                  )}

                  <CollapsibleContent className="mt-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <h5 className="mb-2 text-sm font-medium">Logs de Execução</h5>
                      {logs[schedule.id]?.length > 0 ? (
                        <div className="space-y-2">
                          {logs[schedule.id].map((log) => (
                            <div key={log.id} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                              <div className="flex items-center gap-2">
                                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                                  {log.status}
                                </Badge>
                                <span>{log.articles_imported} importados</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Nenhum log disponível.</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Importar Agência Brasil"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="urls">URLs (uma por linha) *</Label>
              <Textarea
                id="urls"
                value={formData.urls}
                onChange={(e) => setFormData(prev => ({ ...prev, urls: e.target.value }))}
                placeholder="https://exemplo.com/feed&#10;https://outro-site.com/rss"
                rows={4}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="interval">Intervalo</Label>
                <Select
                  value={formData.interval}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, interval: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTERVALS.map((interval) => (
                      <SelectItem key={interval.value} value={interval.value}>
                        {interval.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max">Máx. Artigos</Label>
                <Select
                  value={String(formData.max_articles)}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, max_articles: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MAX_ARTICLES_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Fonte Associada (opcional)</Label>
              <Select
                value={formData.source_id}
                onValueChange={(v) => setFormData(prev => ({ ...prev, source_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma fonte" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Nenhuma</SelectItem>
                  {sources.map((source) => (
                    <SelectItem key={source.id} value={source.id}>
                      [{source.badge}] {source.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="auto-publish"
                checked={formData.auto_publish}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, auto_publish: v }))}
              />
              <Label htmlFor="auto-publish">Publicar automaticamente</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
