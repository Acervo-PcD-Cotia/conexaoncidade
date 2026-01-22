import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Video,
  Plus,
  Tv,
  Copy,
  ExternalLink,
  MoreVertical,
  Pencil,
  Trash2,
  Users,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function StudioList() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: studios, isLoading } = useQuery({
    queryKey: ["conexao-studios", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("illumina_studios")
        .select(`
          *,
          illumina_teams (name, slug),
          illumina_sessions (id, status, started_at)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredStudios = studios?.filter((studio) =>
    studio.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/conexao-studio/studio/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const getActiveSession = (sessions: any[]) => {
    return sessions?.find((s) => s.status === "live" || s.status === "recording");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tv className="h-6 w-6" />
            Estúdios
          </h1>
          <p className="text-muted-foreground">
            Gerencie seus estúdios de transmissão
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link to="/admin/conexao-studio/studios/new">
            <Plus className="h-4 w-4" />
            Novo Estúdio
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar estúdios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded-lg mb-4" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredStudios && filteredStudios.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudios.map((studio) => {
            const activeSession = getActiveSession(studio.illumina_sessions || []);
            
            return (
              <Card key={studio.id} className="group hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        {studio.cover_image_url ? (
                          <img
                            src={studio.cover_image_url}
                            alt={studio.name}
                            className="h-full w-full object-cover rounded-xl"
                          />
                        ) : (
                          <Video className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-base">{studio.name}</CardTitle>
                        <CardDescription className="text-xs">
                          /{studio.slug}
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
                          <Link to={`/admin/conexao-studio/studios/${studio.id}/edit`}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyLink(studio.slug)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Link
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
                    {studio.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {studio.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      {activeSession ? (
                        <Badge variant="destructive" className="gap-1">
                          <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          {activeSession.status === "live" ? "AO VIVO" : "GRAVANDO"}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Offline</Badge>
                      )}
                      
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        {studio.max_participants || 10} participantes
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Criado em {format(new Date(studio.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Button asChild className="flex-1" size="sm">
                        <Link to={`/admin/conexao-studio/studio/${studio.slug}/session`}>
                          Entrar no Estúdio
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(studio.slug)}
                        className="gap-1"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Video className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum estúdio ainda</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Crie seu primeiro estúdio para começar a transmitir ao vivo para 
              múltiplas plataformas simultaneamente.
            </p>
            <Button asChild className="gap-2">
              <Link to="/admin/conexao-studio/studios/new">
                <Plus className="h-4 w-4" />
                Criar Estúdio
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
