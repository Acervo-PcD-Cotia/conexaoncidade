import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { CLASSIFIED_CATEGORIES } from "@/hooks/useClassifieds";

interface ClassifiedFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  neighborhood: string;
  onNeighborhoodChange: (value: string) => void;
  onClear: () => void;
}

const NEIGHBORHOODS = [
  'Centro', 'Granja Viana', 'Jardim da Glória', 'Jardim Barbacena', 
  'Parque São George', 'Portão', 'Caucaia do Alto', 'Ressaca',
  'Jardim Atalaia', 'Parque Jandaia', 'Vila Jovina', 'Outros'
];

export function ClassifiedFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  neighborhood,
  onNeighborhoodChange,
  onClear,
}: ClassifiedFiltersProps) {
  const hasFilters = search || category || neighborhood;

  return (
    <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar classificados..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas categorias</SelectItem>
          {CLASSIFIED_CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={neighborhood} onValueChange={onNeighborhoodChange}>
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Bairro" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos bairros</SelectItem>
          {NEIGHBORHOODS.map((n) => (
            <SelectItem key={n} value={n}>
              {n}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  );
}
