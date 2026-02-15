import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  FolderOpen,
  Video,
  Download,
  Scissors,
  MoreVertical,
  Trash2,
  Pencil,
  Play,
  Clock,
  HardDrive,
  Filter,
  Search,
  Grid,
  List,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Library() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterType, setFilterType] = useState<string>("all");

  const { data: recordings, isLoading } = useQuery({
    queryKey: ["conexao-studio-library", user?.id],
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
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredRecordings = recordings?.filter((rec) => {
    const matchesSearch = rec.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.illumina_sessions?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || rec.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatBytes = (bytes: number | null) => {
    if (!bytes) return "0 MB";
    const mb = bytes / (1024 * 1024);
    if (mb > 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(0)} MB`;
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins >= 60) {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      return `${hours}:${String(remainingMins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="h-6 w-6" />
            Biblioteca
          </h1>
          <p className="text-muted-foreground">
            Todas as suas gravações e clipes
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar gravações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="cloud">Cloud</SelectItem>
            <SelectItem value="local">Local</SelectItem>
            <SelectItem value="separate">Trilhas Separadas</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          : "space-y-2"
        }>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="aspect-video bg-muted rounded-lg mb-3" />
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredRecordings && filteredRecordings.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredRecordings.map((recording) => (
              <Card key={recording.id} className="group hover:shadow-lg transition-all overflow-hidden">
                <div className="relative aspect-video bg-muted">
                  {recording.thumbnail_url ? (
                    <img
                      src={recording.thumbnail_url}
                      alt={recording.title || "Gravação"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                      <Video className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/spah/painel/conexao-studio/library/${recording.id}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Assistir
                      </Link>
                    </Button>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {formatDuration(recording.duration_seconds)}
                  </div>

                  {/* Type badge */}
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-xs capitalize">
                      {recording.type || "main"}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {recording.title || "Sem título"}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {recording.illumina_sessions?.illumina_studios?.name || "Estúdio"}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/spah/painel/conexao-studio/library/${recording.id}/clip`}>
                            <Scissors className="h-4 w-4 mr-2" />
                            Criar Clipe
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Renomear
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(recording.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {formatBytes(recording.size_bytes)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecordings.map((recording) => (
              <Card key={recording.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="relative w-32 aspect-video bg-muted rounded-lg overflow-hidden shrink-0">
                    {recording.thumbnail_url ? (
                      <img
                        src={recording.thumbnail_url}
                        alt={recording.title || "Gravação"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Video className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {formatDuration(recording.duration_seconds)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">
                      {recording.title || "Sem título"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {recording.illumina_sessions?.illumina_studios?.name || "Estúdio"} • 
                      {format(new Date(recording.created_at), " dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {recording.type || "main"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatBytes(recording.size_bytes)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" asChild>
                      <Link to={`/spah/painel/conexao-studio/library/${recording.id}`}>
                        <Play className="h-4 w-4 mr-1" />
                        Assistir
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/spah/painel/conexao-studio/library/${recording.id}/clip`}>
                            <Scissors className="h-4 w-4 mr-2" />
                            Criar Clipe
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Biblioteca vazia</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Suas gravações aparecerão aqui após você iniciar uma transmissão ou gravação no estúdio.
            </p>
            <Button asChild className="gap-2">
              <Link to="/spah/painel/conexao-studio/studios">
                <Video className="h-4 w-4" />
                Ir para Estúdios
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
