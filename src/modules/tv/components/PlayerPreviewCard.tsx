import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Tv } from "lucide-react";
import { TvPlayerEmbed } from "../types";
import { CopyButton } from "./CopyButton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlayerPreviewCardProps {
  player: TvPlayerEmbed;
  onDelete?: (player: TvPlayerEmbed) => void;
  isDeleting?: boolean;
}

const kindLabels: Record<TvPlayerEmbed["kind"], string> = {
  hls: "HLS Nativo",
  iframe: "iFrame",
  smarttv: "Smart TV",
  responsive: "Responsivo",
};

const themeLabels: Record<TvPlayerEmbed["theme"], string> = {
  light: "Claro",
  dark: "Escuro",
  auto: "Automático",
};

export function PlayerPreviewCard({ player, onDelete, isDeleting }: PlayerPreviewCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{player.name}</CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{kindLabels[player.kind]}</Badge>
              <Badge variant="secondary">{themeLabels[player.theme]}</Badge>
              {player.autoplay && <Badge variant="secondary">Autoplay</Badge>}
              {player.muted && <Badge variant="secondary">Mudo</Badge>}
              {player.controls && <Badge variant="secondary">Controles</Badge>}
            </div>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir player?</AlertDialogTitle>
                <AlertDialogDescription>
                  O player "{player.name}" será removido permanentemente. 
                  Qualquer embed usando este código deixará de funcionar.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete?.(player)}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview */}
        {player.previewUrl ? (
          <div className="aspect-video rounded-lg overflow-hidden border">
            <iframe 
              src={player.previewUrl} 
              className="w-full h-full"
              title={`Preview: ${player.name}`}
            />
          </div>
        ) : (
          <div className="aspect-video rounded-lg bg-muted flex items-center justify-center border">
            <Tv className="h-12 w-12 text-muted-foreground" />
          </div>
        )}

        {/* Embed code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Código Embed</span>
            <CopyButton value={player.code} />
          </div>
          <Textarea 
            value={player.code}
            readOnly
            className="font-mono text-xs h-20 resize-none"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Criado {formatDistanceToNow(new Date(player.createdAt), { addSuffix: true, locale: ptBR })}
        </p>
      </CardContent>
    </Card>
  );
}
