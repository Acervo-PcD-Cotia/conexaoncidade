import { Music, Calendar, Clock, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RadioPlaylist } from "../types";

interface PlaylistCardProps {
  playlist: RadioPlaylist;
  onToggle: (enabled: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isUpdating?: boolean;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function PlaylistCard({ playlist, onToggle, onEdit, onDelete, isUpdating }: PlaylistCardProps) {
  const activeDays = playlist.schedule.days.map((d) => dayNames[d]).join(", ");

  return (
    <Card className={!playlist.enabled ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{playlist.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Switch
              checked={playlist.enabled}
              onCheckedChange={onToggle}
              disabled={isUpdating}
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {playlist.description && (
          <p className="text-sm text-muted-foreground">{playlist.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="secondary" className="gap-1">
            <Calendar className="h-3 w-3" />
            {activeDays}
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            {playlist.schedule.startTime} - {playlist.schedule.endTime}
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Music className="h-3 w-3" />
            {playlist.trackCount} músicas
          </Badge>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Regras: Não repetir artista em {playlist.rules.noRepeatArtistMins} min
            {playlist.rules.shuffle && " • Shuffle ativo"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
