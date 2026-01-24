import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TvVodItem, TvScheduleItem } from "../types";

interface EditScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TvScheduleItem | null;
  onSubmit: (data: Partial<TvScheduleItem>) => void;
  isLoading?: boolean;
  vods?: TvVodItem[];
}

const dayOptions = [
  { value: 0, label: "Domingo" },
  { value: 1, label: "Segunda" },
  { value: 2, label: "Terça" },
  { value: 3, label: "Quarta" },
  { value: 4, label: "Quinta" },
  { value: 5, label: "Sexta" },
  { value: 6, label: "Sábado" },
];

export function EditScheduleDialog({ 
  open, 
  onOpenChange, 
  item,
  onSubmit, 
  isLoading,
  vods = []
}: EditScheduleDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [source, setSource] = useState<"live" | "vod">("live");
  const [vodId, setVodId] = useState<string | undefined>(undefined);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<number[]>([]);

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setStartAt(item.startAt.slice(0, 16));
      setEndAt(item.endAt.slice(0, 16));
      setSource(item.source);
      setVodId(item.vodId);
      setIsRecurring(item.isRecurring);
      setRecurringDays(item.recurringPattern?.days || []);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      startAt,
      endAt,
      source,
      vodId: source === "vod" ? vodId : undefined,
      isRecurring,
      recurringPattern: isRecurring ? {
        days: recurringDays,
        startTime: startAt.split("T")[1] || "00:00",
        endTime: endAt.split("T")[1] || "00:00",
      } : undefined,
    });
  };

  const toggleDay = (day: number) => {
    setRecurringDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const readyVods = vods.filter(v => v.status === "ready");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Programa</DialogTitle>
          <DialogDescription>
            Modifique as informações do programa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título *</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome do programa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição do programa"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startAt">Início *</Label>
              <Input
                id="edit-startAt"
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-endAt">Fim *</Label>
              <Input
                id="edit-endAt"
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fonte *</Label>
            <Select 
              value={source} 
              onValueChange={(value: "live" | "vod") => setSource(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="live">Transmissão Ao Vivo</SelectItem>
                <SelectItem value="vod">Vídeo da Biblioteca (VOD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {source === "vod" && (
            <div className="space-y-2">
              <Label>Selecionar Vídeo *</Label>
              <Select 
                value={vodId} 
                onValueChange={setVodId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um vídeo" />
                </SelectTrigger>
                <SelectContent>
                  {readyVods.map((vod) => (
                    <SelectItem key={vod.id} value={vod.id}>
                      {vod.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch
              id="edit-recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="edit-recurring">Programa recorrente</Label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <label 
                    key={day.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={recurringDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <span className="text-sm">{day.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

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
