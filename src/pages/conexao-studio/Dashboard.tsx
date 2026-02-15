import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Video,
  Plus,
  DoorOpen,
  Presentation,
  Share2,
  Palette,
  Users,
  FolderOpen,
  Clock,
  HardDrive,
  ArrowRight,
  Tv,
  Radio,
  Play,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ConexaoStudioDashboard() {
  const { user } = useAuth();

  // Fetch user's teams
  const { data: teams } = useQuery({
    queryKey: ["conexao-studio-teams", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("illumina_team_members")
        .select(`
          role,
          illumina_teams (
            id,
            name,
            plan,
            storage_used_mb,
            storage_limit_mb
          )
        `)
        .eq("user_id", user.id)
        .eq("status", "active");
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch recent recordings
  const { data: recentRecordings } = useQuery({
    queryKey: ["conexao-studio-recent-recordings", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("illumina_recordings")
        .select(`
          *,
          illumina_sessions (
            title,
            illumina_studios (name)
          )
        `)
        .order("created_at", { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch upcoming webinars
  const { data: upcomingWebinars } = useQuery({
    queryKey: ["conexao-studio-upcoming-webinars", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("illumina_webinars")
        .select("*")
        .gte("scheduled_start_at", new Date().toISOString())
        .order("scheduled_start_at", { ascending: true })
        .limit(3);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch system status
  const { data: systemStatus } = useQuery({
    queryKey: ["conexao-studio-system-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("illumina_system_status")
        .select("*");
      
      if (error) throw error;
      return data || [];
    },
  });

  const primaryTeam = teams?.[0]?.illumina_teams as any;
  const storagePercent = primaryTeam
    ? ((primaryTeam.storage_used_mb || 0) / (primaryTeam.storage_limit_mb || 1)) * 100
    : 0;

  const formatBytes = (mb: number) => {
    if (mb === 0) return "0 GB";
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(0)} MB`;
  };

  const quickActions = [
    {
      title: "Criar Estúdio",
      description: "Novo estúdio com link permanente",
      icon: Plus,
      href: "/spah/painel/conexao-studio/studios/new",
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      title: "Entrar em Estúdio",
      description: "Acessar estúdio existente",
      icon: DoorOpen,
      href: "/spah/painel/conexao-studio/studios",
      color: "bg-green-500/10 text-green-600 dark:text-green-400",
    },
    {
      title: "Criar Webinário",
      description: "Evento ao vivo ou sob demanda",
      icon: Presentation,
      href: "/spah/painel/conexao-studio/webinars/new",
      color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    },
    {
      title: "Gerenciar Destinos",
      description: "YouTube, Facebook, RTMP...",
      icon: Share2,
      href: "/spah/painel/conexao-studio/destinations",
      color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    },
    {
      title: "Painel de Branding",
      description: "Logos, overlays, letreiros",
      icon: Palette,
      href: "/spah/painel/conexao-studio/branding",
      color: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
    },
    {
      title: "Gerenciar Equipe",
      description: "Membros e permissões",
      icon: Users,
      href: "/spah/painel/conexao-studio/team",
      color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-primary/20">
                <Video className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Conexão Studio</h1>
            </div>
            <p className="text-muted-foreground max-w-lg">
              Sua plataforma profissional de transmissão ao vivo. Crie estúdios, 
              transmita para múltiplas plataformas e gerencie webinários.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/spah/painel/conexao-studio/studios/new">
                <Plus className="h-5 w-5" />
                Novo Estúdio
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/spah/painel/conexao-studio/library">
                <FolderOpen className="h-5 w-5" />
                Biblioteca
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} to={action.href}>
              <Card className="h-full hover:shadow-lg transition-all hover:border-primary/50 cursor-pointer group">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${action.color}`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Recordings */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5" />
                  Últimas Gravações
                </CardTitle>
                <CardDescription>Suas gravações mais recentes</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/spah/painel/conexao-studio/library">Ver todas</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {recentRecordings && recentRecordings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {recentRecordings.map((recording) => (
                    <Link 
                      key={recording.id} 
                      to={`/spah/painel/conexao-studio/library/${recording.id}`}
                      className="group"
                    >
                      <div className="aspect-video rounded-lg bg-muted relative overflow-hidden">
                        {recording.thumbnail_url ? (
                          <img
                            src={recording.thumbnail_url}
                            alt={recording.title || "Gravação"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <Video className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                          {recording.duration_seconds 
                            ? `${Math.floor(recording.duration_seconds / 60)}:${String(recording.duration_seconds % 60).padStart(2, '0')}`
                            : "--:--"
                          }
                        </div>
                      </div>
                      <p className="mt-2 text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {recording.title || "Sem título"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(recording.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma gravação ainda</p>
                  <p className="text-sm">Suas gravações aparecerão aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Storage Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HardDrive className="h-4 w-4" />
                Armazenamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={storagePercent} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {formatBytes(primaryTeam?.storage_used_mb || 0)} usados
                  </span>
                  <span className="font-medium">
                    {formatBytes(primaryTeam?.storage_limit_mb || 5120)}
                  </span>
                </div>
                {primaryTeam?.plan && (
                  <Badge variant="outline" className="capitalize">
                    Plano {primaryTeam.plan}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Webinars */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Presentation className="h-4 w-4" />
                Próximos Webinários
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingWebinars && upcomingWebinars.length > 0 ? (
                <div className="space-y-3">
                  {upcomingWebinars.map((webinar: any) => (
                    <Link 
                      key={webinar.id} 
                      to={`/spah/painel/conexao-studio/webinars/${webinar.id}`}
                      className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <p className="font-medium text-sm truncate">{webinar.title}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(webinar.scheduled_start_at), "dd/MM 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  <p>Nenhum webinário agendado</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Radio className="h-4 w-4" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemStatus?.map((status: any) => (
                  <div key={status.id} className="flex items-center justify-between">
                    <span className="text-sm">{status.component}</span>
                    <Badge 
                      variant={status.status === "operational" ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {status.status === "operational" ? "OK" : status.status}
                    </Badge>
                  </div>
                ))}
                {(!systemStatus || systemStatus.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    Todos os sistemas operacionais
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
