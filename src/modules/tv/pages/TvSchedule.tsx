import { useState } from "react";
import { Calendar, Plus, AlertCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTvSchedule, useCreateTvScheduleItem, useDeleteTvScheduleItem, useTvVods } from "../hooks";
import { ScheduleItemCard, CreateScheduleDialog, ScheduleFormData } from "../components";
import { TvScheduleItem } from "../types";

export default function TvSchedule() {
  const { data: schedule, isLoading, error, refetch } = useTvSchedule();
  const { data: vods } = useTvVods();
  const createItem = useCreateTvScheduleItem();
  const deleteItem = useDeleteTvScheduleItem();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TvScheduleItem | null>(null);

  const handleCreate = (data: ScheduleFormData) => {
    createItem.mutate(
      {
        title: data.title,
        description: data.description,
        startAt: new Date(data.startAt).toISOString(),
        endAt: new Date(data.endAt).toISOString(),
        source: data.source,
        vodId: data.vodId,
        isRecurring: data.isRecurring,
        recurringPattern: data.isRecurring && data.recurringDays.length > 0
          ? {
              days: data.recurringDays,
              startTime: data.startAt.split("T")[1] || "00:00",
              endTime: data.endAt.split("T")[1] || "00:00",
            }
          : undefined,
      },
      {
        onSuccess: () => {
          toast.success("Programa adicionado à grade");
          setCreateDialogOpen(false);
        },
        onError: () => {
          toast.error("Erro ao adicionar programa");
        },
      }
    );
  };

  const handleDelete = () => {
    if (!selectedItem) return;
    
    deleteItem.mutate(selectedItem.id, {
      onSuccess: () => {
        toast.success("Programa removido da grade");
        setDeleteDialogOpen(false);
        setSelectedItem(null);
      },
      onError: () => {
        toast.error("Erro ao remover programa");
      },
    });
  };

  const openDeleteDialog = (item: TvScheduleItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            Erro ao carregar grade de programação
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
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Grade Linear</h1>
            <p className="text-muted-foreground">Programe transmissões ao vivo e VODs</p>
          </div>
        </div>

        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Programa
        </Button>
      </div>

      {/* Schedule List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : schedule && schedule.length > 0 ? (
        <div className="space-y-4">
          {schedule.map((item) => (
            <ScheduleItemCard
              key={item.id}
              item={item}
              onEdit={(item) => toast.info(`Editar: ${item.title} (em desenvolvimento)`)}
              onDuplicate={(item) => toast.info(`Duplicar: ${item.title} (em desenvolvimento)`)}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border rounded-lg border-dashed">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">Nenhum programa agendado</h3>
          <p className="text-muted-foreground mt-1 mb-4">
            Adicione programas para criar sua grade de programação
          </p>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Adicionar Primeiro Programa
          </Button>
        </div>
      )}

      {/* Create Dialog */}
      <CreateScheduleDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreate}
        isLoading={createItem.isPending}
        vods={vods?.items || []}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover programa?</AlertDialogTitle>
            <AlertDialogDescription>
              O programa "{selectedItem?.title}" será removido da grade. 
              {selectedItem?.isRecurring && " Todas as ocorrências recorrentes também serão removidas."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteItem.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteItem.isPending ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
