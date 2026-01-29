import { useState } from "react";
import { 
  RefreshCw, 
  Database, 
  Rss, 
  Tv, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GradientKpiCard } from "@/components/admin/dashboard/GradientKpiCard";
import { useToast } from "@/hooks/use-toast";
import { 
  useBrSources, 
  useBrFetchLogs, 
  useBrNewsItems,
  useBrGeneratedNews,
  useSyncCbf, 
  useSyncRss, 
  useSyncBroadcasts,
  useGenerateAiNews,
  useToggleSourceEnabled
} from "@/hooks/useBrasileiraoNews";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function BrasileiraoSync() {
  const { toast } = useToast();
  const [logFilter, setLogFilter] = useState<string>("all");

  // Data hooks
  const { data: sources, isLoading: loadingSources } = useBrSources();
  const { data: logs, isLoading: loadingLogs } = useBrFetchLogs(
    logFilter !== "all" ? logFilter : undefined,
    20
  );
  const { data: newsItems } = useBrNewsItems(undefined, 100);
  const { data: generatedNews } = useBrGeneratedNews(undefined, 100);

  // Mutations
  const syncCbfMutation = useSyncCbf();
  const syncRssMutation = useSyncRss();
  const syncBroadcastsMutation = useSyncBroadcasts();
  const generateAiMutation = useGenerateAiNews();
  const toggleSourceMutation = useToggleSourceEnabled();

  // KPI calculations
  const todayNewsCount = newsItems?.filter(n => {
    const date = n.published_at ? new Date(n.published_at) : null;
    return date && date.toDateString() === new Date().toDateString();
  }).length || 0;
  
  const publishedAiNews = generatedNews?.filter(n => n.status === 'published').length || 0;
  const draftAiNews = generatedNews?.filter(n => n.status === 'draft').length || 0;

  const handleSyncCbf = async (action: 'standings' | 'matches') => {
    try {
      await syncCbfMutation.mutateAsync(action);
      toast({
        title: "Sincronização concluída",
        description: `${action === 'standings' ? 'Tabela' : 'Jogos'} atualizados com sucesso.`
      });
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSyncRss = async (source?: string) => {
    try {
      await syncRssMutation.mutateAsync(source);
      toast({
        title: "RSS sincronizado",
        description: "Notícias atualizadas com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro no RSS",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSyncBroadcasts = async () => {
    try {
      await syncBroadcastsMutation.mutateAsync(undefined);
      toast({
        title: "Transmissões atualizadas",
        description: "Onde assistir atualizado com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro nas transmissões",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleGenerateAi = async () => {
    try {
      await generateAiMutation.mutateAsync({
        newsType: 'round_recap',
        context: { round: 1 },
        autoPublish: false
      });
      toast({
        title: "Notícia gerada",
        description: "Nova notícia criada com sucesso."
      });
    } catch (error: any) {
      toast({
        title: "Erro na geração",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  function getSourceStatus(source: any) {
    if (!source.is_enabled) return { label: 'Desabilitada', color: 'bg-muted text-muted-foreground' };
    if (source.error_count >= 5) return { label: 'Erro', color: 'bg-red-500 text-white' };
    if (source.last_success_at) return { label: 'Online', color: 'bg-green-500 text-white' };
    return { label: 'Pendente', color: 'bg-yellow-500 text-white' };
  }

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            Sync & Monitoramento
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie a sincronização de dados do Brasileirão
          </p>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientKpiCard 
          title="Notícias RSS Hoje" 
          value={todayNewsCount} 
          icon={Rss} 
          gradient="blue"
        />
        <GradientKpiCard 
          title="Notícias IA" 
          value={publishedAiNews} 
          icon={Sparkles} 
          gradient="purple"
          subtitle={`${draftAiNews} em rascunho`}
        />
        <GradientKpiCard 
          title="Fontes Ativas" 
          value={sources?.filter(s => s.is_enabled).length || 0} 
          icon={Database} 
          gradient="green"
          subtitle={`de ${sources?.length || 0} totais`}
        />
        <GradientKpiCard 
          title="Sincronizações" 
          value={logs?.length || 0} 
          icon={RefreshCw} 
          gradient="orange"
          subtitle="últimas 20"
        />
      </section>

      {/* Sources Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Status das Fontes
          </CardTitle>
          <CardDescription>
            Configuração e estado atual de cada fonte de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSources ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : sources && sources.length > 0 ? (
            <div className="space-y-3">
              {sources.map((source) => {
                const status = getSourceStatus(source);
                return (
                  <div 
                    key={source.key} 
                    className="flex items-center justify-between p-4 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        source.kind === 'rss' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                      )}>
                        {source.kind === 'rss' ? (
                          <Rss className="h-5 w-5" />
                        ) : (
                          <Database className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{source.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {source.last_success_at 
                            ? `Última sync: ${formatDistanceToNow(new Date(source.last_success_at), { addSuffix: true, locale: ptBR })}`
                            : 'Nunca sincronizado'
                          }
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={status.color}>
                        {status.label}
                      </Badge>
                      {source.error_count > 0 && (
                        <Badge variant="outline" className="text-red-500 border-red-500">
                          {source.error_count} erros
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma fonte configurada
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Ações de Sincronização
          </CardTitle>
          <CardDescription>
            Dispare sincronizações manuais quando necessário
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Button 
              onClick={() => handleSyncCbf('standings')}
              disabled={syncCbfMutation.isPending}
              className="flex-col h-auto py-4 gap-2"
            >
              <Database className={cn("h-5 w-5", syncCbfMutation.isPending && "animate-spin")} />
              <span className="text-xs">Sync Tabela</span>
            </Button>
            <Button 
              onClick={() => handleSyncCbf('matches')}
              disabled={syncCbfMutation.isPending}
              variant="outline"
              className="flex-col h-auto py-4 gap-2"
            >
              <RefreshCw className={cn("h-5 w-5", syncCbfMutation.isPending && "animate-spin")} />
              <span className="text-xs">Sync Jogos</span>
            </Button>
            <Button 
              onClick={() => handleSyncRss()}
              disabled={syncRssMutation.isPending}
              variant="outline"
              className="flex-col h-auto py-4 gap-2"
            >
              <Rss className={cn("h-5 w-5", syncRssMutation.isPending && "animate-spin")} />
              <span className="text-xs">Sync RSS</span>
            </Button>
            <Button 
              onClick={handleSyncBroadcasts}
              disabled={syncBroadcastsMutation.isPending}
              variant="outline"
              className="flex-col h-auto py-4 gap-2"
            >
              <Tv className={cn("h-5 w-5", syncBroadcastsMutation.isPending && "animate-spin")} />
              <span className="text-xs">Transmissões</span>
            </Button>
            <Button 
              onClick={handleGenerateAi}
              disabled={generateAiMutation.isPending}
              variant="secondary"
              className="flex-col h-auto py-4 gap-2"
            >
              <Sparkles className={cn("h-5 w-5", generateAiMutation.isPending && "animate-pulse")} />
              <span className="text-xs">Gerar IA</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Histórico de Sincronizações
            </CardTitle>
            <CardDescription>
              Últimas 20 execuções
            </CardDescription>
          </div>
          <Select value={logFilter} onValueChange={setLogFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as fontes</SelectItem>
              {sources?.map(s => (
                <SelectItem key={s.key} value={s.key}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : logs && logs.length > 0 ? (
            <div className="space-y-2">
              {logs.map((log) => (
                <div 
                  key={log.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    log.success ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {log.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{log.source_key}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.message || (log.success ? `${log.items_processed} itens processados` : 'Falha na execução')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{format(new Date(log.fetched_at), "dd/MM HH:mm")}</div>
                    {log.duration_ms && <div>{log.duration_ms}ms</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhum log encontrado
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
