import { Link } from "react-router-dom";
import { Radio, Users, Activity, Music, Play, Pause, ArrowRight, Settings, ExternalLink, RefreshCw, Sliders } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useRadioStatus } from "@/hooks/useStreamingStatus";

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

function StatusBadge({ isOnline }: { isOnline?: boolean }) {
  if (isOnline) {
    return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
  }
  return <Badge variant="secondary">Offline</Badge>;
}

export function RadioTabContent() {
  const { status, config, isLoading, isConfigured, lastUpdated, refetch } = useRadioStatus();

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge isOnline={status?.isOnline} />
          {status?.isOnline && (
            <span className="text-sm text-muted-foreground">
              {status.listeners} ouvintes
              {status.nowPlaying?.song && ` • ${status.nowPlaying.song}`}
            </span>
          )}
          {!isConfigured && !isLoading && (
            <span className="text-sm text-amber-600">Não configurado</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          {status?.isOnline ? (
            <Button disabled variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Em exibição
            </Button>
          ) : (
            <Button disabled variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Offline
            </Button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Ouvintes Agora" 
          value={status?.listeners || 0} 
          icon={Users} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Status" 
          value={status?.isOnline ? "Online" : "Offline"} 
          icon={Activity} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Tocando Agora" 
          value={status?.nowPlaying?.track?.substring(0, 20) || "-"} 
          icon={Music} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Gênero" 
          value={status?.nowPlaying?.genre || "-"} 
          icon={Radio} 
          isLoading={isLoading} 
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/spah/painel/streaming/radio">
            <Sliders className="h-4 w-4 mr-2" />
            Configurar Rádio
          </Link>
        </Button>
        
        {config?.external_panel_url && (
          <Button variant="outline" asChild>
            <a href={config.external_panel_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Painel Profissional
            </a>
          </Button>
        )}
      </div>

      {/* Now Playing Card */}
      {status?.nowPlaying && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-4 w-4" />
              Tocando Agora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {status.nowPlaying.coverUrl && (
                <img 
                  src={status.nowPlaying.coverUrl} 
                  alt="Album cover" 
                  className="h-16 w-16 rounded-lg object-cover"
                />
              )}
              <div>
                <p className="font-medium">{status.nowPlaying.track}</p>
                {status.nowPlaying.artist && (
                  <p className="text-sm text-muted-foreground">{status.nowPlaying.artist}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
              <Link to="/spah/painel/streaming/radio">Ver Configuração</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Music className="h-4 w-4" />
              Player Público
            </CardTitle>
            <CardDescription>Acesse a página pública do player</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/radio" target="_blank">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir Player
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </CardTitle>
            <CardDescription>API, embed e integração</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/spah/painel/streaming/radio">Acessar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground text-right">
          Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
        </p>
      )}
    </div>
  );
}
