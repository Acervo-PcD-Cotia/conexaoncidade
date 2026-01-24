import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Video, Tv, FolderOpen, Share2, Palette, Users, Plus, ArrowRight, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export function StudioTabContent() {
  // Fetch studios
  const { data: studios, isLoading: studiosLoading } = useQuery({
    queryKey: ["illumina-studios-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("illumina_studios")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch active sessions
  const { data: activeSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["illumina-sessions-active"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("illumina_sessions")
        .select("*, studio:illumina_studios(*)")
        .eq("status", "live")
        .order("started_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch destinations
  const { data: destinations, isLoading: destLoading } = useQuery({
    queryKey: ["illumina-destinations-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("illumina_destinations")
        .select("*", { count: "exact", head: true })
        .eq("is_enabled", true);
      if (error) throw error;
      return count || 0;
    },
  });

  const isLoading = studiosLoading || sessionsLoading || destLoading;

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Estúdios" 
          value={studios?.length || 0} 
          icon={Tv} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Sessões Ativas" 
          value={activeSessions?.length || 0} 
          icon={Play} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Destinos" 
          value={destinations || 0} 
          icon={Share2} 
          isLoading={isLoading} 
        />
        <KpiCard 
          title="Gravações" 
          value="-" 
          icon={Video} 
          isLoading={false} 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Estúdio
            </CardTitle>
            <CardDescription>Criar sala de produção permanente</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button className="w-full" asChild>
              <Link to="/admin/conexao-studio/studios/new">Criar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Destinos
            </CardTitle>
            <CardDescription>Configure multistreaming</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/conexao-studio/destinations">Configurar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </CardTitle>
            <CardDescription>Overlays, logos e lower-thirds</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/admin/conexao-studio/branding">Personalizar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Active Sessions */}
      {activeSessions && activeSessions.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Sessões Ativas
              </CardTitle>
              <CardDescription>Estúdios em transmissão</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.slice(0, 3).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
                    <div>
                      <p className="font-medium">{session.title || session.studio?.name || "Sessão"}</p>
                      <p className="text-sm text-muted-foreground">
                        Iniciou {session.actual_start_at 
                          ? format(new Date(session.actual_start_at), "HH:mm", { locale: ptBR })
                          : "-"}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/admin/conexao-studio/studios/${session.studio?.slug}/session`}>
                      Entrar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Studios List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Estúdios</CardTitle>
            <CardDescription>Salas de produção disponíveis</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/conexao-studio/studios" className="flex items-center gap-1">
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {studiosLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : studios && studios.length > 0 ? (
            <div className="space-y-3">
              {studios.slice(0, 5).map((studio) => (
                <div key={studio.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tv className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{studio.name}</p>
                      <p className="text-sm text-muted-foreground">
                        /{studio.slug}
                      </p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/admin/conexao-studio/studios/${studio.slug}/session`}>
                      Entrar
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Tv className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum estúdio criado</p>
              <Button size="sm" className="mt-3" asChild>
                <Link to="/admin/conexao-studio/studios/new">Criar primeiro</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
