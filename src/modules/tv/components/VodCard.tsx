import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Play, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { TvVodItem } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface VodCardProps {
  vod: TvVodItem;
  onView?: (vod: TvVodItem) => void;
  onEdit?: (vod: TvVodItem) => void;
  onDelete?: (vod: TvVodItem) => void;
}

const statusConfig: Record<TvVodItem["status"], { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  ready: { label: "Pronto", variant: "default" },
  processing: { label: "Processando", variant: "outline" },
  uploading: { label: "Enviando", variant: "secondary" },
  error: { label: "Erro", variant: "destructive" },
};

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function VodCard({ vod, onView, onEdit, onDelete }: VodCardProps) {
  const status = statusConfig[vod.status];

  return (
    <Card className="overflow-hidden group">
      <div className="relative aspect-video bg-muted">
        {vod.thumbnailUrl ? (
          <img 
            src={vod.thumbnailUrl} 
            alt={vod.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        
        {/* Duration overlay */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(vod.durationSec)}
        </div>

        {/* Hover overlay */}
        {vod.status === "ready" && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button size="icon" variant="secondary" onClick={() => onView?.(vod)}>
              <Play className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{vod.title}</h3>
            {vod.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {vod.description}
              </p>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(vod)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(vod)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.(vod)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-between mt-3">
          <Badge variant={status.variant} className={vod.status === "processing" ? "animate-pulse" : ""}>
            {status.label}
          </Badge>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {vod.views.toLocaleString()}
            </span>
            <span>
              {formatDistanceToNow(new Date(vod.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
