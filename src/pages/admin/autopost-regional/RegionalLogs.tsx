import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  MapPin, 
  ArrowLeft, 
  RefreshCw,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
} from 'lucide-react';
import { 
  useRegionalRuns,
  useRegionalSources,
} from '@/hooks/useRegionalAutoPost';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RegionalLogs() {
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  
  const { data: runs, isLoading, refetch } = useRegionalRuns();
  const { data: sources } = useRegionalSources();

  const filteredRuns = runs?.filter((run) => {
    return sourceFilter === 'all' || run.source_id === sourceFilter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

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

  const calculateDuration = (start: string, end: string | null) => {
    if (!end) return '-';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}min`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/autopost-regional">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h1 className="text-2xl font-bold">Logs de Execução</h1>
            </div>
            <p className="text-muted-foreground">
              Histórico de ingestões por fonte
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Filtrar por fonte:</label>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todas as fontes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as fontes</SelectItem>
                {sources?.map((source) => (
                  <SelectItem key={source.id} value={source.id}>
                    {source.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Runs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Execuções</CardTitle>
          <CardDescription>
            {filteredRuns?.length || 0} execuções encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : filteredRuns && filteredRuns.length > 0 ? (
            <div className="space-y-2">
              {filteredRuns.map((run) => (
                <Collapsible
                  key={run.id}
                  open={expandedRun === run.id}
                  onOpenChange={(open) => setExpandedRun(open ? run.id : null)}
                >
                  <Card className="border">
                    <CollapsibleTrigger asChild>
                      <CardContent className="pt-4 pb-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getStatusIcon(run.status)}
                            <div>
                              <p className="font-medium">
                                {(run.regional_sources as any)?.city || 'Fonte desconhecida'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(run.started_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="text-muted-foreground">
                                {run.items_new} novos / {run.items_duplicated} dup / {run.items_errored} erros
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Duração: {calculateDuration(run.started_at, run.finished_at)}
                              </p>
                            </div>
                            {getStatusBadge(run.status)}
                            <ChevronDown className={`h-4 w-4 transition-transform ${expandedRun === run.id ? 'rotate-180' : ''}`} />
                          </div>
                        </div>
                      </CardContent>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 border-t">
                        <div className="pt-4 space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Itens Encontrados</label>
                              <p className="text-lg font-bold">{run.items_found}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Novos</label>
                              <p className="text-lg font-bold text-green-500">{run.items_new}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Duplicados</label>
                              <p className="text-lg font-bold text-amber-500">{run.items_duplicated}</p>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Erros</label>
                              <p className="text-lg font-bold text-red-500">{run.items_errored}</p>
                            </div>
                          </div>
                          
                          {run.log && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Log</label>
                              <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-32">
                                {run.log}
                              </pre>
                            </div>
                          )}
                          
                          {run.result && Object.keys(run.result).length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Resultado</label>
                              <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-32">
                                {JSON.stringify(run.result, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma execução registrada</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}