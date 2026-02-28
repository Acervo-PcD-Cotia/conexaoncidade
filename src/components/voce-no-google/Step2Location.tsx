import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { BusinessFormData } from '@/constants/businessForm';
import { MapPin, Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

interface Props {
  data: BusinessFormData;
  onChange: <K extends keyof BusinessFormData>(key: K, val: BusinessFormData[K]) => void;
}

function phoneMask(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
}

export default function Step2Location({ data, onChange }: Props) {
  const [cepLoading, setCepLoading] = useState(false);

  const showAddress = data.business_type === 'physical' || data.business_type === 'both';
  const showAreas = data.business_type === 'delivery' || data.business_type === 'both';

  const fetchCep = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data2 = await res.json();
      if (!data2.erro) {
        onChange('address', data2.logradouro || '');
        onChange('neighborhood', data2.bairro || '');
        onChange('city', data2.localidade || '');
        onChange('state', data2.uf || '');
      }
    } catch { /* noop */ }
    setCepLoading(false);
  };

  const handleCep = (v: string) => {
    const masked = v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
    onChange('cep', masked);
    if (masked.replace(/\D/g, '').length === 8) fetchCep(masked);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Localização</h2>
          <p className="text-sm text-muted-foreground">NAP Canônico — Nome, Endereço, Telefone</p>
        </div>
      </div>

      {/* Tipo de negócio */}
      <div className="space-y-3">
        <Label>Tipo de negócio *</Label>
        <RadioGroup value={data.business_type} onValueChange={v => onChange('business_type', v as any)}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="physical" id="bt-physical" />
            <Label htmlFor="bt-physical" className="font-normal">Tenho endereço físico</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="delivery" id="bt-delivery" />
            <Label htmlFor="bt-delivery" className="font-normal">Atendo em domicílio / área</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="both" id="bt-both" />
            <Label htmlFor="bt-both" className="font-normal">Ambos</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Endereço */}
      {showAddress && (
        <div className="space-y-4 p-4 rounded-lg border bg-muted/30">
          <p className="text-sm font-semibold text-foreground">Endereço</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <div className="relative">
                <Input id="cep" value={data.cep} onChange={e => handleCep(e.target.value)} placeholder="00000-000" />
                {cepLoading && <span className="absolute right-2 top-2.5 text-xs text-muted-foreground animate-pulse">Buscando...</span>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">UF</Label>
              <Input id="state" value={data.state} onChange={e => onChange('state', e.target.value.toUpperCase().slice(0, 2))} placeholder="SP" maxLength={2} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Logradouro *</Label>
            <Input id="address" value={data.address} onChange={e => onChange('address', e.target.value)} placeholder="Rua, Avenida..." />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input id="number" value={data.number} onChange={e => onChange('number', e.target.value)} placeholder="123" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input id="complement" value={data.complement} onChange={e => onChange('complement', e.target.value)} placeholder="Sala 2, Bloco A" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input id="neighborhood" value={data.neighborhood} onChange={e => onChange('neighborhood', e.target.value)} placeholder="Centro" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Cidade *</Label>
              <Input id="city" value={data.city} onChange={e => onChange('city', e.target.value)} placeholder="Cotia" />
            </div>
          </div>
        </div>
      )}

      {/* Áreas atendidas */}
      {showAreas && (
        <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
          <Label>Cidades/bairros atendidos</Label>
          <Input
            placeholder="Digite e pressione Enter para adicionar"
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const v = (e.target as HTMLInputElement).value.trim();
                if (v && !data.service_areas.includes(v)) {
                  onChange('service_areas', [...data.service_areas, v]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
          <div className="flex flex-wrap gap-1">
            {data.service_areas.map((a, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                {a}
                <button type="button" onClick={() => onChange('service_areas', data.service_areas.filter((_, j) => j !== i))} className="hover:text-destructive">×</button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Contato */}
      <div className="space-y-4">
        <p className="text-sm font-semibold text-foreground">Contato</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone principal *</Label>
            <Input id="phone" value={data.phone} onChange={e => onChange('phone', phoneMask(e.target.value))} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="flex items-center gap-1.5">
                <Checkbox 
                  id="same-number" 
                  checked={data.whatsapp_same} 
                  onCheckedChange={v => {
                    onChange('whatsapp_same', !!v);
                    if (v) onChange('whatsapp', data.phone);
                  }} 
                />
                <label htmlFor="same-number" className="text-xs text-muted-foreground cursor-pointer">Mesmo número</label>
              </div>
            </div>
            <Input 
              id="whatsapp" 
              value={data.whatsapp_same ? data.phone : data.whatsapp} 
              onChange={e => onChange('whatsapp', phoneMask(e.target.value))} 
              placeholder="(11) 99999-9999" 
              disabled={data.whatsapp_same}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail de contato *</Label>
          <Input id="email" type="email" value={data.email} onChange={e => onChange('email', e.target.value)} placeholder="contato@empresa.com" />
        </div>
      </div>
    </div>
  );
}
