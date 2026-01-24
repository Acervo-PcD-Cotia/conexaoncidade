import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { TvPlayerEmbed } from "../types";

interface CreatePlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PlayerFormData) => void;
  isLoading?: boolean;
}

export interface PlayerFormData {
  name: string;
  kind: TvPlayerEmbed["kind"];
  theme: TvPlayerEmbed["theme"];
  autoplay: boolean;
  muted: boolean;
  controls: boolean;
}

export function CreatePlayerDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  isLoading 
}: CreatePlayerDialogProps) {
  const [formData, setFormData] = useState<PlayerFormData>({
    name: "",
    kind: "responsive",
    theme: "dark",
    autoplay: false,
    muted: false,
    controls: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      kind: "responsive",
      theme: "dark",
      autoplay: false,
      muted: false,
      controls: true,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) resetForm();
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Novo Player</DialogTitle>
          <DialogDescription>
            Configure um player embed para seu site ou aplicativo
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Player *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Player Principal, Widget Sidebar..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Player</Label>
            <Select 
              value={formData.kind} 
              onValueChange={(value: TvPlayerEmbed["kind"]) => setFormData({ ...formData, kind: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="responsive">Responsivo</SelectItem>
                <SelectItem value="hls">HLS Nativo</SelectItem>
                <SelectItem value="iframe">iFrame</SelectItem>
                <SelectItem value="smarttv">Smart TV</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.kind === "responsive" && "Adapta-se automaticamente ao container"}
              {formData.kind === "hls" && "Player nativo HLS.js para melhor performance"}
              {formData.kind === "iframe" && "Embed simples via iFrame"}
              {formData.kind === "smarttv" && "Otimizado para Smart TVs e set-top boxes"}
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tema Visual</Label>
            <Select 
              value={formData.theme} 
              onValueChange={(value: TvPlayerEmbed["theme"]) => setFormData({ ...formData, theme: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="auto">Automático (Sistema)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoplay">Autoplay</Label>
                <p className="text-xs text-muted-foreground">Iniciar reprodução automaticamente</p>
              </div>
              <Switch
                id="autoplay"
                checked={formData.autoplay}
                onCheckedChange={(checked) => setFormData({ ...formData, autoplay: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="muted">Iniciar Mudo</Label>
                <p className="text-xs text-muted-foreground">Necessário para autoplay em alguns navegadores</p>
              </div>
              <Switch
                id="muted"
                checked={formData.muted}
                onCheckedChange={(checked) => setFormData({ ...formData, muted: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="controls">Exibir Controles</Label>
                <p className="text-xs text-muted-foreground">Play/pause, volume, fullscreen</p>
              </div>
              <Switch
                id="controls"
                checked={formData.controls}
                onCheckedChange={(checked) => setFormData({ ...formData, controls: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!formData.name || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gerar Player
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
