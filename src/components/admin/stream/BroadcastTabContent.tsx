import { Link } from "react-router-dom";
import { Play, Tv, Calendar, Users, Radio, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveBroadcasts, useUpcomingBroadcasts, useChannels, usePrograms } from "@/hooks/useBroadcast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export function BroadcastTabContent() {
  const { data: liveBroadcasts, isLoading: liveLoading } = useLiveBroadcasts();
  const { data: upcomingBroadcasts, isLoading: upcomingLoading } = useUpcomingBroadcasts();
  const { data: channels, isLoading: channelsLoading } = useChannels();
  const { data: programs, isLoading: programsLoading } = usePrograms();

  const isLoading = liveLoading || channelsLoading || programsLoading;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Ao Vivo Agora" 
          value={liveBroadcasts?.length || 0} 
          icon={Play} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Canais Ativos" 
          value={channels?.length || 0} 
          icon={Tv} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Programas" 
          value={programs?.length || 0} 
          icon={Calendar} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Próximas" 
          value={upcomingBroadcasts?.length || 0} 
          icon={Radio} 
          isLoading={upcomingLoading} 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Transmissão
            </CardTitle>
            <CardDescription>Criar e agendar transmissão ao vivo</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full" asChild>
              <Link to="/spah/painel/broadcast/new">Criar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Tv className="h-4 w-4" />
              Gerenciar Canais
            </CardTitle>
            <CardDescription>Configure canais de transmissão</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/spah/painel/broadcast/channels">Ver Canais</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Programação
            </CardTitle>
            <CardDescription>Gerencie programas e grades</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/spah/painel/broadcast/programs">Ver Programas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Live Now */}
      {liveBroadcasts && liveBroadcasts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Ao Vivo Agora
              </CardTitle>
              <CardDescription>Transmissões em andamento</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {liveBroadcasts.slice(0, 3).map((broadcast) => (
                <div key={broadcast.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                    <div>
                      <p className="font-medium">{broadcast.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {broadcast.program?.name || "Sem programa"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{broadcast.viewer_count || 0}</span>
                    </div>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/admin/broadcast/studio/${broadcast.id}`}>Studio</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Próximas Transmissões</CardTitle>
            <CardDescription>Agendadas para os próximos dias</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/spah/painel/broadcast/list" className="flex items-center gap-1">
              Ver todas <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {upcomingLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : upcomingBroadcasts && upcomingBroadcasts.length > 0 ? (
            <div className="space-y-3">
              {upcomingBroadcasts.slice(0, 5).map((broadcast) => (
                <div key={broadcast.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{broadcast.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {broadcast.program?.name || "Sem programa"}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">
                      {broadcast.scheduled_start 
                        ? format(new Date(broadcast.scheduled_start), "dd/MM HH:mm", { locale: ptBR })
                        : "Sem data"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma transmissão agendada</p>
              <Button size="sm" className="mt-3" asChild>
                <Link to="/spah/painel/broadcast/new">Agendar primeira</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
