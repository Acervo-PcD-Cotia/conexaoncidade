import { useState } from "react";
import { Music2, Play, SkipForward, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PlaylistCard, CreatePlaylistDialog, EditPlaylistDialog } from "../components";
import { useRadioAutoDJ, useToggleRadioAutoDJ } from "../hooks/useRadioAutoDJ";
import { 
  useRadioPlaylists, 
  useCreateRadioPlaylist, 
  useUpdateRadioPlaylist, 
  useDeleteRadioPlaylist 
} from "../hooks/useRadioPlaylists";
import { RadioPlaylist } from "../types";
import { toast } from "sonner";

export default function RadioAutoDJ() {
  const { data: autoDJ, isLoading: loadingAutoDJ } = useRadioAutoDJ();
  const { data: playlists, isLoading: loadingPlaylists } = useRadioPlaylists();
  const toggleAutoDJ = useToggleRadioAutoDJ();
  const createPlaylist = useCreateRadioPlaylist();
  const updatePlaylist = useUpdateRadioPlaylist();
  const deletePlaylist = useDeleteRadioPlaylist();

  const [playlistToEdit, setPlaylistToEdit] = useState<RadioPlaylist | null>(null);
  const [playlistToDelete, setPlaylistToDelete] = useState<RadioPlaylist | null>(null);

  const isLoading = loadingAutoDJ || loadingPlaylists;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48 md:col-span-2" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const currentTrack = autoDJ?.currentTrack;
  const nextTrack = autoDJ?.nextTrack;
  const progress = currentTrack
    ? (currentTrack.elapsedSec / currentTrack.durationSec) * 100
    : 0;

  const handleCreatePlaylist = async (data: any) => {
    try {
      await createPlaylist.mutateAsync({
        name: data.name,
        description: data.description,
        schedule: data.schedule,
        rules: data.rules,
        enabled: true,
        trackCount: 0,
      });
      toast.success("Playlist criada com sucesso!");
    } catch {
      toast.error("Erro ao criar playlist");
      throw new Error("Failed to create playlist");
    }
  };

  const handleEditPlaylist = async (data: Partial<RadioPlaylist>) => {
    if (!playlistToEdit) return;
    try {
      await updatePlaylist.mutateAsync({ id: playlistToEdit.id, data });
      toast.success("Playlist atualizada com sucesso!");
      setPlaylistToEdit(null);
    } catch {
      toast.error("Erro ao atualizar playlist");
    }
  };

  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    try {
      await deletePlaylist.mutateAsync(playlistToDelete.id);
      toast.success("Playlist excluída com sucesso!");
      setPlaylistToDelete(null);
    } catch {
      toast.error("Erro ao excluir playlist");
    }
  };

  const handleTogglePlaylist = (id: string, enabled: boolean) => {
    updatePlaylist.mutate({ id, data: { enabled } });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Music2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AutoDJ Avançado</h1>
            <p className="text-muted-foreground">
              Gerencie playlists e automação de reprodução
            </p>
          </div>
        </div>

        {/* Global Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">AutoDJ</span>
          <Switch
            checked={autoDJ?.enabled}
            onCheckedChange={() => toggleAutoDJ.mutate()}
            disabled={toggleAutoDJ.isPending}
          />
          <Badge variant={autoDJ?.enabled ? "default" : "secondary"}>
            {autoDJ?.enabled ? "Ativo" : "Inativo"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Now Playing */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Play className="h-5 w-5" />
              Tocando Agora
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {currentTrack ? (
              <>
                <div>
                  <p className="font-medium">{currentTrack.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentTrack.artist}
                  </p>
                </div>
                <Progress value={progress} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {Math.floor(currentTrack.elapsedSec / 60)}:
                    {String(currentTrack.elapsedSec % 60).padStart(2, "0")}
                  </span>
                  <span>
                    {Math.floor(currentTrack.durationSec / 60)}:
                    {String(currentTrack.durationSec % 60).padStart(2, "0")}
                  </span>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma música tocando
              </p>
            )}
          </CardContent>
        </Card>

        {/* Up Next + Active Playlist */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <SkipForward className="h-5 w-5" />
              Próxima na Fila
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Próxima Música</p>
                {nextTrack ? (
                  <div className="p-3 border rounded-lg">
                    <p className="font-medium">{nextTrack.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {nextTrack.artist}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Playlist Ativa</p>
                {autoDJ?.activePlaylist ? (
                  <div className="p-3 border rounded-lg bg-primary/5">
                    <p className="font-medium">{autoDJ.activePlaylist.name}</p>
                    <Badge variant="outline" className="mt-1">
                      <Power className="h-3 w-3 mr-1" />
                      Ativa
                    </Badge>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma playlist ativa
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Playlists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Playlists Programadas</h2>
          <CreatePlaylistDialog 
            onSubmit={handleCreatePlaylist} 
            isSubmitting={createPlaylist.isPending}
          />
        </div>

        {playlists && playlists.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {playlists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                onToggle={(enabled) => handleTogglePlaylist(playlist.id, enabled)}
                onEdit={() => setPlaylistToEdit(playlist)}
                onDelete={() => setPlaylistToDelete(playlist)}
                isUpdating={updatePlaylist.isPending}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Music2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Nenhuma playlist criada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Crie playlists para programar a reprodução automática
              </p>
              <CreatePlaylistDialog 
                onSubmit={handleCreatePlaylist}
                isSubmitting={createPlaylist.isPending}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <EditPlaylistDialog
        open={!!playlistToEdit}
        onOpenChange={(open) => !open && setPlaylistToEdit(null)}
        playlist={playlistToEdit}
        onSubmit={handleEditPlaylist}
        isSubmitting={updatePlaylist.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!playlistToDelete} onOpenChange={(open) => !open && setPlaylistToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a playlist "{playlistToDelete?.name}"? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeletePlaylist}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePlaylist.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
