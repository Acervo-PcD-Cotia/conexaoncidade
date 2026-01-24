import { useState } from "react";
import { Tv, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useTvPlayers, useGenerateTvPlayer, useDeleteTvPlayer } from "../hooks";
import { PlayerPreviewCard, CreatePlayerDialog, PlayerFormData } from "../components";
import { TvPlayerEmbed } from "../types";

export default function TvPlayers() {
  const { data: players, isLoading, error, refetch } = useTvPlayers();
  const generatePlayer = useGenerateTvPlayer();
  const deletePlayer = useDeleteTvPlayer();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = (data: PlayerFormData) => {
    generatePlayer.mutate(
      {
        name: data.name,
        kind: data.kind,
        theme: data.theme,
        autoplay: data.autoplay,
        muted: data.muted,
        controls: data.controls,
      },
      {
        onSuccess: () => {
          toast.success("Player gerado com sucesso");
          setCreateDialogOpen(false);
        },
        onError: () => {
          toast.error("Erro ao gerar player");
        },
      }
    );
  };

  const handleDelete = (player: TvPlayerEmbed) => {
    setDeletingId(player.id);
    deletePlayer.mutate(player.id, {
      onSuccess: () => {
        toast.success("Player excluído com sucesso");
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Erro ao excluir player");
        setDeletingId(null);
      },
    });
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            Erro ao carregar players
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Tv className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Players / Embeds</h1>
            <p className="text-muted-foreground">Gere códigos para incorporar seu conteúdo</p>
          </div>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Gerar Novo Player
        </Button>
      </div>

      {/* Players Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      ) : players && players.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <PlayerPreviewCard
              key={player.id}
              player={player}
              onDelete={handleDelete}
              isDeleting={deletingId === player.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg border-dashed">
          <Tv className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum player criado ainda</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Gere players personalizados para incorporar em seu site ou aplicativo
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Gerar Primeiro Player
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <CreatePlayerDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={generatePlayer.isPending}
      />
    </div>
  );
}
