import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AdImageUploader } from '@/components/admin/AdImageUploader';
import { SlotPreviewTooltip } from '@/components/admin/campaigns/SlotPreviewTooltip';
import type { AdsChannelConfig } from '@/types/campaigns-unified';
import type { AdFormat } from '@/components/admin/AdImageUploader';
import { getSlotsForChannel, type AdSlot } from '@/lib/adSlots';

interface AdsChannelFormProps {
  config?: Partial<AdsChannelConfig>;
  onChange: (config: Partial<AdsChannelConfig>) => void;
  assetUrl?: string;
  onAssetChange: (url: string, alt?: string) => void;
}

const ADS_SLOTS = getSlotsForChannel('ads');

const SLOT_TO_FORMAT: Record<string, AdFormat> = {
  leaderboard: 'leaderboard',
  super_banner: 'home-topo',
  retangulo_medio: 'retangulo-medio',
  arranha_ceu: 'arranha-ceu',
  popup: 'popup',
};

export function AdsChannelForm({
  config,
  onChange,
  assetUrl,
  onAssetChange,
}: AdsChannelFormProps) {
  const selectedSlot = ADS_SLOTS.find(s => s.id === config?.slot_type);
  const format = SLOT_TO_FORMAT[config?.slot_type || 'leaderboard'] || 'leaderboard';

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Local do Anúncio</Label>
        <Select
          value={config?.slot_type || 'leaderboard'}
          onValueChange={(value) => {
            const slot = ADS_SLOTS.find(s => s.id === value);
            onChange({
              ...config,
              slot_type: value,
              size: slot?.key || '728x90',
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a posição" />
          </SelectTrigger>
          <SelectContent>
            <TooltipProvider delayDuration={200}>
              {ADS_SLOTS.map(slot => (
                <SlotPreviewTooltip key={slot.id} slotKey={slot.id}>
                  <SelectItem value={slot.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block border border-primary/30 bg-primary/10 rounded-sm"
                        style={{
                          width: Math.round(slot.placement === 'sidebar' ? 10 : 24),
                          height: Math.round(slot.placement === 'sidebar' ? 20 : slot.placement === 'top' && slot.height <= 90 ? 4 : 8),
                          minWidth: 16,
                          minHeight: 4,
                        }}
                      />
                      {slot.label} ({slot.key})
                    </span>
                  </SelectItem>
                </SlotPreviewTooltip>
              ))}
            </TooltipProvider>
          </SelectContent>
        </Select>
        {selectedSlot && (
          <p className="text-xs text-muted-foreground">
            Tamanho: {selectedSlot.key}
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
