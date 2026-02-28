import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BusinessFormData, BUSINESS_CATEGORIES } from '@/constants/businessForm';
import { Building2, Info, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useState, useMemo } from 'react';

interface Props {
  data: BusinessFormData;
  onChange: <K extends keyof BusinessFormData>(key: K, val: BusinessFormData[K]) => void;
}

function cnpjMask(v: string) {
  return v.replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
}

export default function Step1Identification({ data, onChange }: Props) {
  const [catSearch, setCatSearch] = useState('');

  const filtered = useMemo(() => {
    if (!catSearch) return BUSINESS_CATEGORIES;
    const q = catSearch.toLowerCase();
    return BUSINESS_CATEGORIES.filter(c => c.toLowerCase().includes(q));
  }, [catSearch]);

  const toggleSecondary = (cat: string) => {
    if (data.categories_secondary.includes(cat)) {
      onChange('categories_secondary', data.categories_secondary.filter(c => c !== cat));
    } else if (data.categories_secondary.length < 3) {
      onChange('categories_secondary', [...data.categories_secondary, cat]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Identificação da Empresa</h2>
          <p className="text-sm text-muted-foreground">Dados básicos do seu negócio</p>
        </div>
      </div>

      {/* Nome */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="name">Nome da empresa *</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>Use o nome oficial, sem palavras-chave extras</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input id="name" value={data.name} onChange={e => onChange('name', e.target.value)} placeholder="Ex: Padaria Sabor & Arte" maxLength={100} />
        {data.name.length > 0 && data.name.length < 3 && (
          <p className="text-xs text-destructive">Nome muito curto (mín. 3 caracteres)</p>
        )}
      </div>

      {/* CNPJ */}
      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ (opcional)</Label>
        <Input id="cnpj" value={data.cnpj} onChange={e => onChange('cnpj', cnpjMask(e.target.value))} placeholder="00.000.000/0000-00" />
      </div>

      {/* Categoria principal */}
      <div className="space-y-2">
        <Label>Categoria principal *</Label>
        <Input value={catSearch} onChange={e => setCatSearch(e.target.value)} placeholder="Buscar categoria..." className="mb-2" />
        <div className="max-h-40 overflow-y-auto border rounded-md p-2 grid grid-cols-2 sm:grid-cols-3 gap-1">
          {filtered.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => { onChange('category_main', cat); setCatSearch(''); }}
              className={`text-left text-xs px-2 py-1.5 rounded transition-colors ${data.category_main === cat ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-muted'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        {data.category_main && (
          <Badge variant="secondary" className="mt-1">{data.category_main}</Badge>
        )}
      </div>

      {/* Categorias secundárias */}
      <div className="space-y-2">
        <Label>Categorias secundárias (até 3)</Label>
        <div className="flex flex-wrap gap-1.5">
          {BUSINESS_CATEGORIES.filter(c => c !== data.category_main).slice(0, 20).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => toggleSecondary(cat)}
              className={`text-xs px-2 py-1 rounded-full border transition-colors ${data.categories_secondary.includes(cat) ? 'bg-primary/10 border-primary text-primary font-medium' : 'border-border hover:border-primary/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        {data.categories_secondary.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {data.categories_secondary.map(c => (
              <Badge key={c} variant="outline" className="gap-1">
                {c}
                <button type="button" onClick={() => toggleSecondary(c)}><X className="h-3 w-3" /></button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Site */}
      <div className="space-y-2">
        <Label htmlFor="website">Site (opcional)</Label>
        <Input id="website" value={data.website} onChange={e => onChange('website', e.target.value)} placeholder="https://www.minhaempresa.com.br" type="url" />
      </div>

      {/* Ano de fundação */}
      <div className="space-y-2">
        <Label htmlFor="year">Ano de fundação (opcional)</Label>
        <Input id="year" value={data.year_founded} onChange={e => onChange('year_founded', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2020" maxLength={4} />
      </div>
    </div>
  );
}
