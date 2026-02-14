import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { AdImageUploader } from '@/components/admin/AdImageUploader';

interface BannerIntroChannelFormProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  assetUrl: string;
  onAssetChange: (url: string, alt?: string) => void;
}

export function BannerIntroChannelForm({ config, onChange, assetUrl, onAssetChange }: BannerIntroChannelFormProps) {
  return (
    <div className="space-y-4">
      <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
        <strong className="text-foreground">Banner Intro (970×250)</strong> — Exibido na primeira dobra da Home, entre o Super Banner e o conteúdo principal.
      </div>

      <AdImageUploader
        value={assetUrl}
        onChange={(url) => onAssetChange(url)}
        format="home-topo"
        label="Imagem do Banner Intro"
      />

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
