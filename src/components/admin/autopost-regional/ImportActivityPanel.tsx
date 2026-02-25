import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Rss,
  Globe,
  RefreshCw,
  ChevronRight,
  Newspaper,
  Ban,
  Copy,
  TrendingUp,
} from 'lucide-react';
import { useRegionalRuns, useRegionalSources } from '@/hooks/useRegionalAutoPost';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SourceSummary {
  id: string;
  city: string;
  name: string;
  type: string;
  is_active: boolean;
  lastRun: {
    status: string;
    started_at: string;
    items_new: number;
    items_duplicated: number;
    items_errored: number;
  } | null;
  totalNewToday: number;
  totalRunsToday: number;
  error_count: number;
}

export function ImportActivityPanel() {
  const [activeTab, setActiveTab] = useState('timeline');
  const { data: runs, isLoading: runsLoading, refetch } = useRegionalRuns();
  const { data: sources, isLoading: sourcesLoading } = useRegionalSources();

  // Build per-source summaries
  const sourceSummaries = useMemo<SourceSummary[]>(() => {
    if (!sources || !runs) return [];

    return sources.map((source) => {
      const sourceRuns = runs.filter((r) => r.source_id === source.id);
      const todayRuns = sourceRuns.filter((r) => isToday(new Date(r.started_at)));
      const lastRun = sourceRuns[0] || null;

      return {
        id: source.id,
        city: source.city,
        name: source.name,
        type: source.type,
        is_active: source.is_active,
        lastRun: lastRun
          ? {
              status: lastRun.status,
              started_at: lastRun.started_at,
              items_new: lastRun.items_new,
              items_duplicated: lastRun.items_duplicated,
              items_errored: lastRun.items_errored,
            }
          : null,
        totalNewToday: todayRuns.reduce((sum, r) => sum + r.items_new, 0),
        totalRunsToday: todayRuns.length,
        error_count: source.error_count,
      };
    }).sort((a, b) => {
      // Sources with errors first, then by last run date
      if (a.error_count > 0 && b.error_count === 0) return -1;
      if (b.error_count > 0 && a.error_count === 0) return 1;
      const aTime = a.lastRun?.started_at ? new Date(a.lastRun.started_at).getTime() : 0;
      const bTime = b.lastRun?.started_at ? new Date(b.lastRun.started_at).getTime() : 0;
      return bTime - aTime;
    });
  }, [sources, runs]);

  // Aggregate stats
  const stats = useMemo(() => {
    if (!runs) return { todayNew: 0, todayDup: 0, todayErrors: 0, todayRuns: 0, activeSources: 0, errorSources: 0 };

    const todayRuns = runs.filter((r) => isToday(new Date(r.started_at)));
    return {
      todayNew: todayRuns.reduce((s, r) => s + r.items_new, 0),
      todayDup: todayRuns.reduce((s, r) => s + r.items_duplicated, 0),
      todayErrors: todayRuns.reduce((s, r) => s + r.items_errored, 0),
      todayRuns: todayRuns.length,
      activeSources: sources?.filter((s) => s.is_active).length || 0,
      errorSources: sources?.filter((s) => s.error_count > 0).length || 0,
    };
  }, [runs, sources]);

  // Group runs by day for timeline
  const groupedRuns = useMemo(() => {
    if (!runs) return [];

    const groups: { label: string; date: Date; runs: typeof runs }[] = [];
    const dayMap = new Map<string, typeof runs>();

    runs.slice(0, 50).forEach((run) => {
      const date = new Date(run.started_at);
      const key = format(date, 'yyyy-MM-dd');
      if (!dayMap.has(key)) dayMap.set(key, []);
      dayMap.get(key)!.push(run);
    });

    dayMap.forEach((dayRuns, key) => {
      const date = new Date(key);
      let label = format(date, "dd 'de' MMMM", { locale: ptBR });
      if (isToday(date)) label = 'Hoje';
      else if (isYesterday(date)) label = 'Ontem';
      groups.push({ label, date, runs: dayRuns });
    });

    return groups;
  }, [runs]);

  const isLoading = runsLoading || sourcesLoading;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ok':
        return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', label: 'Sucesso' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Aviso' };
      case 'error':
        return { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Erro' };
      case 'running':
        return { icon: RefreshCw, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Executando' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: status };
    }
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Activity className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base">Monitor de Importação</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stats.activeSources} fontes ativas · {stats.todayRuns} execuções hoje
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>

      {/* Quick Stats */}
      <div className="px-6 pb-3">
        <div className="grid grid-cols-4 gap-3">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
            <Newspaper className="h-3.5 w-3.5 text-emerald-500" />
            <div>
              <p className="text-lg font-bold leading-none">{stats.todayNew}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Novas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <Copy className="h-3.5 w-3.5 text-amber-500" />
            <div>
              <p className="text-lg font-bold leading-none">{stats.todayDup}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Duplicadas</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
            <Ban className="h-3.5 w-3.5 text-red-500" />
            <div>
              <p className="text-lg font-bold leading-none">{stats.todayErrors}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Erros</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-blue-500/5 border border-blue-500/10">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
            <div>
              <p className="text-lg font-bold leading-none">{stats.todayRuns}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Execuções</p>
            </div>
          </div>
        </div>
      </div>

      <CardContent className="pt-0">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 h-9">
            <TabsTrigger value="timeline" className="text-xs">Timeline</TabsTrigger>
            <TabsTrigger value="sources" className="text-xs">Por Fonte</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="mt-3">
            <ScrollArea className="h-[400px] pr-3">
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-3 bg-muted rounded w-20" />
                      <div className="h-12 bg-muted rounded" />
                    </div>
                  ))}
                </div>
              ) : groupedRuns.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <Clock className="h-8 w-8 mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma execução registrada</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {groupedRuns.map((group) => (
                    <div key={group.label}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          {group.label}
                        </span>
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-[10px] text-muted-foreground">
                          {group.runs.length} execuções
                        </span>
                      </div>

                      <div className="relative">
                        {/* Timeline line */}
                        <div className="absolute left-[9px] top-2 bottom-2 w-px bg-border" />

                        <div className="space-y-1">
                          {group.runs.map((run) => {
                            const cfg = getStatusConfig(run.status);
                            const StatusIcon = cfg.icon;
                            const sourceName = (run.regional_sources as any)?.city || 'Desconhecida';

                            return (
                              <div
                                key={run.id}
                                className="relative flex items-start gap-3 py-1.5 pl-0 group"
                              >
                                {/* Dot */}
                                <div className={cn('relative z-10 p-0.5 rounded-full', cfg.bg)}>
                                  <StatusIcon className={cn('h-3.5 w-3.5', cfg.color, run.status === 'running' && 'animate-spin')} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <span className="text-sm font-medium truncate">{sourceName}</span>
                                      {run.items_new > 0 && (
                                        <Badge variant="outline" className="h-4 px-1 text-[10px] font-bold text-emerald-600 border-emerald-200 dark:border-emerald-800">
                                          +{run.items_new}
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                      {format(new Date(run.started_at), 'HH:mm')}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[11px] text-muted-foreground">
                                      {run.items_found} encontrados
                                    </span>
                                    {run.items_duplicated > 0 && (
                                      <span className="text-[11px] text-amber-600 dark:text-amber-400">
                                        {run.items_duplicated} dup
                                      </span>
                                    )}
                                    {run.items_errored > 0 && (
                                      <span className="text-[11px] text-red-500">
                                        {run.items_errored} erros
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Sources Tab */}
          <TabsContent value="sources" className="mt-3">
            <ScrollArea className="h-[400px] pr-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse h-16 bg-muted rounded-lg" />
                  ))}
                </div>
              ) : sourceSummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma fonte cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {sourceSummaries.map((source) => {
                    const lastCfg = source.lastRun ? getStatusConfig(source.lastRun.status) : null;

                    return (
                      <div
                        key={source.id}
                        className={cn(
                          'p-3 rounded-lg border transition-colors',
                          source.error_count > 0
                            ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20'
                            : 'border-border hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={cn(
                              'p-1.5 rounded-md',
                              source.is_active ? 'bg-emerald-500/10' : 'bg-muted'
                            )}>
                              {source.type === 'rss' ? (
                                <Rss className={cn('h-3.5 w-3.5', source.is_active ? 'text-emerald-500' : 'text-muted-foreground')} />
                              ) : (
                                <Globe className={cn('h-3.5 w-3.5', source.is_active ? 'text-emerald-500' : 'text-muted-foreground')} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-medium truncate">{source.city}</p>
                                {!source.is_active && (
                                  <Badge variant="outline" className="h-4 px-1 text-[10px]">Inativa</Badge>
                                )}
                                {source.error_count > 0 && (
                                  <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                                    {source.error_count} {source.error_count === 1 ? 'erro' : 'erros'}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-[11px] text-muted-foreground truncate">{source.name}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {source.totalNewToday > 0 && (
                              <div className="text-right">
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{source.totalNewToday}</p>
                                <p className="text-[10px] text-muted-foreground">hoje</p>
                              </div>
                            )}

                            {lastCfg && (
                              <div className="text-right">
                                <Badge variant="outline" className={cn('h-5 text-[10px]', lastCfg.color)}>
                                  {lastCfg.label}
                                </Badge>
                                <p className="text-[10px] text-muted-foreground mt-0.5">
                                  {formatDistanceToNow(new Date(source.lastRun!.started_at), { addSuffix: true, locale: ptBR })}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
