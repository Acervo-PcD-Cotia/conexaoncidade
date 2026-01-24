import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Film } from "lucide-react";
import { TvVodItem } from "../types";

interface EditVodDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vod: TvVodItem | null;
  onSubmit: (data: Partial<TvVodItem>) => void;
  isLoading?: boolean;
}

export function EditVodDialog({ 
  open, 
  onOpenChange, 
  vod,
  onSubmit, 
  isLoading
}: EditVodDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    if (vod) {
      setTitle(vod.title);
      setDescription(vod.description || "");
      setThumbnailUrl(vod.thumbnailUrl || "");
    }
  }, [vod]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description: description || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            Editar Vídeo
          </DialogTitle>
          <DialogDescription>
            Modifique os metadados do vídeo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vod-title">Título *</Label>
            <Input
              id="vod-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título do vídeo"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vod-description">Descrição</Label>
            <Textarea
              id="vod-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do vídeo"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vod-thumbnail">URL da Thumbnail</Label>
            <Input
              id="vod-thumbnail"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://exemplo.com/thumbnail.jpg"
              type="url"
            />
            {thumbnailUrl && (
              <div className="mt-2 rounded-lg overflow-hidden border aspect-video w-full max-w-xs">
                <img 
                  src={thumbnailUrl} 
                  alt="Preview da thumbnail"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
