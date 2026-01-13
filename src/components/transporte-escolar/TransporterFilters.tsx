import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export interface TransporterFiltersState {
  rede?: string;
  bairro?: string;
  turno?: string;
  acessibilidade?: boolean;
}

interface TransporterFiltersProps {
  filters: TransporterFiltersState;
  onChange: (filters: TransporterFiltersState) => void;
  onClear: () => void;
}

const REDES = [
  { value: "municipal", label: "Municipal" },
  { value: "estadual", label: "Estadual" },
  { value: "particular", label: "Particular" },
];

const TURNOS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "integral", label: "Integral" },
];

const BAIRROS_COTIA = [
  "Centro", "Granja Viana", "Caucaia do Alto", "Jardim Atalaia", "Jardim Barbacena",
  "Jardim da Glória", "Jardim Nomura", "Parque São George", "Portão", "Ressaca"
];

export function TransporterFilters({ filters, onChange, onClear }: TransporterFiltersProps) {
  const hasFilters = filters.rede || filters.bairro || filters.turno || filters.acessibilidade;

  const updateFilter = <K extends keyof TransporterFiltersState>(
    key: K,
    value: TransporterFiltersState[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Filtros</h3>
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="filter-rede">Rede da escola</Label>
          <Select
            value={filters.rede || "all"}
            onValueChange={(v) => updateFilter("rede", v === "all" ? undefined : v)}
          >
            <SelectTrigger id="filter-rede">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {REDES.map(rede => (
                <SelectItem key={rede.value} value={rede.value}>
                  {rede.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-bairro">Bairro</Label>
          <Select
            value={filters.bairro || "all"}
            onValueChange={(v) => updateFilter("bairro", v === "all" ? undefined : v)}
          >
            <SelectTrigger id="filter-bairro">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {BAIRROS_COTIA.map(bairro => (
                <SelectItem key={bairro} value={bairro}>
                  {bairro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="filter-turno">Turno</Label>
          <Select
            value={filters.turno || "all"}
            onValueChange={(v) => updateFilter("turno", v === "all" ? undefined : v)}
          >
            <SelectTrigger id="filter-turno">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {TURNOS.map(turno => (
                <SelectItem key={turno.value} value={turno.value}>
                  {turno.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end pb-2">
          <div className="flex items-center space-x-2">
            <Switch
              id="filter-acessibilidade"
              checked={filters.acessibilidade || false}
              onCheckedChange={(checked) => updateFilter("acessibilidade", checked || undefined)}
            />
            <Label htmlFor="filter-acessibilidade" className="cursor-pointer">
              Acessibilidade
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}