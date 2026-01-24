import { Music, Calendar, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RadioPlaylist } from "../types";

interface PlaylistCardProps {
  playlist: RadioPlaylist;
  onToggle: (enabled: boolean) => void;
  isUpdating?: boolean;
}

const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function PlaylistCard({ playlist, onToggle, isUpdating }: PlaylistCardProps) {
  const activeDays = playlist.schedule.days.map((d) => dayNames[d]).join(", ");

  return (
    <Card className={!playlist.enabled ? "opacity-60" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{playlist.name}</CardTitle>
          <Switch
            checked={playlist.enabled}
            onCheckedChange={onToggle}
            disabled={isUpdating}
          />
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
