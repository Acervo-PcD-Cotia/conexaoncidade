import { Tv, Activity, Users, Film, BarChart3, Play, Square, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTvLiveStatus, useTvVods, useTvStats } from "../hooks";
import { Link } from "react-router-dom";

function StatusBadge({ state }: { state?: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    online: { variant: "default", label: "Ao Vivo" },
    offline: { variant: "secondary", label: "Offline" },
    starting: { variant: "outline", label: "Iniciando..." },
    error: { variant: "destructive", label: "Erro" },
  };
  const config = variants[state || "offline"] || variants.offline;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}

function KpiCard({ title, value, icon: Icon, isLoading }: { title: string; value: string | number; icon: React.ElementType; isLoading?: boolean }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? <Skeleton className="h-8 w-20" /> : <div className="text-2xl font-bold">{value}</div>}
      </CardContent>
    </Card>
  );
}

export default function TvOverview() {
  const { data: status, isLoading: statusLoading } = useTvLiveStatus();
  const { data: vods, isLoading: vodsLoading } = useTvVods();
  const { data: stats, isLoading: statsLoading } = useTvStats("day");

  const isLoading = statusLoading || vodsLoading || statsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="h-6 w-6" />
            TV Web
          </h1>
          <p className="text-muted-foreground">Gerencie sua TV online e VOD</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge state={status?.state} />
          <Button disabled={!status || status.state === "offline"} variant="outline">
            {status?.state === "online" ? <Square className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {status?.state === "online" ? "Encerrar" : "Iniciar Live"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Espectadores Agora" value={status?.viewersNow || 0} icon={Users} isLoading={isLoading} />
        <KpiCard title="Pico Hoje" value={status?.peakToday || 0} icon={Activity} isLoading={isLoading} />
        <KpiCard title="Vídeos VOD" value={vods?.total || 0} icon={Film} isLoading={isLoading} />
        <KpiCard title="Views Hoje" value={stats?.summary.totalViews || 0} icon={BarChart3} isLoading={isLoading} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Live (RTMP/SRT)</CardTitle>
            <CardDescription>Credenciais e status da transmissão</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/spah/painel/tv/live">Ver Credenciais</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Grade Linear</CardTitle>
            <CardDescription>Configure a programação</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/spah/painel/tv/schedule">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Biblioteca VOD</CardTitle>
            <CardDescription>Gerencie seus vídeos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/spah/painel/tv/vod">Acessar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats Preview */}
      {stats && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Estatísticas do Dia</CardTitle>
              <CardDescription>Resumo de audiência</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/spah/painel/tv/stats">Ver mais</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.summary.totalViews}</div>
                <div className="text-sm text-muted-foreground">Total de Views</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.summary.peakViewers}</div>
                <div className="text-sm text-muted-foreground">Pico</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.summary.avgWatchMinutes}min</div>
                <div className="text-sm text-muted-foreground">Sessão Média</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.summary.totalHoursWatched}h</div>
                <div className="text-sm text-muted-foreground">Horas Assistidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
