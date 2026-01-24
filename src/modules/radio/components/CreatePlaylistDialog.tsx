import { useState } from "react";
import { ListMusic, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface CreatePlaylistDialogProps {
  trigger?: React.ReactNode;
  onSubmit: (data: PlaylistFormData) => Promise<void>;
  isSubmitting?: boolean;
}

interface PlaylistFormData {
  name: string;
  description?: string;
  schedule: {
    days: number[];
    startTime: string;
    endTime: string;
  };
  rules: {
    noRepeatArtistMins: number;
    noRepeatTrackMins: number;
    shuffle: boolean;
  };
}

const daysOfWeek = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Seg" },
  { value: 2, label: "Ter" },
  { value: 3, label: "Qua" },
  { value: 4, label: "Qui" },
  { value: 5, label: "Sex" },
  { value: 6, label: "Sáb" },
];

export function CreatePlaylistDialog({
  trigger,
  onSubmit,
  isSubmitting,
}: CreatePlaylistDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("18:00");
  const [noRepeatArtist, setNoRepeatArtist] = useState(30);
  const [noRepeatTrack, setNoRepeatTrack] = useState(120);
  const [shuffle, setShuffle] = useState(true);

  const resetForm = () => {
    setName("");
    setDescription("");
    setSelectedDays([1, 2, 3, 4, 5]);
    setStartTime("06:00");
    setEndTime("18:00");
    setNoRepeatArtist(30);
    setNoRepeatTrack(120);
    setShuffle(true);
  };

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Nome da playlist é obrigatório");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Selecione pelo menos um dia da semana");
      return;
    }

    try {
      await onSubmit({
        name,
        description: description || undefined,
        schedule: {
          days: selectedDays.sort(),
          startTime,
          endTime,
        },
        rules: {
          noRepeatArtistMins: noRepeatArtist,
          noRepeatTrackMins: noRepeatTrack,
          shuffle,
        },
      });
      
      toast.success("Playlist criada com sucesso!");
      setOpen(false);
      resetForm();
    } catch {
      toast.error("Erro ao criar playlist");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <ListMusic className="h-4 w-4" />
            Nova Playlist
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            Nova Playlist
          </DialogTitle>
          <DialogDescription>
            Configure os horários e regras de reprodução para o AutoDJ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Playlist</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Manhãs Animadas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da playlist"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label>Dias da Semana</Label>
            <div className="flex gap-1">
              {daysOfWeek.map((day) => (
                <Button
                  key={day.value}
                  type="button"
                  variant={selectedDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDay(day.value)}
                  className="flex-1"
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Hora Início</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Hora Fim</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-sm">Regras de Reprodução</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="noRepeatArtist">Não repetir artista (min)</Label>
                <Input
                  id="noRepeatArtist"
                  type="number"
                  min={0}
                  max={180}
                  value={noRepeatArtist}
                  onChange={(e) => setNoRepeatArtist(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noRepeatTrack">Não repetir música (min)</Label>
                <Input
                  id="noRepeatTrack"
                  type="number"
                  min={0}
                  max={360}
                  value={noRepeatTrack}
                  onChange={(e) => setNoRepeatTrack(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="shuffle">Modo Aleatório (Shuffle)</Label>
              <Switch
                id="shuffle"
                checked={shuffle}
                onCheckedChange={setShuffle}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando
                </>
              ) : (
                "Criar Playlist"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
