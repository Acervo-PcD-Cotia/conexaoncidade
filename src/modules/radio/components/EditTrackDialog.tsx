import { useState, useEffect } from "react";
import { Music, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioTrack } from "../types";

interface EditTrackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: RadioTrack | null;
  onSubmit: (data: Partial<RadioTrack>) => Promise<void>;
  isSubmitting?: boolean;
}

const genres = [
  "Pop",
  "Rock",
  "MPB",
  "Bossa Nova",
  "Sertanejo",
  "Forró",
  "Eletrônica",
  "Jazz",
  "Blues",
  "Clássica",
  "Gospel",
  "Funk",
  "Hip Hop",
  "Reggae",
  "Pagode",
  "Samba",
  "Outro",
];

export function EditTrackDialog({
  open,
  onOpenChange,
  track,
  onSubmit,
  isSubmitting,
}: EditTrackDialogProps) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");

  useEffect(() => {
    if (track) {
      setTitle(track.title);
      setArtist(track.artist);
      setAlbum(track.album || "");
      setGenre(track.genre || "");
    }
  }, [track]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await onSubmit({
      title,
      artist,
      album: album || undefined,
      genre: genre || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Editar Metadados
          </DialogTitle>
          <DialogDescription>
            Altere as informações da música.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="track-title">Título</Label>
            <Input
              id="track-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da música"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track-artist">Artista</Label>
            <Input
              id="track-artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nome do artista"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="track-album">Álbum (opcional)</Label>
            <Input
              id="track-album"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder="Nome do álbum"
            />
          </div>

          <div className="space-y-2">
            <Label>Gênero</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar gênero" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
