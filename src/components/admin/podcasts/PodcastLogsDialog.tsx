import { History, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { usePodcastLogs } from "@/hooks/usePodcasts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PodcastLogsDialogProps {
  newsId: string | null;
  onClose: () => void;
}

function getActionBadge(action: string) {
  switch (action) {
    case "generate":
      return <Badge className="bg-blue-600">Gerado</Badge>;
    case "regenerate":
      return <Badge className="bg-yellow-600">Regenerado</Badge>;
    case "publish":
      return <Badge className="bg-green-600">Publicado</Badge>;
    case "delete":
      return <Badge variant="destructive">Excluído</Badge>;
    case "error":
      return <Badge variant="destructive">Erro</Badge>;
    default:
      return <Badge variant="outline">{action}</Badge>;
  }
}

export function PodcastLogsDialog({ newsId, onClose }: PodcastLogsDialogProps) {
  const { data: logs, isLoading } = usePodcastLogs(newsId);

  return (
    <Dialog open={!!newsId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico do Podcast
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : logs?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum registro encontrado
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {logs?.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getActionBadge(log.action)}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(log.created_at), "dd/MM/yyyy 'às' HH:mm", {
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
