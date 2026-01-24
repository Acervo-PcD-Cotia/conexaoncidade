import { useState, useEffect } from "react";
import { ListMusic, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioPlaylist } from "../types";

interface EditPlaylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  playlist: RadioPlaylist | null;
  onSubmit: (data: Partial<RadioPlaylist>) => Promise<void>;
  isSubmitting?: boolean;
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

export function EditPlaylistDialog({
  open,
  onOpenChange,
  playlist,
  onSubmit,
  isSubmitting,
}: EditPlaylistDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("18:00");
  const [noRepeatArtist, setNoRepeatArtist] = useState(30);
  const [noRepeatTrack, setNoRepeatTrack] = useState(120);
  const [shuffle, setShuffle] = useState(true);

  useEffect(() => {
    if (playlist) {
      setName(playlist.name);
      setDescription(playlist.description || "");
      setSelectedDays(playlist.schedule.days);
      setStartTime(playlist.schedule.startTime);
      setEndTime(playlist.schedule.endTime);
      setNoRepeatArtist(playlist.rules.noRepeatArtistMins);
      setNoRepeatTrack(playlist.rules.noRepeatTrackMins);
      setShuffle(playlist.rules.shuffle);
    }
  }, [playlist]);

  const toggleDay = (day: number) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" />
            Editar Playlist
          </DialogTitle>
          <DialogDescription>
            Modifique os horários e regras de reprodução.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nome da Playlist</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Manhãs Animadas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição (opcional)</Label>
            <Textarea
              id="edit-description"
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
              <Label htmlFor="edit-startTime">Hora Início</Label>
              <Input
                id="edit-startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endTime">Hora Fim</Label>
              <Input
                id="edit-endTime"
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
                <Label htmlFor="edit-noRepeatArtist">Não repetir artista (min)</Label>
                <Input
                  id="edit-noRepeatArtist"
                  type="number"
                  min={0}
                  max={180}
                  value={noRepeatArtist}
                  onChange={(e) => setNoRepeatArtist(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-noRepeatTrack">Não repetir música (min)</Label>
                <Input
                  id="edit-noRepeatTrack"
                  type="number"
                  min={0}
                  max={360}
                  value={noRepeatTrack}
                  onChange={(e) => setNoRepeatTrack(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="edit-shuffle">Modo Aleatório (Shuffle)</Label>
              <Switch
                id="edit-shuffle"
                checked={shuffle}
                onCheckedChange={setShuffle}
              />
            </div>
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
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
