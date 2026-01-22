import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Presentation,
  Plus,
  Calendar,
  Users,
  Play,
  Clock,
  MoreVertical,
  Pencil,
  Trash2,
  Copy,
  ExternalLink,
  Video,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format, isPast, isFuture } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Webinars() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: webinars, isLoading } = useQuery({
    queryKey: ["conexao-studio-webinars", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("illumina_webinars")
        .select(`
          *,
          illumina_webinar_registrations (count)
        `)
        .order("scheduled_start_at", { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const upcomingWebinars = webinars?.filter((w) => 
    w.scheduled_start_at && isFuture(new Date(w.scheduled_start_at))
  );
  
  const pastWebinars = webinars?.filter((w) => 
    w.scheduled_start_at && isPast(new Date(w.scheduled_start_at))
  );

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/webinar/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const WebinarCard = ({ webinar }: { webinar: any }) => {
    const isLive = webinar.status === "live";
    const isPastEvent = webinar.scheduled_start_at && isPast(new Date(webinar.scheduled_start_at));
    const registrationCount = webinar.illumina_webinar_registrations?.[0]?.count || 0;

    return (
      <Card className="group hover:shadow-lg transition-all">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                {webinar.thumbnail_url ? (
                  <img
                    src={webinar.thumbnail_url}
                    alt={webinar.title}
                    className="h-full w-full object-cover rounded-xl"
                  />
                ) : (
                  <Presentation className="h-6 w-6 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base truncate">{webinar.title}</CardTitle>
                <CardDescription className="text-xs">
                  /{webinar.slug}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/admin/conexao-studio/webinars/${webinar.id}/edit`}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyLink(webinar.slug)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Link
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href={`/webinar/${webinar.slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Página
                  </a>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {webinar.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {webinar.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {isLive ? (
                <Badge variant="destructive" className="gap-1">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  AO VIVO
                </Badge>
              ) : isPastEvent ? (
                <Badge variant="secondary">Encerrado</Badge>
              ) : (
                <Badge variant="outline">Agendado</Badge>
              )}
              
              <Badge variant="outline" className="gap-1 capitalize">
                {webinar.webinar_type === "live" ? "Ao Vivo" : "Sob Demanda"}
              </Badge>
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {webinar.scheduled_start_at && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(webinar.scheduled_start_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {registrationCount} inscritos
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              {!isPastEvent && (
                <Button asChild className="flex-1" size="sm">
                  <Link to={`/admin/conexao-studio/webinars/${webinar.id}/studio`}>
                    <Play className="h-4 w-4 mr-1" />
                    Iniciar
                  </Link>
                </Button>
              )}
              {isPastEvent && webinar.recording_url && (
                <Button asChild className="flex-1" size="sm" variant="outline">
                  <Link to={`/admin/conexao-studio/webinars/${webinar.id}`}>
                    <Video className="h-4 w-4 mr-1" />
                    Ver Gravação
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(webinar.slug)}
                className="gap-1"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Presentation className="h-6 w-6" />
            Webinários
          </h1>
          <p className="text-muted-foreground">
            Crie e gerencie webinários ao vivo ou sob demanda
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/conexao-studio/webinars/new">
            <Plus className="h-4 w-4" />
            Novo Webinário
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar webinários..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming" className="gap-2">
            <Calendar className="h-4 w-4" />
            Próximos
            {upcomingWebinars && upcomingWebinars.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {upcomingWebinars.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="h-4 w-4" />
            Realizados
            {pastWebinars && pastWebinars.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pastWebinars.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-12 bg-muted rounded-lg mb-4" />
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingWebinars && upcomingWebinars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingWebinars
                .filter((w) => w.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((webinar) => (
                  <WebinarCard key={webinar.id} webinar={webinar} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum webinário agendado</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                  Crie seu primeiro webinário para alcançar sua audiência.
                </p>
                <Button asChild className="gap-2">
                  <Link to="/admin/conexao-studio/webinars/new">
                    <Plus className="h-4 w-4" />
                    Criar Webinário
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          {pastWebinars && pastWebinars.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastWebinars
                .filter((w) => w.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((webinar) => (
                  <WebinarCard key={webinar.id} webinar={webinar} />
                ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <Eye className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum webinário realizado</h3>
                <p className="text-muted-foreground max-w-sm">
                  Webinários passados aparecerão aqui com suas gravações.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
