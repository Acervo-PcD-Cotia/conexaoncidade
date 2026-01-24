import { Code } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlayerPreviewCard, CreatePlayerDialog } from "../components";
import { useRadioPlayers, useDeleteRadioPlayer } from "../hooks/useRadioPlayers";

export default function RadioPlayers() {
  const { data: players, isLoading, error, refetch } = useRadioPlayers();
  const deleteMutation = useDeleteRadioPlayer();

  const handleDeletePlayer = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar players</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Code className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Players / Embeds</h1>
            <p className="text-muted-foreground">
              Gere players personalizados para incorporar em sites
            </p>
          </div>
        </div>
        <CreatePlayerDialog />
      </div>

      {/* Players Grid */}
      {players && players.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {players.map((player) => (
            <PlayerPreviewCard
              key={player.id}
              player={player}
              onDelete={() => handleDeletePlayer(player.id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium mb-2">Nenhum player criado</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Gere players personalizados para incorporar sua rádio em sites e aplicações
            </p>
            <CreatePlayerDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
