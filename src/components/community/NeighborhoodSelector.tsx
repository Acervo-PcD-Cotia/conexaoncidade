import { useState } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Bairros de Cotia - lista completa
const COTIA_NEIGHBORHOODS = [
  "Centro",
  "Granja Viana",
  "Jardim da Glória",
  "Jardim Barbacena",
  "Jardim Atalaia",
  "Jardim Japão",
  "Jardim Sandra",
  "Jardim Nomura",
  "Jardim Semiramis",
  "Jardim Passárgada",
  "Jardim Monte Verde",
  "Jardim Petrópolis",
  "Parque Viana",
  "Parque Industrial San José",
  "Portão",
  "Ressaca",
  "Carapicuíba (divisa)",
  "Caucaia do Alto",
  "Raposo Tavares",
  "Morro Grande",
  "Lajeado",
  "Atalaia",
  "Tijuco Preto",
  "Roselândia",
  "Vila São João",
  "Vila São Joaquim",
  "Jd. Coimbra",
  "Jd. Lavínia",
  "Jd. Roseira",
  "Cond. San Conrado",
  "Cond. Granja Vianna",
  "Cond. Jardim Passárgada",
  "Outro",
];

interface NeighborhoodSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function NeighborhoodSelector({ value, onChange, className }: NeighborhoodSelectorProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            {value || "Selecione seu bairro"}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar bairro..." />
          <CommandList>
            <CommandEmpty>Bairro não encontrado.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-y-auto">
              {COTIA_NEIGHBORHOODS.map((neighborhood) => (
                <CommandItem
                  key={neighborhood}
                  value={neighborhood}
                  onSelect={() => {
                    onChange(neighborhood);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === neighborhood ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {neighborhood}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
