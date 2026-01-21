import { Link } from "react-router-dom";
import { Radio, Tv, Play, Calendar, Users, Plus, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveBroadcasts, useUpcomingBroadcasts, useChannels, usePrograms } from "@/hooks/useBroadcast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BroadcastDashboard() {
  const { data: liveBroadcasts, isLoading: loadingLive } = useLiveBroadcasts();
  const { data: upcomingBroadcasts, isLoading: loadingUpcoming } = useUpcomingBroadcasts(10);
  const { data: channels, isLoading: loadingChannels } = useChannels();
  const { data: programs } = usePrograms();

  const totalViewers = liveBroadcasts?.reduce((sum, b) => sum + b.viewer_count, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Conexão Ao Vivo</h1>
          <p className="text-muted-foreground">Gerencie transmissões e canais</p>
        </div>
        <Button asChild>
          <Link to="/ao-vivo">
            <Play className="w-4 h-4 mr-2" />
            Ver Ao Vivo
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ao Vivo Agora</CardTitle>
            <Radio className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveBroadcasts?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Espectadores</CardTitle>
            <Users className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViewers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Canais</CardTitle>
            <Tv className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{channels?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Programas</CardTitle>
            <Calendar className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programs?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Transmissões Ao Vivo
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLive ? (
              <Skeleton className="h-20" />
            ) : liveBroadcasts?.length ? (
              <div className="space-y-3">
                {liveBroadcasts.map((broadcast) => (
                  <div key={broadcast.id} className="flex items-center gap-4 p-3 rounded-lg border">
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      {broadcast.channel?.type === "radio" ? <Radio className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{broadcast.title}</h4>
                      <p className="text-sm text-muted-foreground">{broadcast.channel?.name}</p>
                    </div>
                    <Badge variant="destructive">LIVE</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhuma transmissão ao vivo</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Próximas Transmissões
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingUpcoming ? (
              <Skeleton className="h-20" />
            ) : upcomingBroadcasts?.length ? (
              <div className="space-y-3">
                {upcomingBroadcasts.slice(0, 5).map((broadcast) => (
                  <div key={broadcast.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{broadcast.title}</h4>
                    </div>
                    <span className="text-sm">
                      {broadcast.scheduled_start && format(new Date(broadcast.scheduled_start), "dd/MM HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Nenhuma transmissão agendada</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
