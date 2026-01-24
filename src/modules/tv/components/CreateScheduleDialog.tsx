import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { TvVodItem } from "../types";

interface CreateScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ScheduleFormData) => void;
  isLoading?: boolean;
  vods?: TvVodItem[];
}

export interface ScheduleFormData {
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  source: "live" | "vod";
  vodId?: string;
  isRecurring: boolean;
  recurringDays: number[];
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

export function CreateScheduleDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading,
  vods = []
}: CreateScheduleDialogProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    source: "live",
    vodId: undefined,
    isRecurring: false,
    recurringDays: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const toggleDay = (day: number) => {
    setFormData(prev => ({
      ...prev,
      recurringDays: prev.recurringDays.includes(day)
        ? prev.recurringDays.filter(d => d !== day)
        : [...prev.recurringDays, day].sort()
    }));
  };

  const readyVods = vods.filter(v => v.status === "ready");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Programa</DialogTitle>
          <DialogDescription>
            Agende um programa na grade linear
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nome do programa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do programa"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startAt">Início *</Label>
              <Input
                id="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endAt">Fim *</Label>
              <Input
                id="endAt"
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fonte *</Label>
            <Select 
              value={formData.source} 
              onValueChange={(value: "live" | "vod") => setFormData({ ...formData, source: value })}
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

          {formData.source === "vod" && (
            <div className="space-y-2">
              <Label>Selecionar Vídeo *</Label>
              <Select 
                value={formData.vodId} 
                onValueChange={(value) => setFormData({ ...formData, vodId: value })}
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
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
            />
            <Label htmlFor="recurring">Programa recorrente</Label>
          </div>

          {formData.isRecurring && (
            <div className="space-y-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((day) => (
                  <label 
                    key={day.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={formData.recurringDays.includes(day.value)}
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
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
