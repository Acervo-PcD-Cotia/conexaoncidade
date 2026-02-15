import { Link } from "react-router-dom";
import { Tv, Users, Activity, Film, BarChart3, Play, Square, ArrowRight, Calendar, Settings, ExternalLink, RefreshCw, Sliders } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useTvStatus } from "@/hooks/useStreamingStatus";

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

export function TvTabContent() {
  const { status, config, isLoading, isConfigured, lastUpdated, refetch } = useTvStatus();

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <StatusBadge isOnline={status?.isOnline} />
          {status?.isOnline && (
            <span className="text-sm text-muted-foreground">
              {status.viewers} espectadores
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
              <Square className="h-4 w-4 mr-2" />
              Ao Vivo
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
          title="Espectadores Agora" 
          value={status?.viewers || 0} 
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
          title="Limite Espectadores" 
          value={status?.plan?.viewersLimit || "-"} 
          icon={BarChart3} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Bitrate" 
          value={status?.plan?.bitrate || "-"} 
          icon={Tv} 
          isLoading={isLoading} 
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/spah/painel/streaming/tv">
            <Sliders className="h-4 w-4 mr-2" />
            Configurar TV
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

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tv className="h-4 w-4" />
              Status da TV
            </CardTitle>
            <CardDescription>Monitore a transmissão em tempo real</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/spah/painel/streaming/tv">Ver Configuração</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Film className="h-4 w-4" />
              Player Público
            </CardTitle>
            <CardDescription>Acesse a página pública do player</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/tv" target="_blank">
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
              <Link to="/spah/painel/streaming/tv">Acessar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Plan Info */}
      {status?.plan && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informações do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{status.plan.viewersLimit}</div>
                <div className="text-sm text-muted-foreground">Limite Espectadores</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{status.plan.ftpLimit}</div>
                <div className="text-sm text-muted-foreground">Limite FTP</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-lg font-bold">{status.plan.bitrate}</div>
                <div className="text-sm text-muted-foreground">Bitrate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-xs text-muted-foreground text-right">
          Última atualização: {lastUpdated.toLocaleTimeString('pt-BR')}
        </p>
      )}
    </div>
  );
}
