import { useState } from "react";
import { Code, Loader2 } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateRadioPlayer } from "../hooks/useRadioPlayers";
import { toast } from "sonner";
import type { RadioPlayerEmbed } from "../types";

interface CreatePlayerDialogProps {
  trigger?: React.ReactNode;
}

const playerKinds = [
  { value: "bar", label: "Barra (fixo no topo/rodapé)" },
  { value: "popup", label: "Popup (janela flutuante)" },
  { value: "floating", label: "Flutuante (canto da tela)" },
  { value: "html5", label: "HTML5 (inline)" },
  { value: "minimal", label: "Mínimo (apenas botão)" },
];

const playerThemes = [
  { value: "light", label: "Claro" },
  { value: "dark", label: "Escuro" },
  { value: "auto", label: "Automático (sistema)" },
];

export function CreatePlayerDialog({ trigger }: CreatePlayerDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<RadioPlayerEmbed["kind"]>("html5");
  const [theme, setTheme] = useState<RadioPlayerEmbed["theme"]>("auto");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");

  const generateMutation = useGenerateRadioPlayer();

  const resetForm = () => {
    setName("");
    setKind("html5");
    setTheme("auto");
    setPrimaryColor("#3b82f6");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Nome do player é obrigatório");
      return;
    }

    try {
      await generateMutation.mutateAsync({
        name,
        kind,
        theme,
        primaryColor,
      });
      
      toast.success("Player gerado com sucesso!");
      setOpen(false);
      resetForm();
    } catch {
      toast.error("Erro ao gerar player");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Code className="h-4 w-4" />
            Gerar Player
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Gerar Novo Player
          </DialogTitle>
          <DialogDescription>
            Crie um player personalizado para incorporar em sites e aplicações.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Player</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Player Site Principal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kind">Tipo</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as RadioPlayerEmbed["kind"])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {playerKinds.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as RadioPlayerEmbed["theme"])}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tema" />
              </SelectTrigger>
              <SelectContent>
                {playerThemes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Cor Primária</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-14 h-10 p-1 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#3b82f6"
                className="flex-1 font-mono"
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
            <Button type="submit" disabled={generateMutation.isPending}>
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando
                </>
              ) : (
                "Gerar Player"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
