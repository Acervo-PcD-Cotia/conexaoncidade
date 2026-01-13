import { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, School, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { useSchoolAutocomplete } from "@/hooks/useSchools";
import { Badge } from "@/components/ui/badge";

interface SchoolAutocompleteProps {
  value?: string;
  onSelect: (schoolId: string, schoolData?: { nome_oficial: string; rede: string; bairro: string }) => void;
  rede?: string;
  placeholder?: string;
  disabled?: boolean;
  onNotFound?: () => void;
  className?: string;
}

export function SchoolAutocomplete({
  value,
  onSelect,
  rede,
  placeholder = "Selecione uma escola...",
  disabled = false,
  onNotFound,
  className,
}: SchoolAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: schools, isLoading } = useSchoolAutocomplete(search, rede);
  
  const selectedSchool = schools?.find(s => s.id === value);

  const redeLabels: Record<string, string> = {
    municipal: "Municipal",
    estadual: "Estadual",
    particular: "Particular",
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Selecionar escola"
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <div className="flex items-center gap-2 truncate">
            <School className="h-4 w-4 shrink-0" />
            {selectedSchool ? (
              <span className="truncate">{selectedSchool.nome_oficial}</span>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            ref={inputRef}
            placeholder="Digite o nome da escola..."
            value={search}
            onValueChange={setSearch}
            aria-label="Buscar escola"
          />
          <CommandList>
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Buscando escolas...
              </div>
            ) : search.length < 2 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Digite pelo menos 2 caracteres para buscar
              </div>
            ) : schools?.length === 0 ? (
              <CommandEmpty className="py-6">
                <p className="text-sm text-muted-foreground">
                  Nenhuma escola encontrada.
                </p>
                {onNotFound && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-primary"
                    onClick={() => {
                      setOpen(false);
                      onNotFound();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Não encontrei minha escola
                  </Button>
                )}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {schools?.map((school) => (
                  <CommandItem
                    key={school.id}
                    value={school.id}
                    onSelect={() => {
                      onSelect(school.id, {
                        nome_oficial: school.nome_oficial,
                        rede: school.rede,
                        bairro: school.bairro,
                      });
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Check
                        className={cn(
                          "h-4 w-4 shrink-0",
                          value === school.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col min-w-0">
                        <span className="truncate font-medium">
                          {school.nome_oficial}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {school.bairro}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="ml-2 shrink-0">
                      {redeLabels[school.rede] || school.rede}
                    </Badge>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {onNotFound && schools && schools.length > 0 && (
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground hover:text-primary"
                  onClick={() => {
                    setOpen(false);
                    onNotFound();
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Não encontrei minha escola
                </Button>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
