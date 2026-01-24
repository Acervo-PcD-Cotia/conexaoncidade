import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, FileVideo, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { TvUploadJob } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UploadJobRowProps {
  job: TvUploadJob;
  onCancel?: (job: TvUploadJob) => void;
}

const statusConfig: Record<TvUploadJob["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  queued: { label: "Na fila", variant: "secondary" },
  uploading: { label: "Enviando", variant: "outline" },
  processing: { label: "Processando", variant: "outline" },
  done: { label: "Concluído", variant: "default" },
  error: { label: "Erro", variant: "destructive" },
};

const stageLabels: Record<NonNullable<TvUploadJob["stage"]>, string> = {
  upload: "Enviando arquivo",
  transcode: "Transcodificando",
  thumbnail: "Gerando thumbnail",
  finalize: "Finalizando",
};

export function UploadJobRow({ job, onCancel }: UploadJobRowProps) {
  const status = statusConfig[job.status];
  const canCancel = job.status !== "done" && job.status !== "error";
  const isActive = job.status === "uploading" || job.status === "processing";

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      {/* Icon */}
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        {job.status === "done" ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : job.status === "error" ? (
          <AlertCircle className="h-5 w-5 text-destructive" />
        ) : isActive ? (
          <Loader2 className="h-5 w-5 text-primary animate-spin" />
        ) : (
          <FileVideo className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{job.filename}</span>
          <Badge variant={status.variant} className={isActive ? "animate-pulse" : ""}>
            {status.label}
          </Badge>
        </div>
        
        {isActive && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{job.stage ? stageLabels[job.stage] : "Processando..."}</span>
              <span>{job.progressPct}%</span>
            </div>
            <Progress value={job.progressPct} className="h-1.5" />
          </div>
        )}

        {job.status === "error" && job.errorMessage && (
          <p className="text-sm text-destructive mt-1">{job.errorMessage}</p>
        )}

        {job.status === "done" && job.completedAt && (
          <p className="text-xs text-muted-foreground mt-1">
            Concluído {formatDistanceToNow(new Date(job.completedAt), { addSuffix: true, locale: ptBR })}
          </p>
        )}

        {job.status === "queued" && (
          <p className="text-xs text-muted-foreground mt-1">
            Na fila desde {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: ptBR })}
          </p>
        )}
      </div>

      {/* Cancel button */}
      {canCancel && onCancel && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onCancel(job)}
          title="Cancelar"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
