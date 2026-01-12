import { useState } from "react";
import { Check, MapPin, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CommunityInterestsModalProps {
  open: boolean;
  onComplete: (interests: string[], city: string) => void;
}

const INTEREST_OPTIONS = [
  { id: "cidade", label: "Cidade", icon: "🏙️", color: "bg-blue-500" },
  { id: "educacao", label: "Educação", icon: "📚", color: "bg-purple-500" },
  { id: "economia", label: "Economia", icon: "💼", color: "bg-green-500" },
  { id: "acessibilidade", label: "Acessibilidade", icon: "♿", color: "bg-orange-500" },
  { id: "direitos_humanos", label: "Direitos Humanos", icon: "⚖️", color: "bg-red-500" },
  { id: "cultura", label: "Cultura", icon: "🎭", color: "bg-pink-500" },
  { id: "meio_ambiente", label: "Meio Ambiente", icon: "🌱", color: "bg-emerald-500" },
  { id: "saude", label: "Saúde", icon: "🏥", color: "bg-cyan-500" },
  { id: "tecnologia", label: "Tecnologia", icon: "💻", color: "bg-indigo-500" },
];

export function CommunityInterestsModal({ open, onComplete }: CommunityInterestsModalProps) {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [city, setCity] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleInterest = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (selectedInterests.length < 2) return;
    
    setIsSubmitting(true);
    try {
      await onComplete(selectedInterests, city);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = selectedInterests.length >= 2;

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Personalize sua experiência
          </DialogTitle>
          <DialogDescription>
            Escolha pelo menos 2 temas de seu interesse para personalizar seu feed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* City Input */}
          <div className="space-y-2">
            <Label htmlFor="city" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Sua cidade (opcional)
            </Label>
            <Input
              id="city"
              placeholder="Ex: São Paulo, SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          {/* Interests Grid */}
          <div className="space-y-2">
            <Label>
              Seus interesses <span className="text-muted-foreground">(mínimo 2)</span>
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const isSelected = selectedInterests.includes(interest.id);
                return (
                  <button
                    key={interest.id}
                    type="button"
                    onClick={() => toggleInterest(interest.id)}
                    className={cn(
                      "relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      isSelected
                        ? "border-primary bg-primary/10"
                        : "border-muted hover:border-muted-foreground/50 hover:bg-muted/50"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-1 right-1">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <span className="text-2xl">{interest.icon}</span>
                    <span className="text-xs font-medium text-center leading-tight">
                      {interest.label}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedInterests.length > 0 && selectedInterests.length < 2 && (
              <p className="text-xs text-muted-foreground">
                Selecione mais {2 - selectedInterests.length} tema(s)
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Salvando..." : "Continuar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
