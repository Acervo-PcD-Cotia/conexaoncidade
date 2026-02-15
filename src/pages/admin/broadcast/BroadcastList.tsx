import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Play, Edit, Trash2, Radio, Tv, Eye, Search, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { ReplayModal } from "@/components/broadcast/ReplayModal";
import type { Broadcast } from "@/hooks/useBroadcast";

export default function BroadcastList() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [replayBroadcast, setReplayBroadcast] = useState<Broadcast | null>(null);
  const queryClient = useQueryClient();

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ["broadcasts-admin", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("broadcasts")
        .select("*, program:broadcast_programs(*), channel:broadcast_channels(*)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Broadcast[];
    },
  });

  const deleteBroadcast = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("broadcasts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["broadcasts-admin"] });
      toast.success("Transmissão excluída!");
    },
    onError: () => {
      toast.error("Erro ao excluir transmissão");
    },
  });

  const filteredBroadcasts = broadcasts?.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge variant="destructive">🔴 AO VIVO</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Agendada</Badge>;
      case "ended":
        return <Badge variant="outline">Encerrada</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="opacity-50">Cancelada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Transmissões</h1>
          <p className="text-muted-foreground">Gerencie todas as transmissões</p>
        </div>
        <Button asChild>
          <Link to="/spah/painel/broadcast/new">
            <Plus className="w-4 h-4 mr-2" />
            Nova Transmissão
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Transmissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transmissões..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="live">Ao Vivo</SelectItem>
                <SelectItem value="scheduled">Agendadas</SelectItem>
                <SelectItem value="ended">Encerradas</SelectItem>
                <SelectItem value="cancelled">Canceladas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Espectadores</TableHead>
                  <TableHead className="w-[150px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredBroadcasts?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma transmissão encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBroadcasts?.map((broadcast) => (
                    <TableRow key={broadcast.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {broadcast.channel?.type === "radio" ? (
                            <Radio className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <Tv className="w-4 h-4 text-muted-foreground" />
                          )}
                          <span className="font-medium">{broadcast.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>{broadcast.channel?.name || "-"}</TableCell>
                      <TableCell>{getStatusBadge(broadcast.status)}</TableCell>
                      <TableCell>
                        {broadcast.scheduled_start
                          ? format(new Date(broadcast.scheduled_start), "dd/MM/yyyy HH:mm", {
                              locale: ptBR,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        {broadcast.status === "live" ? (
                          <span className="flex items-center justify-end gap-1">
                            <Eye className="w-4 h-4" />
                            {broadcast.viewer_count}
                          </span>
                        ) : (
                          broadcast.total_views
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {broadcast.status === "ended" && broadcast.recording_url && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setReplayBroadcast(broadcast)}
                              title="Ver Gravação"
                            >
                              <PlayCircle className="w-4 h-4 text-primary" />
                            </Button>
                          )}
                          {broadcast.status !== "ended" && (
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/spah/painel/broadcast/studio/${broadcast.id}`}>
                                <Play className="w-4 h-4" />
                              </Link>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/spah/painel/broadcast/${broadcast.id}/edit`}>
                              <Edit className="w-4 h-4" />
                            </Link>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir transmissão?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. A transmissão será excluída permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteBroadcast.mutate(broadcast.id)}
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Replay Modal */}
      {replayBroadcast && (
        <ReplayModal
          open={!!replayBroadcast}
          onOpenChange={(open) => !open && setReplayBroadcast(null)}
          title={replayBroadcast.title}
          recordingUrl={replayBroadcast.recording_url || ""}
          thumbnailUrl={replayBroadcast.thumbnail_url}
        />
      )}
    </div>
  );
}
