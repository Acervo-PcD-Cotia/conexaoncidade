import { useState } from "react";
import { Library, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { TrackRow, UploadTrackDialog, EditTrackDialog } from "../components";
import { useRadioLibrary, useDeleteRadioTrack, useUpdateRadioTrack } from "../hooks/useRadioLibrary";
import { RadioTrack } from "../types";

const genres = ["Todos", "Pop", "Rock", "MPB", "Sertanejo", "Forró", "Eletrônica"];

export default function RadioLibrary() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Todos");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [trackToDelete, setTrackToDelete] = useState<RadioTrack | null>(null);
  const [trackToEdit, setTrackToEdit] = useState<RadioTrack | null>(null);

  const { data, isLoading, error, refetch } = useRadioLibrary({
    page,
    limit,
    search: search || undefined,
    genre: genre !== "Todos" ? genre : undefined,
  });

  const deleteMutation = useDeleteRadioTrack();
  const updateMutation = useUpdateRadioTrack();

  const handleDeleteTrack = async () => {
    if (!trackToDelete) return;
    
    try {
      await deleteMutation.mutateAsync(trackToDelete.id);
      setTrackToDelete(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleEditTrack = async (data: Partial<RadioTrack>) => {
    if (!trackToEdit) return;
    
    try {
      await updateMutation.mutateAsync({ id: trackToEdit.id, data });
      toast.success("Música atualizada com sucesso!");
      setTrackToEdit(null);
    } catch {
      toast.error("Erro ao atualizar música");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar biblioteca</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tracks = data?.items || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Library className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Biblioteca de Músicas</h1>
            <p className="text-muted-foreground">
              {total} músicas no acervo
            </p>
          </div>
        </div>
        <UploadTrackDialog />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, artista ou álbum..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select value={genre} onValueChange={(v) => { setGenre(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Gênero" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((g) => (
              <SelectItem key={g} value={g}>
                {g}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(limit)} onValueChange={(v) => { setLimit(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-24">
            <SelectValue placeholder="Por página" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="25">25</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {tracks.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Música</TableHead>
                    <TableHead>Álbum</TableHead>
                    <TableHead>Gênero</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-center">Plays</TableHead>
                    <TableHead>Última Reprodução</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {tracks.map((track) => (
                    <TrackRow
                      key={track.id}
                      track={track}
                      onEdit={() => setTrackToEdit(track)}
                      onDelete={() => setTrackToDelete(track)}
                      isDeleting={deleteMutation.isPending}
                    />
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center">
              <Library className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Nenhuma música encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {search || genre !== "Todos"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece enviando suas primeiras músicas"}
              </p>
              <UploadTrackDialog />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!trackToDelete}
        onOpenChange={(open) => !open && setTrackToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir música?</AlertDialogTitle>
            <AlertDialogDescription>
              A música "{trackToDelete?.title}" de {trackToDelete?.artist} será
              removida permanentemente da biblioteca. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTrack}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Track Dialog */}
      <EditTrackDialog
        open={!!trackToEdit}
        onOpenChange={(open) => !open && setTrackToEdit(null)}
        track={trackToEdit}
        onSubmit={handleEditTrack}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
