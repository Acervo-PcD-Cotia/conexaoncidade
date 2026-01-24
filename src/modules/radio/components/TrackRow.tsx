import { Play, Trash2, MoreHorizontal, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@/components/ui/table";
import { RadioTrack } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TrackRowProps {
  track: RadioTrack;
  onPlay?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  isDeleting?: boolean;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function TrackRow({ track, onPlay, onEdit, onDelete, isDeleting }: TrackRowProps) {
  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPlay}
            disabled={!track.fileUrl}
          >
            <Play className="h-4 w-4" />
          </Button>
          <div>
            <p className="font-medium">{track.title}</p>
            <p className="text-sm text-muted-foreground">{track.artist}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {track.album || "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {track.genre || "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDuration(track.durationSec)}
      </TableCell>
      <TableCell className="text-muted-foreground text-center">
        {track.playCount}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {track.lastPlayedAt
          ? formatDistanceToNow(new Date(track.lastPlayedAt), {
              addSuffix: true,
              locale: ptBR,
            })
          : "Nunca"}
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              disabled={isDeleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
