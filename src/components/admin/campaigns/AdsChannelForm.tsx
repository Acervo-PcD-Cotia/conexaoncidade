import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdImageUploader } from '@/components/admin/AdImageUploader';
import type { AdsChannelConfig } from '@/types/campaigns-unified';
import type { AdFormat } from '@/components/admin/AdImageUploader';

interface AdsChannelFormProps {
  config?: Partial<AdsChannelConfig>;
  onChange: (config: Partial<AdsChannelConfig>) => void;
  assetUrl?: string;
  onAssetChange: (url: string, alt?: string) => void;
}

const SLOT_OPTIONS = [
  { value: 'home_top', label: 'Mega Destaque — Topo', size: '970x250' },
  { value: 'home_banner', label: 'Mega Destaque — Home', size: '970x250' },
  { value: 'super_banner', label: 'Mega Destaque', size: '970x250' },
  { value: 'rectangle', label: 'Destaque Inteligente', size: '300x250' },
  { value: 'rectangle_sidebar', label: 'Destaque Inteligente — Sidebar', size: '300x250' },
  { value: 'skyscraper', label: 'Painel Vertical', size: '300x600' },
  { value: 'popup', label: 'Alerta Comercial', size: '580x400' },
];

const SLOT_TO_FORMAT: Record<string, AdFormat> = {
  home_top: 'home-topo',
  home_banner: 'home-topo',
  super_banner: 'home-topo',
  rectangle: 'retangulo-medio',
  rectangle_sidebar: 'retangulo-medio',
  skyscraper: 'arranha-ceu',
  popup: 'popup',
};

export function AdsChannelForm({
  config,
  onChange,
  assetUrl,
  onAssetChange,
}: AdsChannelFormProps) {
  const selectedSlot = SLOT_OPTIONS.find(s => s.value === config?.slot_type);
  const format = SLOT_TO_FORMAT[config?.slot_type || 'home_top'] || 'home-topo';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Local do Anúncio</Label>
        <Select
          value={config?.slot_type || 'home_top'}
          onValueChange={(value) => {
            const slot = SLOT_OPTIONS.find(s => s.value === value);
            onChange({
              ...config,
              slot_type: value,
              size: slot?.size || '970x250',
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a posição" />
          </SelectTrigger>
          <SelectContent>
            {SLOT_OPTIONS.map(slot => (
              <SelectItem key={slot.value} value={slot.value}>
                {slot.label} ({slot.size})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedSlot && (
          <p className="text-xs text-muted-foreground">
            Tamanho: {selectedSlot.size}
          </p>
        )}
      </div>

      <AdImageUploader
        value={assetUrl || ''}
        onChange={(url) => onAssetChange(url)}
        onAltChange={(alt) => onAssetChange(assetUrl || '', alt)}
        format={format}
        label="Imagem do Banner"
        required
      />
    </div>
  );
}
