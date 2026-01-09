import { useState } from 'react';
import { Calendar, Clock, Play, Pause, RefreshCw, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useAutoPostSources, useAutoPostScheduledPublishes } from '@/hooks/useAutoPost';

export default function AutoPostSchedules() {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  
  const { data: sources, isLoading: loadingSources } = useAutoPostSources();
  const { data: scheduledPosts, isLoading: loadingPosts } = useAutoPostScheduledPublishes();

  const activeSources = sources?.filter(s => s.status === 'active') || [];
  const pendingSchedules = scheduledPosts?.filter(s => s.status === 'pending') || [];

  const getNextRunText = (nextRun: string | null) => {
    if (!nextRun) return 'Não agendado';
    const date = new Date(nextRun);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 0) return 'Atrasado';
    if (diffMins < 60) return `Em ${diffMins} min`;
    if (diffMins < 1440) return `Em ${Math.round(diffMins / 60)} horas`;
    return format(date, "dd/MM 'às' HH:mm", { locale: ptBR });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Plugins', href: '/admin' },
        { label: 'Auto Post PRO', href: '/admin/autopost' },
        { label: 'Agendamentos' }
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agendamentos</h1>
          <p className="text-muted-foreground">Gerencie capturas automáticas e publicações agendadas</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fontes Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSources.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próxima Captura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeSources.length > 0 
                ? getNextRunText(activeSources.sort((a, b) => 
                    new Date(a.next_run_at || 0).getTime() - new Date(b.next_run_at || 0).getTime()
                  )[0]?.next_run_at || null)
                : '-'
              }
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Publicações Agendadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingSchedules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Próxima Publicação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingSchedules.length > 0
                ? format(new Date(pendingSchedules[0].scheduled_for), "HH:mm", { locale: ptBR })
                : '-'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Capturas Programadas
          </TabsTrigger>
          <TabsTrigger value="publications" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Publicações Agendadas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Agenda de Capturas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSources ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : activeSources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma fonte ativa com agendamento
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Frequência</TableHead>
                      <TableHead>Horário Permitido</TableHead>
                      <TableHead>Última Execução</TableHead>
                      <TableHead>Próxima Execução</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSources.map((source) => (
                      <TableRow key={source.id}>
                        <TableCell className="font-medium">{source.name}</TableCell>
                        <TableCell>
                          {source.schedule_frequency_minutes 
                            ? source.schedule_frequency_minutes >= 60 
                              ? `${source.schedule_frequency_minutes / 60}h`
                              : `${source.schedule_frequency_minutes}min`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {source.allowed_hours_start !== null && source.allowed_hours_end !== null
                            ? `${String(source.allowed_hours_start).padStart(2, '0')}:00 - ${String(source.allowed_hours_end).padStart(2, '0')}:00`
                            : '24h'
                          }
                        </TableCell>
                        <TableCell>
                          {source.last_run_at 
                            ? format(new Date(source.last_run_at), "dd/MM HH:mm", { locale: ptBR })
                            : 'Nunca'
                          }
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">
                            {getNextRunText(source.next_run_at)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
                            {source.status === 'active' ? 'Ativo' : 'Pausado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon">
                              {source.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedSource(source.id)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications">
          <Card>
            <CardHeader>
              <CardTitle>Publicações Agendadas</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingPosts ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : pendingSchedules.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma publicação agendada</p>
                  <p className="text-sm">Aprove itens na fila com data de publicação futura</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Agendado Para</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingSchedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell className="font-medium">
                          {schedule.rewritten_post_id}
                        </TableCell>
                        <TableCell>
                          {format(new Date(schedule.scheduled_for), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Badge variant={schedule.status === 'pending' ? 'outline' : 'default'}>
                            {schedule.status === 'pending' ? 'Aguardando' : 'Publicado'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">Cancelar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Source Details Sheet */}
      <Sheet open={!!selectedSource} onOpenChange={() => setSelectedSource(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Detalhes do Agendamento</SheetTitle>
          </SheetHeader>
          {selectedSource && (
            <div className="mt-6 space-y-4">
              {(() => {
                const source = sources?.find(s => s.id === selectedSource);
                if (!source) return null;
                return (
                  <>
                    <div>
                      <h3 className="font-medium">{source.name}</h3>
                      <p className="text-sm text-muted-foreground">{source.site_url}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Frequência</p>
                        <p className="font-medium">
                          {source.schedule_frequency_minutes 
                            ? `A cada ${source.schedule_frequency_minutes} minutos`
                            : 'Manual'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Limite Diário</p>
                        <p className="font-medium">{source.daily_limit || 'Sem limite'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Por Execução</p>
                        <p className="font-medium">{source.per_run_limit || 'Sem limite'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Saúde</p>
                        <p className="font-medium">{source.health_score || 100}%</p>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}