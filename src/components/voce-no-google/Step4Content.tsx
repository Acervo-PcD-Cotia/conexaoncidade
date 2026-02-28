import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { BusinessFormData } from '@/constants/businessForm';
import { FileText, Plus, X, Instagram, Facebook, MapPin } from 'lucide-react';

interface Props {
  data: BusinessFormData;
  onChange: <K extends keyof BusinessFormData>(key: K, val: BusinessFormData[K]) => void;
}

export default function Step4Content({ data, onChange }: Props) {
  const [newService, setNewService] = useState('');

  const addService = () => {
    const v = newService.trim();
    if (v && !data.services.includes(v)) {
      onChange('services', [...data.services, v]);
      setNewService('');
    }
  };

  const removeService = (i: number) => {
    onChange('services', data.services.filter((_, j) => j !== i));
  };

  const descLen = data.description_full.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Conteúdo e Mídia</h2>
          <p className="text-sm text-muted-foreground">Descreva sua empresa e adicione links</p>
        </div>
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="desc">Descrição da empresa *</Label>
          <span className={`text-xs ${descLen < 150 ? 'text-destructive' : descLen > 600 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {descLen}/600
          </span>
        </div>
        <Textarea
          id="desc"
          value={data.description_full}
          onChange={e => onChange('description_full', e.target.value.slice(0, 600))}
          placeholder="Descreva sua empresa, seus principais serviços e a cidade onde atua..."
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          💡 Dica: Mencione seus principais serviços e cidade para melhorar o SEO
        </p>
        {descLen > 0 && descLen < 150 && (
          <p className="text-xs text-destructive">Mínimo de 150 caracteres ({150 - descLen} restantes)</p>
        )}
      </div>

      {/* Serviços */}
      <div className="space-y-3">
        <Label>Serviços oferecidos</Label>
        <div className="flex gap-2">
          <Input
            value={newService}
            onChange={e => setNewService(e.target.value)}
            placeholder="Ex: Corte masculino"
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
          />
          <Button type="button" variant="outline" size="icon" onClick={addService} disabled={!newService.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {data.services.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.services.map((s, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full bg-muted border">
                {s}
                <button type="button" onClick={() => removeService(i)} className="hover:text-destructive ml-1">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Links sociais */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Links e redes sociais</Label>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="gmaps" className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5" /> Google Maps / Google Meu Negócio
            </Label>
            <Input id="gmaps" value={data.google_maps_url} onChange={e => onChange('google_maps_url', e.target.value)} placeholder="https://maps.google.com/..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insta" className="flex items-center gap-1.5 text-sm">
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </Label>
            <Input id="insta" value={data.instagram} onChange={e => onChange('instagram', e.target.value)} placeholder="https://instagram.com/suaempresa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fb" className="flex items-center gap-1.5 text-sm">
              <Facebook className="h-3.5 w-3.5" /> Facebook
            </Label>
            <Input id="fb" value={data.facebook} onChange={e => onChange('facebook', e.target.value)} placeholder="https://facebook.com/suaempresa" />
          </div>
        </div>
      </div>
    </div>
  );
}
