import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useCidadesDisponiveis, useBairrosDisponiveis } from "../hooks/useImoveis";
import type { ImovelFilters, ImovelTipo } from "../types";
import { TIPO_LABELS } from "../types";

interface ImovelSearchFiltersProps {
  filters: ImovelFilters;
  onFiltersChange: (filters: ImovelFilters) => void;
  compact?: boolean;
}

const TIPOS: ImovelTipo[] = [
  "casa",
  "apartamento",
  "terreno",
  "comercial",
  "chacara",
  "cobertura",
  "studio",
  "kitnet",
  "galpao",
  "sala_comercial",
];

export function ImovelSearchFilters({
  filters,
  onFiltersChange,
  compact = false,
}: ImovelSearchFiltersProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: cidades = [] } = useCidadesDisponiveis();
  const { data: bairros = [] } = useBairrosDisponiveis(filters.cidade);
  
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.preco_min || 0,
    filters.preco_max || 5000000,
  ]);

  const updateFilter = <K extends keyof ImovelFilters>(
    key: K,
    value: ImovelFilters[K]
  ) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    if (value === undefined || value === null || value === "") {
      params.delete(key);
    } else if (Array.isArray(value)) {
      params.set(key, value.join(","));
    } else {
      params.set(key, String(value));
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    onFiltersChange({});
    setSearchParams({});
    setPriceRange([0, 5000000]);
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0)
  );

  const formatPrice = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    return `R$ ${(value / 1000).toFixed(0)}k`;
  };

  if (compact) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Quick search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar imóveis..."
                value={filters.busca || ""}
                onChange={(e) => updateFilter("busca", e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Finalidade */}
            <Select
              value={filters.finalidade || ""}
              onValueChange={(v) => updateFilter("finalidade", v as "venda" | "aluguel" || undefined)}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Finalidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="venda">Venda</SelectItem>
                <SelectItem value="aluguel">Aluguel</SelectItem>
              </SelectContent>
            </Select>

            {/* Cidade */}
            <Select
              value={filters.cidade || ""}
              onValueChange={(v) => updateFilter("cidade", v || undefined)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Cidade" />
              </SelectTrigger>
              <SelectContent>
                {cidades.map((cidade) => (
                  <SelectItem key={cidade} value={cidade}>
                    {cidade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="mr-1 h-4 w-4" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <SlidersHorizontal className="h-5 w-5" />
          Filtros
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div>
          <Label>Buscar</Label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Palavra-chave..."
              value={filters.busca || ""}
              onChange={(e) => updateFilter("busca", e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Finalidade */}
        <div>
          <Label>Finalidade</Label>
          <Select
            value={filters.finalidade || ""}
            onValueChange={(v) => updateFilter("finalidade", v as "venda" | "aluguel" || undefined)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="venda">Venda</SelectItem>
              <SelectItem value="aluguel">Aluguel</SelectItem>
              <SelectItem value="venda_aluguel">Venda ou Aluguel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cidade */}
        <div>
          <Label>Cidade</Label>
          <Select
            value={filters.cidade || ""}
            onValueChange={(v) => {
              updateFilter("cidade", v || undefined);
              updateFilter("bairro", undefined);
            }}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              {cidades.map((cidade) => (
                <SelectItem key={cidade} value={cidade}>
                  {cidade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bairro */}
        {filters.cidade && bairros.length > 0 && (
          <div>
            <Label>Bairro</Label>
            <Select
              value={filters.bairro?.[0] || ""}
              onValueChange={(v) => updateFilter("bairro", v ? [v] : undefined)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {bairros.map((bairro) => (
                  <SelectItem key={bairro} value={bairro}>
                    {bairro}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tipo */}
        <Accordion type="single" collapsible>
          <AccordionItem value="tipo">
            <AccordionTrigger>Tipo de Imóvel</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-2">
                {TIPOS.map((tipo) => (
                  <div key={tipo} className="flex items-center space-x-2">
                    <Checkbox
                      id={tipo}
                      checked={filters.tipo?.includes(tipo)}
                      onCheckedChange={(checked) => {
                        const current = filters.tipo || [];
                        if (checked) {
                          updateFilter("tipo", [...current, tipo]);
                        } else {
                          updateFilter(
                            "tipo",
                            current.filter((t) => t !== tipo)
                          );
                        }
                      }}
                    />
                    <label
                      htmlFor={tipo}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {TIPO_LABELS[tipo]}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Price Range */}
        <div>
          <Label>Faixa de Preço</Label>
          <div className="mt-4 px-2">
            <Slider
              value={priceRange}
              min={0}
              max={5000000}
              step={50000}
              onValueChange={(value) => {
                setPriceRange(value as [number, number]);
              }}
              onValueCommit={(value) => {
                updateFilter("preco_min", value[0] > 0 ? value[0] : undefined);
                updateFilter("preco_max", value[1] < 5000000 ? value[1] : undefined);
              }}
            />
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatPrice(priceRange[0])}</span>
              <span>{formatPrice(priceRange[1])}</span>
            </div>
          </div>
        </div>

        {/* Quartos */}
        <div>
          <Label>Quartos (mínimo)</Label>
          <Select
            value={String(filters.quartos_min || "")}
            onValueChange={(v) => updateFilter("quartos_min", v ? Number(v) : undefined)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
              <SelectItem value="5">5+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Banheiros */}
        <div>
          <Label>Banheiros (mínimo)</Label>
          <Select
            value={String(filters.banheiros_min || "")}
            onValueChange={(v) => updateFilter("banheiros_min", v ? Number(v) : undefined)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vagas */}
        <div>
          <Label>Vagas (mínimo)</Label>
          <Select
            value={String(filters.vagas_min || "")}
            onValueChange={(v) => updateFilter("vagas_min", v ? Number(v) : undefined)}
          >
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Qualquer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Extra filters */}
        <Accordion type="single" collapsible>
          <AccordionItem value="extras">
            <AccordionTrigger>Filtros Adicionais</AccordionTrigger>
            <AccordionContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="financiamento"
                  checked={filters.aceita_financiamento}
                  onCheckedChange={(checked) =>
                    updateFilter("aceita_financiamento", checked ? true : undefined)
                  }
                />
                <label htmlFor="financiamento" className="text-sm">
                  Aceita financiamento
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="condominio"
                  checked={filters.is_condominio}
                  onCheckedChange={(checked) =>
                    updateFilter("is_condominio", checked ? true : undefined)
                  }
                />
                <label htmlFor="condominio" className="text-sm">
                  Em condomínio
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="destaque"
                  checked={filters.destaque}
                  onCheckedChange={(checked) =>
                    updateFilter("destaque", checked ? true : undefined)
                  }
                />
                <label htmlFor="destaque" className="text-sm">
                  Apenas destaques
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lancamento"
                  checked={filters.lancamento}
                  onCheckedChange={(checked) =>
                    updateFilter("lancamento", checked ? true : undefined)
                  }
                />
                <label htmlFor="lancamento" className="text-sm">
                  Lançamentos
                </label>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Clear */}
        {hasActiveFilters && (
          <Button variant="outline" className="w-full" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Limpar filtros
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
