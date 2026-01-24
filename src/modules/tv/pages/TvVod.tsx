import { useState } from "react";
import { Film, Search, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTvVods, useDeleteTvVod } from "../hooks";
import { VodCard } from "../components";
import { TvVodItem } from "../types";
import { Link } from "react-router-dom";

export default function TvVod() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: vods, isLoading, error, refetch } = useTvVods({
    page,
    limit,
    status: statusFilter !== "all" ? (statusFilter as TvVodItem["status"]) : undefined,
    search: search || undefined,
  });

  const deleteVod = useDeleteTvVod();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVod, setSelectedVod] = useState<TvVodItem | null>(null);

  const handleDelete = () => {
    if (!selectedVod) return;
    
    deleteVod.mutate(selectedVod.id, {
      onSuccess: () => {
        toast.success("Vídeo excluído com sucesso");
        setDeleteDialogOpen(false);
        setSelectedVod(null);
      },
      onError: () => {
        toast.error("Erro ao excluir vídeo");
      },
    });
  };

  const openDeleteDialog = (vod: TvVodItem) => {
    setSelectedVod(vod);
    setDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            Erro ao carregar biblioteca de vídeos
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
            <Film className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Biblioteca VOD</h1>
            <p className="text-muted-foreground">Gerencie seus vídeos sob demanda</p>
          </div>
        </div>

        <Button asChild>
          <Link to="/admin/tv/uploads">
            <Upload className="mr-2 h-4 w-4" />
            Upload Vídeo
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar vídeos..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>

        <Select 
          value={statusFilter} 
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="ready">Prontos</SelectItem>
            <SelectItem value="processing">Processando</SelectItem>
            <SelectItem value="uploading">Enviando</SelectItem>
            <SelectItem value="error">Com Erro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-lg" />
          ))}
        </div>
      ) : vods && vods.items && vods.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {vods.items.map((vod) => (
              <VodCard
                key={vod.id}
                vod={vod}
                onView={(vod) => toast.info(`Visualizar: ${vod.title} (em desenvolvimento)`)}
                onEdit={(vod) => toast.info(`Editar: ${vod.title} (em desenvolvimento)`)}
                onDelete={openDeleteDialog}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Página {page}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={vods.items.length < limit}
            >
              Próxima
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center py-16 border rounded-lg border-dashed">
          <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum vídeo encontrado</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            {search || statusFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Faça upload do seu primeiro vídeo para começar"}
          </p>
          {!search && statusFilter === "all" && (
            <Button asChild>
              <Link to="/admin/tv/uploads">
                <Upload className="mr-2 h-4 w-4" />
                Upload Vídeo
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vídeo?</AlertDialogTitle>
            <AlertDialogDescription>
              O vídeo "{selectedVod?.title}" será excluído permanentemente. 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteVod.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteVod.isPending ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
