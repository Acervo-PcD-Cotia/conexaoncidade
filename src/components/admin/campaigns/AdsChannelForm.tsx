import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AdImageUploader } from '@/components/admin/AdImageUploader';
import { SlotPreviewTooltip } from '@/components/admin/campaigns/SlotPreviewTooltip';
import type { AdsChannelConfig } from '@/types/campaigns-unified';
import type { AdFormat } from '@/components/admin/AdImageUploader';

interface AdsChannelFormProps {
  config?: Partial<AdsChannelConfig>;
  onChange: (config: Partial<AdsChannelConfig>) => void;
  assetUrl?: string;
  onAssetChange: (url: string, alt?: string) => void;
}

const SLOT_OPTIONS = [
  { value: 'leaderboard', label: 'Destaque Horizontal', size: '728x90' },
  { value: 'super_banner', label: 'Mega Destaque', size: '970x250' },
  { value: 'rectangle', label: 'Destaque Inteligente', size: '300x250' },
  { value: 'skyscraper', label: 'Painel Vertical', size: '300x600' },
  { value: 'popup', label: 'Alerta Comercial', size: '580x400' },
];

const SLOT_TO_FORMAT: Record<string, AdFormat> = {
  leaderboard: 'leaderboard',
  super_banner: 'home-topo',
  rectangle: 'retangulo-medio',
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
  const format = SLOT_TO_FORMAT[config?.slot_type || 'leaderboard'] || 'leaderboard';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Local do Anúncio</Label>
        <Select
          value={config?.slot_type || 'leaderboard'}
          onValueChange={(value) => {
            const slot = SLOT_OPTIONS.find(s => s.value === value);
            onChange({
              ...config,
              slot_type: value,
              size: slot?.size || '728x90',
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a posição" />
          </SelectTrigger>
          <SelectContent>
            <TooltipProvider delayDuration={200}>
              {SLOT_OPTIONS.map(slot => (
                <SlotPreviewTooltip key={slot.value} slotKey={slot.value}>
                  <SelectItem value={slot.value}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block border border-primary/30 bg-primary/10 rounded-sm"
                        style={{
                          width: Math.round(slot.value === 'skyscraper' ? 10 : (parseInt(slot.size) / parseInt(slot.size)) * 24),
                          height: Math.round(slot.value === 'skyscraper' ? 20 : slot.value === 'leaderboard' ? 4 : 8),
                          minWidth: 16,
                          minHeight: 4,
                        }}
                      />
                      {slot.label} ({slot.size})
                    </span>
                  </SelectItem>
                </SlotPreviewTooltip>
              ))}
            </TooltipProvider>
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
