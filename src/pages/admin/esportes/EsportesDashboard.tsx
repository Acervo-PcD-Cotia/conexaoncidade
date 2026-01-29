import { Trophy, Calendar, Users, Award, Settings, ArrowRight, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientKpiCard } from "@/components/admin/dashboard/GradientKpiCard";
import { useTodayMatches, useLiveMatches, useCompetitions, useSyncFootballData } from "@/hooks/useFootball";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchCard } from "@/components/esportes/MatchCard";
import { useToast } from "@/hooks/use-toast";

export default function EsportesDashboard() {
  const { toast } = useToast();
  const { data: todayMatches, isLoading: loadingToday } = useTodayMatches();
  const { data: liveMatches } = useLiveMatches();
  const { data: competitions } = useCompetitions();
  const syncMutation = useSyncFootballData();

  // Get real counts
  const { data: teamsCount } = useQuery({
    queryKey: ["football", "teams-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("football_teams")
        .select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: weekMatches } = useQuery({
    queryKey: ["football", "week-matches"],
    queryFn: async () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { count } = await supabase
        .from("football_matches")
        .select("*", { count: "exact", head: true })
        .gte("match_date", weekAgo.toISOString())
        .lte("match_date", today.toISOString());
      
      return count || 0;
    },
  });

  const handleQuickSync = async () => {
    try {
      await syncMutation.mutateAsync();
      toast({
        title: "Sincronização concluída!",
        description: "Dados do Brasileirão atualizados com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const upcomingMatches = todayMatches?.filter(m => 
    m.status === "NS" || m.status === "TBD"
  ).slice(0, 4);

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Esportes
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe resultados, jogos e estatísticas esportivas
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleQuickSync}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            {syncMutation.isPending ? 'Sincronizando...' : 'Sincronizar'}
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/esportes/configurar">
              <Settings className="h-4 w-4 mr-2" />
              Configurar Módulo
            </Link>
          </Button>
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientKpiCard 
          title="Jogos Hoje" 
          value={todayMatches?.length || 0} 
          icon={Calendar} 
          gradient="blue"
          subtitle={liveMatches?.length ? `${liveMatches.length} ao vivo` : "Nenhum ao vivo"}
        />
        <GradientKpiCard 
          title="Partidas Semana" 
          value={weekMatches || 0} 
          icon={Trophy} 
          gradient="green"
          subtitle="Últimos 7 dias"
        />
        <GradientKpiCard 
          title="Times Cadastrados" 
          value={teamsCount || 0} 
          icon={Users} 
          gradient="orange"
        />
        <GradientKpiCard 
          title="Competições" 
          value={competitions?.length || 0} 
          icon={Award} 
          gradient="purple"
          subtitle="Série A e B"
        />
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Brasileirão
            </CardTitle>
            <CardDescription>
              Campeonato Brasileiro Série A e B
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Série A</p>
                <p className="text-sm text-muted-foreground">20 times • Temporada 2025</p>
              </div>
              <Button asChild size="sm">
                <Link to="/admin/esportes/brasileirao?serie=a">
                  Ver <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Série B</p>
                <p className="text-sm text-muted-foreground">20 times • Temporada 2025</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/esportes/brasileirao?serie=b">
                  Ver <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Partidas
            </CardTitle>
            <CardDescription>
              Jogos agendados para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingToday ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : upcomingMatches && upcomingMatches.length > 0 ? (
              <div className="space-y-3">
                {upcomingMatches.map((match) => (
                  <MatchCard key={match.id} match={match} compact />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Trophy className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground">Nenhuma partida agendada</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {teamsCount === 0 
                    ? "Configure o módulo para sincronizar partidas automaticamente"
                    : "Não há jogos programados para hoje"}
                </p>
                {teamsCount === 0 && (
                  <Button asChild className="mt-4">
                    <Link to="/admin/esportes/configurar">
                      Configurar Agora
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Matches */}
      {liveMatches && liveMatches.length > 0 && (
        <Card className="border-green-500/50 bg-green-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Jogos Ao Vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <MatchCard key={match.id} match={match} showLiveIndicator />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Estatísticas do Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{teamsCount || 0}</p>
              <p className="text-sm text-muted-foreground">Times Cadastrados</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{weekMatches || 0}</p>
              <p className="text-sm text-muted-foreground">Jogos na Semana</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{liveMatches?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Ao Vivo Agora</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground text-green-500">●</p>
              <p className="text-sm text-muted-foreground">API Online</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}