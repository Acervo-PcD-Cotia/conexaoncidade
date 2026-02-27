import { useState } from "react";
import { Mic, Settings, RefreshCw, Loader2, Search, Plus, Youtube, Upload as UploadIcon, Cloud } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePodcasts, PodcastNews } from "@/hooks/usePodcasts";
import { PodcastActionsMenu } from "@/components/admin/podcasts/PodcastActionsMenu";
import { PodcastLogsDialog } from "@/components/admin/podcasts/PodcastLogsDialog";
import { PodcastSettingsDialog } from "@/components/admin/podcasts/PodcastSettingsDialog";
import { PodcastAddDialog } from "@/components/admin/podcasts/PodcastAddDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { NavLink } from "@/components/NavLink";

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

function getStatusBadge(status: string | null) {
  switch (status) {
    case "published":
      return <Badge className="bg-green-600">🟢 Publicado</Badge>;
    case "generating":
      return <Badge className="bg-yellow-600">🟡 Gerando</Badge>;
    case "error":
      return <Badge variant="destructive">🔴 Erro</Badge>;
    case "ready":
      return <Badge className="bg-blue-600">🔵 Pronto</Badge>;
    default:
      return <Badge variant="outline">⚪ Não gerado</Badge>;
  }
}

function getMediaTypeBadge(mediaType: string | null) {
  switch (mediaType) {
    case "upload":
      return <span title="Upload"><UploadIcon className="h-3.5 w-3.5 text-muted-foreground" /></span>;
    case "youtube":
      return <span title="YouTube"><Youtube className="h-3.5 w-3.5 text-red-500" /></span>;
    case "google_drive":
      return <span title="Google Drive"><Cloud className="h-3.5 w-3.5 text-blue-500" /></span>;
    case "tts":
      return <span title="Narração IA"><Mic className="h-3.5 w-3.5 text-primary" /></span>;
    default:
      return null;
  }
}

export default function PodcastsList() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [logsNewsId, setLogsNewsId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addDialogState, setAddDialogState] = useState<{ open: boolean; newsId: string; newsTitle: string }>({
    open: false,
    newsId: "",
    newsTitle: "",
  });

  const { data: podcasts, isLoading, refetch } = usePodcasts(100);

  const filteredPodcasts = podcasts?.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || p.podcast_status === statusFilter || (statusFilter === "not_generated" && !p.podcast_status);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <Mic className="h-8 w-8" />
            Podcasts
          </h1>
          <p className="text-muted-foreground">
            Gerencie os episódios de podcast das notícias
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="not_generated">Não gerado</SelectItem>
                <SelectItem value="generating">Gerando</SelectItem>
                <SelectItem value="ready">Pronto</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredPodcasts?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum podcast encontrado
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPodcasts?.map((podcast) => (
                    <TableRow key={podcast.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {podcast.published_at
                          ? format(new Date(podcast.published_at), "dd/MM/yy", { locale: ptBR })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <NavLink
                          to={`/spah/painel/news/${podcast.id}/edit`}
                          className="hover:underline font-medium"
                        >
                          {podcast.title.length > 60
                            ? podcast.title.slice(0, 60) + "..."
                            : podcast.title}
                        </NavLink>
                      </TableCell>
                      <TableCell>
                        {podcast.category && (
                          <Badge
                            variant="outline"
                            style={{ borderColor: podcast.category.color }}
                          >
                            {podcast.category.name}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getMediaTypeBadge(podcast.podcast_media_type)}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(podcast.podcast_status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatDuration(podcast.audio_duration_seconds)}
                      </TableCell>
                      <TableCell>
                        <PodcastActionsMenu
                          podcast={podcast}
                          onViewLogs={() => setLogsNewsId(podcast.id)}
                          onAddPodcast={() =>
                            setAddDialogState({
                              open: true,
                              newsId: podcast.id,
                              newsTitle: podcast.title,
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PodcastLogsDialog newsId={logsNewsId} onClose={() => setLogsNewsId(null)} />
      <PodcastSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <PodcastAddDialog
        open={addDialogState.open}
        onOpenChange={(o) => setAddDialogState((s) => ({ ...s, open: o }))}
        newsId={addDialogState.newsId}
        newsTitle={addDialogState.newsTitle}
      />
    </div>
  );
}
