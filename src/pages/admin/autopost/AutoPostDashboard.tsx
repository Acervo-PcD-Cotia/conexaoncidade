import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Zap, Download, ListChecks, Copy, AlertTriangle, 
  Plus, Play, Clock, TrendingUp, ArrowRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAutoPostStats, useAutoPostJobs, useAutoPostQueue } from '@/hooks/useAutoPost';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AutoPostDashboard() {
  const { data: stats, isLoading: statsLoading } = useAutoPostStats();
  const { data: recentJobs } = useAutoPostJobs();
  const { data: queueItems } = useAutoPostQueue();

  const statCards = [
    {
      title: 'Capturadas Hoje',
      value: stats?.capturedToday || 0,
      icon: Download,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Publicadas Hoje',
      value: stats?.publishedToday || 0,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Na Fila',
      value: stats?.inQueue || 0,
      icon: ListChecks,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Duplicadas Bloqueadas',
      value: stats?.duplicatesBlocked || 0,
      icon: Copy,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Fontes com Erro',
      value: stats?.sourcesWithErrors || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Auto Post PRO</h1>
            <p className="text-muted-foreground">
              Automação editorial inteligente
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/spah/painel/autopost/queue">
              <ListChecks className="h-4 w-4 mr-2" />
              Abrir Fila
            </Link>
          </Button>
          <Button asChild>
            <Link to="/spah/painel/autopost/sources/new">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Fonte
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <p className="text-3xl font-bold">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Execuções Recentes</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/spah/painel/autopost/logs">
                Ver todas
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentJobs?.slice(0, 8).map((job) => (
                <div 
                  key={job.id} 
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${
                      job.status === 'success' ? 'bg-green-100' :
                      job.status === 'failed' ? 'bg-red-100' :
                      job.status === 'running' ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {job.status === 'running' ? (
                        <Play className="h-3.5 w-3.5 text-blue-600 animate-pulse" />
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {(job.source as { name?: string })?.name || 'Fonte'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.items_new} novos • {job.items_duplicated} duplicados
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={
                      job.status === 'success' ? 'default' :
                      job.status === 'failed' ? 'destructive' :
                      job.status === 'running' ? 'secondary' : 'outline'
                    }>
                      {job.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(job.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                </div>
              ))}
              
              {(!recentJobs || recentJobs.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma execução registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Queue Preview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Fila Editorial</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/spah/painel/autopost/queue">
                Ver fila completa
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {queueItems?.slice(0, 8).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-start justify-between py-2 border-b last:border-0"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium truncate">
                      {item.original_title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(item.source as { name?: string })?.name || 'Fonte desconhecida'}
                    </p>
                  </div>
                  <Badge variant={
                    item.status === 'approved' ? 'default' :
                    item.status === 'queued' ? 'secondary' :
                    item.status === 'processed' ? 'outline' : 'outline'
                  }>
                    {item.status === 'captured' && 'Capturado'}
                    {item.status === 'processed' && 'Processado'}
                    {item.status === 'queued' && 'Na Fila'}
                    {item.status === 'approved' && 'Aprovado'}
                    {item.status === 'scheduled' && 'Agendado'}
                  </Badge>
                </div>
              ))}
              
              {(!queueItems || queueItems.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  Fila vazia
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/spah/painel/autopost/sources/new">
                <Plus className="h-5 w-5" />
                <span>Nova Fonte</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/spah/painel/autopost/queue">
                <ListChecks className="h-5 w-5" />
                <span>Revisar Fila</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/spah/painel/autopost/rules">
                <Zap className="h-5 w-5" />
                <span>Configurar Regras</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
              <Link to="/spah/painel/autopost/reports">
                <TrendingUp className="h-5 w-5" />
                <span>Ver Relatórios</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
