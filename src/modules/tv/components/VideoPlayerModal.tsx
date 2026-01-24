import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Eye, Clock } from "lucide-react";
import { TvVodItem } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VideoPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vod: TvVodItem | null;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function VideoPlayerModal({ open, onOpenChange, vod }: VideoPlayerModalProps) {
  if (!vod) return null;

  const videoSrc = vod.hlsUrl || vod.videoUrl || "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-lg">{vod.title}</DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            {videoSrc ? (
              <video
                src={videoSrc}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={vod.thumbnailUrl}
              >
                Seu navegador não suporta reprodução de vídeo.
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white bg-muted">
                <div className="text-center">
                  <p className="text-lg font-medium mb-2">Preview não disponível</p>
                  <p className="text-sm text-muted-foreground">
                    O vídeo ainda está sendo processado
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-2">
            {vod.description && (
              <p className="text-sm text-muted-foreground">{vod.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{vod.views.toLocaleString()} visualizações</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(vod.durationSec)}</span>
              </div>
              {vod.resolution && (
                <Badge variant="outline">{vod.resolution}</Badge>
              )}
              <span>
                Enviado {formatDistanceToNow(new Date(vod.createdAt), { addSuffix: true, locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
