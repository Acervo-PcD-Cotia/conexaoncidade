import { Link } from "react-router-dom";
import { Radio, Users, Activity, Music, Play, Pause, ArrowRight, Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRadioStatus, useRadioPlaylists, useRadioStats } from "@/modules/radio/hooks";

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

export function RadioTabContent() {
  const { data: status, isLoading: statusLoading } = useRadioStatus();
  const { data: playlists, isLoading: playlistsLoading } = useRadioPlaylists();
  const { data: stats, isLoading: statsLoading } = useRadioStats("day");

  const isLoading = statusLoading || playlistsLoading || statsLoading;

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <StatusBadge state={status?.state} />
        {status?.state === "online" && (
          <span className="text-sm text-muted-foreground">
            {status.bitrateKbps} kbps • {status.listenersNow} ouvintes
          </span>
        )}
      </div>
      <Button disabled={!status} variant="outline" size="sm">
          {status?.state === "online" ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Iniciar
            </>
          )}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Ouvintes Agora" 
          value={status?.listenersNow || 0} 
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
          title="Bitrate" 
          value={`${status?.bitrateKbps || 0} kbps`} 
          icon={Radio} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Playlists" 
          value={playlists?.length || 0} 
          icon={Music} 
          isLoading={isLoading} 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Status do Stream
            </CardTitle>
            <CardDescription>Monitore a transmissão em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/radio/status">Ver Status</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-4 w-4" />
              AutoDJ
            </CardTitle>
            <CardDescription>Configure playlists e agendamentos</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/radio/autodj">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </CardTitle>
            <CardDescription>Nome da rádio, encoder e mais</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/radio/settings">Acessar</Link>
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
              <Link to="/admin/radio/stats" className="flex items-center gap-1">
                Ver mais <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.totalListeners}</div>
                <div className="text-sm text-muted-foreground">Total de Ouvintes</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.peakListeners}</div>
                <div className="text-sm text-muted-foreground">Pico</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.avgSessionMinutes}min</div>
                <div className="text-sm text-muted-foreground">Sessão Média</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{stats.summary.totalHoursStreamed}h</div>
                <div className="text-sm text-muted-foreground">Horas Streamadas</div>
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
              <Link to="/admin/radio/library">Biblioteca de Músicas</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/radio/encoder">Encoder / Chaves</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/radio/players">Gerar Player</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
