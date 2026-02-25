import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Play,
  Settings,
  List,
  BarChart3,
  RefreshCw,
} from 'lucide-react';
import { useRegionalStats, useRegionalRuns, useRegionalQueue, useRunRegionalIngest } from '@/hooks/useRegionalAutoPost';
import { ImportActivityPanel } from '@/components/admin/autopost-regional/ImportActivityPanel';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RegionalDashboard() {
  const { data: stats, isLoading: statsLoading } = useRegionalStats();
  const { data: runs, isLoading: runsLoading } = useRegionalRuns();
  const { data: queue, isLoading: queueLoading } = useRegionalQueue();
  const runIngest = useRunRegionalIngest();

  const statCards = [
    {
      title: 'Capturadas Hoje',
      value: stats?.captured_today ?? 0,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Publicadas Hoje',
      value: stats?.published_today ?? 0,
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Na Fila',
      value: stats?.in_queue ?? 0,
      icon: Clock,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Duplicadas',
      value: stats?.duplicates ?? 0,
      icon: XCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Fontes com Erro',
      value: stats?.sources_with_error ?? 0,
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Sucesso</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Aviso</Badge>;
      case 'error':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Erro</Badge>;
      case 'running':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Executando</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">Novo</Badge>;
      case 'queued':
        return <Badge className="bg-blue-500/10 text-blue-500">Na Fila</Badge>;
      case 'processing':
        return <Badge className="bg-amber-500/10 text-amber-500">Processando</Badge>;
      case 'processed':
        return <Badge className="bg-green-500/10 text-green-500">Processado</Badge>;
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-500">Publicado</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-500/10 text-gray-500">Ignorado</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">Auto Post Regional</h1>
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
              Grande Cotia
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Ingestão automática de notícias das prefeituras da região
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => runIngest.mutate(undefined)}
            disabled={runIngest.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${runIngest.isPending ? 'animate-spin' : ''}`} />
            Executar Ingestão
          </Button>
          <Button asChild>
            <Link to="/spah/painel/autopost-regional/fontes">
              <Settings className="h-4 w-4 mr-2" />
              Gerenciar Fontes
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        {statCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : card.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link to="/spah/painel/autopost-regional/fontes" className="block">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Fontes</p>
                <p className="text-sm text-muted-foreground">13 prefeituras</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/spah/painel/autopost-regional/fila" className="block">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10">
                <List className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium">Fila Editorial</p>
                <p className="text-sm text-muted-foreground">{stats?.in_queue ?? 0} itens</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/spah/painel/autopost-regional/logs" className="block">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <BarChart3 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium">Logs</p>
                <p className="text-sm text-muted-foreground">Execuções recentes</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/spah/painel/autopost" className="block">
          <Card className="cursor-pointer hover:border-primary/50 transition-colors h-full">
            <CardContent className="pt-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-500/10">
                <Play className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="font-medium">Auto Post PRO</p>
                <p className="text-sm text-muted-foreground">Módulo avançado</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Import Activity Monitor */}
      <ImportActivityPanel />
    </div>
  );
}