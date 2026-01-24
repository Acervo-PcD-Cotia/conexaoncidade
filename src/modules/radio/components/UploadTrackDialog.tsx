import { useState } from "react";
import { Upload, Music, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUploadRadioTrack } from "../hooks/useRadioLibrary";
import { toast } from "sonner";

interface UploadTrackDialogProps {
  trigger?: React.ReactNode;
}

export function UploadTrackDialog({ trigger }: UploadTrackDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [album, setAlbum] = useState("");
  const [genre, setGenre] = useState("");
  const [progress, setProgress] = useState(0);

  const uploadMutation = useUploadRadioTrack();

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setArtist("");
    setAlbum("");
    setGenre("");
    setProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Extract filename as default title
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      if (!title) {
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Simulate progress for mock
    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90));
    }, 200);

    try {
      await uploadMutation.mutateAsync({
        file,
        metadata: {
          title: title || file.name,
          artist: artist || "Artista Desconhecido",
          album: album || undefined,
          genre: genre || undefined,
        },
      });
      
      clearInterval(progressInterval);
      setProgress(100);
      toast.success("Música enviada com sucesso!");
      setTimeout(() => {
        setOpen(false);
        resetForm();
      }, 500);
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      toast.error("Erro ao enviar música");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            Upload Música
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Enviar Música
          </DialogTitle>
          <DialogDescription>
            Formatos aceitos: MP3, OGG, FLAC. Tamanho máximo: 50MB.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Arquivo de Áudio</Label>
            <Input
              id="file"
              type="file"
              accept=".mp3,.ogg,.flac,audio/mpeg,audio/ogg,audio/flac"
              onChange={handleFileChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nome da música"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist">Artista</Label>
              <Input
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Nome do artista"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="album">Álbum</Label>
              <Input
                id="album"
                value={album}
                onChange={(e) => setAlbum(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genre">Gênero</Label>
              <Input
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="Opcional"
              />
            </div>
          </div>

          {uploadMutation.isPending && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground text-center">
                Enviando... {progress}%
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!file || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando
                </>
              ) : (
                "Enviar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
