import { useState } from "react";
import { Upload, FileVideo, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTvUploads, useStartTvUpload, useCancelTvUpload } from "../hooks";
import { UploadJobRow, UploadVideoDialog, VideoUploadData } from "../components";
import { TvUploadJob } from "../types";

export default function TvUploads() {
  const { data: uploads, isLoading, error, refetch } = useTvUploads();
  const startUpload = useStartTvUpload();
  const cancelUpload = useCancelTvUpload();

  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<TvUploadJob | null>(null);

  const handleUpload = (data: VideoUploadData) => {
    startUpload.mutate(
      {
        file: data.file,
        metadata: {
          title: data.title,
          description: data.description,
        },
      },
      {
        onSuccess: () => {
          toast.success("Upload iniciado com sucesso");
          setUploadDialogOpen(false);
        },
        onError: () => {
          toast.error("Erro ao iniciar upload");
        },
      }
    );
  };

  const handleCancel = () => {
    if (!selectedJob) return;
    
    cancelUpload.mutate(selectedJob.id, {
      onSuccess: () => {
        toast.success("Upload cancelado");
        setCancelDialogOpen(false);
        setSelectedJob(null);
      },
      onError: () => {
        toast.error("Erro ao cancelar upload");
      },
    });
  };

  const openCancelDialog = (job: TvUploadJob) => {
    setSelectedJob(job);
    setCancelDialogOpen(true);
  };

  // Separate active and completed jobs
  const activeJobs = uploads?.filter(
    (j) => j.status === "queued" || j.status === "uploading" || j.status === "processing"
  ) || [];
  
  const completedJobs = uploads?.filter(
    (j) => j.status === "done" || j.status === "error"
  ) || [];

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            Erro ao carregar uploads
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
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Uploads</h1>
            <p className="text-muted-foreground">Envie e acompanhe o processamento de vídeos</p>
          </div>
        </div>

        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Novo Upload
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : (
        <>
          {/* Active Uploads */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">
              Em Andamento
              {activeJobs.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({activeJobs.length})
                </span>
              )}
            </h2>

            {activeJobs.length > 0 ? (
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <UploadJobRow
                    key={job.id}
                    job={job}
                    onCancel={openCancelDialog}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg border-dashed">
                <FileVideo className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Nenhum upload em andamento</p>
                <Button 
                  variant="link" 
                  className="mt-2"
                  onClick={() => setUploadDialogOpen(true)}
                >
                  Iniciar novo upload
                </Button>
              </div>
            )}
          </section>

          {completedJobs.length > 0 && (
            <>
              <Separator />

              {/* Completed Uploads */}
              <section className="space-y-4">
                <h2 className="text-lg font-semibold">
                  Histórico
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({completedJobs.length})
                  </span>
                </h2>

                <div className="space-y-3">
                  {completedJobs.map((job) => (
                    <UploadJobRow key={job.id} job={job} />
                  ))}
                </div>
              </section>
            </>
          )}
        </>
      )}

      {/* Upload Dialog */}
      <UploadVideoDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onSubmit={handleUpload}
        isLoading={startUpload.isPending}
      />

      {/* Cancel Confirmation */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar upload?</AlertDialogTitle>
            <AlertDialogDescription>
              O upload de "{selectedJob?.filename}" será cancelado. 
              Qualquer progresso será perdido.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              disabled={cancelUpload.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelUpload.isPending ? "Cancelando..." : "Cancelar Upload"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
