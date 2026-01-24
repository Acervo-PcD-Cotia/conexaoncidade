import { Link } from "react-router-dom";
import { Tv, Users, Activity, Film, BarChart3, Play, Square, ArrowRight, Calendar, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTvLiveStatus, useTvVods, useTvStats } from "@/modules/tv/hooks";

function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  isLoading 
}: { 
  title: string; 
  value: number | string; 
  icon: React.ElementType; 
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ state }: { state?: string }) {
  if (state === "online") {
    return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
  }
  return <Badge variant="secondary">Offline</Badge>;
}

export function TvTabContent() {
  const { data: status, isLoading: statusLoading } = useTvLiveStatus();
  const { data: vods, isLoading: vodsLoading } = useTvVods();
  const { data: stats, isLoading: statsLoading } = useTvStats("day");

  const isLoading = statusLoading || vodsLoading || statsLoading;

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge state={status?.state} />
          {status?.state === "online" && (
            <span className="text-sm text-muted-foreground">
              {status.viewersNow} espectadores • {status.quality?.resolution || "HD"}
            </span>
          )}
        </div>
        <Button disabled={!status} variant="outline" size="sm">
          {status?.state === "online" ? (
            <>
              <Square className="h-4 w-4 mr-2" />
              Encerrar
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Live
            </>
          )}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Espectadores Agora" 
          value={status?.viewersNow || 0} 
          icon={Users} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Pico Hoje" 
          value={status?.peakToday || 0} 
          icon={Activity} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Vídeos VOD" 
          value={vods?.total || 0} 
          icon={Film} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Views Hoje" 
          value={stats?.summary.totalViews || 0} 
          icon={BarChart3} 
          isLoading={isLoading} 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tv className="h-4 w-4" />
              Live (RTMP/SRT)
            </CardTitle>
            <CardDescription>Credenciais e status da transmissão</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/tv/live">Ver Credenciais</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Grade Linear
            </CardTitle>
            <CardDescription>Configure a programação</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/tv/schedule">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Film className="h-4 w-4" />
              Biblioteca VOD
            </CardTitle>
            <CardDescription>Gerencie seus vídeos</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/tv/vod">Acessar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Preview */}
      {stats && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Estatísticas do Dia</CardTitle>
              <CardDescription>Resumo de audiência</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/tv/stats" className="flex items-center gap-1">
                Ver mais <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.totalViews}</div>
                <div className="text-sm text-muted-foreground">Total de Views</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.peakViewers}</div>
                <div className="text-sm text-muted-foreground">Pico</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.avgWatchMinutes}min</div>
                <div className="text-sm text-muted-foreground">Sessão Média</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.totalHoursWatched}h</div>
                <div className="text-sm text-muted-foreground">Horas Assistidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Acesso Rápido</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/tv/uploads">Upload de Vídeos</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/tv/players">Gerar Player</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/tv/settings">
                <Settings className="h-4 w-4 mr-1" />
                Configurações
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
