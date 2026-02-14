import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AdImageUploader } from '@/components/admin/AdImageUploader';

interface FloatingAdChannelFormProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  assetUrl: string;
  onAssetChange: (url: string, alt?: string) => void;
}

export function FloatingAdChannelForm({ config, onChange, assetUrl, onAssetChange }: FloatingAdChannelFormProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <strong className="text-foreground">Destaque Flutuante (300×600)</strong> — Banner lateral fixo na tela. Permanece visível ao rolar a página.
      </div>

      <AdImageUploader
        value={assetUrl}
        onChange={(url) => onAssetChange(url)}
        format="arranha-ceu"
        label="Imagem do Destaque Flutuante"
      />

      <div className="space-y-2">
        <Label className="text-xs">Posição na Tela</Label>
        <RadioGroup
          value={(config?.position as string) || 'right'}
          onValueChange={(val) => onChange({ ...config, position: val })}
          className="flex gap-4"
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="right" id="float-right" />
            <Label htmlFor="float-right" className="text-sm cursor-pointer">Direita</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="left" id="float-left" />
            <Label htmlFor="float-left" className="text-sm cursor-pointer">Esquerda</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Texto do CTA</Label>
          <Input
            value={(config?.cta_text as string) || ''}
            onChange={(e) => onChange({ ...config, cta_text: e.target.value })}
            placeholder="Saiba mais"
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">URL do CTA</Label>
          <Input
            value={(config?.cta_url as string) || ''}
            onChange={(e) => onChange({ ...config, cta_url: e.target.value })}
            placeholder="https://..."
            className="text-sm"
          />
        </div>
      </div>
    </div>
  );
}
