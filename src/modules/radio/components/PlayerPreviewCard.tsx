import { Trash2, Code } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CopyButton } from "./CopyButton";
import { RadioPlayerEmbed } from "../types";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PlayerPreviewCardProps {
  player: RadioPlayerEmbed;
  onDelete: () => void;
  isDeleting?: boolean;
}

const kindLabels = {
  bar: "Barra",
  popup: "Popup",
  floating: "Flutuante",
  html5: "HTML5",
  minimal: "Mínimo",
};

const themeLabels = {
  light: "Claro",
  dark: "Escuro",
  auto: "Automático",
};

export function PlayerPreviewCard({
  player,
  onDelete,
  isDeleting,
}: PlayerPreviewCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{player.name}</CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir player?</AlertDialogTitle>
                <AlertDialogDescription>
                  O código embed deixará de funcionar em sites que o utilizam.
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{kindLabels[player.kind]}</Badge>
          <Badge variant="outline">{themeLabels[player.theme]}</Badge>
          {player.primaryColor && (
            <Badge
              variant="outline"
              className="gap-1"
              style={{ borderColor: player.primaryColor }}
            >
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: player.primaryColor }}
              />
              {player.primaryColor}
            </Badge>
          )}
        </div>

        {player.previewUrl && (
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            <iframe
              src={player.previewUrl}
              className="w-full h-full border-0"
              title={`Preview: ${player.name}`}
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <Code className="h-4 w-4" />
              Código Embed
            </span>
            <CopyButton value={player.code} />
          </div>
          <Textarea
            value={player.code}
            readOnly
            rows={3}
            className="font-mono text-xs resize-none"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Criado{" "}
          {formatDistanceToNow(new Date(player.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </CardContent>
    </Card>
  );
}
