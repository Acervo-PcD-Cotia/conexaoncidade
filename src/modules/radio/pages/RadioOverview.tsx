import { Radio, Activity, Users, Music, BarChart3, Play, Pause, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRadioStatus, useRadioPlaylists, useRadioStats } from "../hooks";
import { Link } from "react-router-dom";

function StatusBadge({ state }: { state?: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    online: { variant: "default", label: "Online" },
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

export default function RadioOverview() {
  const { data: status, isLoading: statusLoading } = useRadioStatus();
  const { data: playlists, isLoading: playlistsLoading } = useRadioPlaylists();
  const { data: stats, isLoading: statsLoading } = useRadioStats("day");

  const isLoading = statusLoading || playlistsLoading || statsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-6 w-6" />
            Rádio Web
          </h1>
          <p className="text-muted-foreground">Gerencie sua estação de rádio online</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge state={status?.state} />
          <Button disabled={!status || status.state === "offline"} variant="outline">
            {status?.state === "online" ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {status?.state === "online" ? "Pausar" : "Iniciar"}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard title="Ouvintes Agora" value={status?.listenersNow || 0} icon={Users} isLoading={isLoading} />
        <KpiCard title="Pico Hoje" value={status?.peakToday || 0} icon={Activity} isLoading={isLoading} />
        <KpiCard title="Bitrate" value={`${status?.bitrateKbps || 0} kbps`} icon={Radio} isLoading={isLoading} />
        <KpiCard title="Playlists" value={playlists?.length || 0} icon={Music} isLoading={isLoading} />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Status do Stream</CardTitle>
            <CardDescription>Monitore a transmissão em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/radio/status">Ver Status</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">AutoDJ</CardTitle>
            <CardDescription>Configure playlists e agendamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/radio/autodj">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Biblioteca</CardTitle>
            <CardDescription>Gerencie suas músicas</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/radio/library">Acessar</Link>
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
              <Link to="/admin/radio/stats">Ver mais</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.summary.totalListeners}</div>
                <div className="text-sm text-muted-foreground">Total de Ouvintes</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.summary.peakListeners}</div>
                <div className="text-sm text-muted-foreground">Pico</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.summary.avgSessionMinutes}min</div>
                <div className="text-sm text-muted-foreground">Sessão Média</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.summary.totalHoursStreamed}h</div>
                <div className="text-sm text-muted-foreground">Horas Transmitidas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
