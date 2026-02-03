import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdImageUploader } from '@/components/admin/AdImageUploader';
import type { ExitIntentChannelConfig } from '@/types/campaigns-unified';

interface ExitIntentChannelFormProps {
  config?: Partial<ExitIntentChannelConfig>;
  onChange: (config: Partial<ExitIntentChannelConfig>) => void;
  heroAssetUrl?: string;
  onHeroAssetChange?: (url: string, alt?: string) => void;
  secondary1AssetUrl?: string;
  onSecondary1AssetChange?: (url: string, alt?: string) => void;
  secondary2AssetUrl?: string;
  onSecondary2AssetChange?: (url: string, alt?: string) => void;
}

export function ExitIntentChannelForm({ 
  config, 
  onChange,
  heroAssetUrl = '',
  onHeroAssetChange,
  secondary1AssetUrl = '',
  onSecondary1AssetChange,
  secondary2AssetUrl = '',
  onSecondary2AssetChange,
}: ExitIntentChannelFormProps) {
  const updateConfig = (key: keyof ExitIntentChannelConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  const heroType = config?.hero_type || 'banner';

  return (
    <div className="space-y-4">
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
        <strong>Exit-Intent Modal:</strong> Exibido quando o usuário demonstra intenção de sair (1x por sessão).
      </div>

      {/* Layout visual */}
      <div className="border rounded-lg p-4 bg-muted/30">
        <p className="text-xs text-muted-foreground mb-3">Prévia do layout:</p>
        <div className="space-y-2">
          <div className="h-20 bg-primary/10 rounded flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-primary/30">
            HERO ({heroType === 'publidoor' ? 'Publidoor' : 'Banner Grande'})
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="h-14 bg-secondary/30 rounded flex items-center justify-center text-xs text-muted-foreground border border-dashed">
              Secundário 1
            </div>
            <div className="h-14 bg-secondary/30 rounded flex items-center justify-center text-xs text-muted-foreground border border-dashed">
              Secundário 2
            </div>
          </div>
          <div className="h-8 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
            [ CTA Neutro ]
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Tipo do Hero</Label>
          <Select
            value={heroType}
            onValueChange={(value) => updateConfig('hero_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="banner">Banner Grande</SelectItem>
              <SelectItem value="publidoor">Publidoor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select
            value={config?.priority_type || 'commercial'}
            onValueChange={(value) => updateConfig('priority_type', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="institutional">Institucional (maior)</SelectItem>
              <SelectItem value="editorial">Editorial</SelectItem>
              <SelectItem value="commercial">Comercial</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Define ordem de exibição entre campanhas
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="exit-cta">Texto do CTA neutro *</Label>
        <Input
          id="exit-cta"
          placeholder="Continuar navegando"
          value={config?.cta_text || ''}
          onChange={(e) => updateConfig('cta_text', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Botão para fechar o modal (ex: "Ver depois", "Continuar navegando")
        </p>
      </div>

      {/* Asset Uploaders */}
      <div className="space-y-4 pt-4 border-t">
        <h4 className="font-medium text-sm">Criativos do Modal</h4>
        
        {onHeroAssetChange && (
          <AdImageUploader
            value={heroAssetUrl}
            onChange={(url) => onHeroAssetChange(url)}
            onAltChange={(alt) => onHeroAssetChange(heroAssetUrl, alt)}
            format={heroType === 'publidoor' ? 'home-topo' : 'home-topo'}
            label={`Hero (${heroType === 'publidoor' ? 'Publidoor' : 'Banner Grande'})`}
          />
        )}

        {onSecondary1AssetChange && (
          <AdImageUploader
            value={secondary1AssetUrl}
            onChange={(url) => onSecondary1AssetChange(url)}
            onAltChange={(alt) => onSecondary1AssetChange(secondary1AssetUrl, alt)}
            format="retangulo-medio"
            label="Secundário 1 (Retângulo Médio)"
          />
        )}

        {onSecondary2AssetChange && (
          <AdImageUploader
            value={secondary2AssetUrl}
            onChange={(url) => onSecondary2AssetChange(url)}
            onAltChange={(alt) => onSecondary2AssetChange(secondary2AssetUrl, alt)}
            format="retangulo-medio"
            label="Secundário 2 (Retângulo Médio)"
          />
        )}
      </div>

      <div className="text-xs text-muted-foreground">
        <strong>Nota:</strong> Os criativos serão selecionados automaticamente dos assets da campanha 
        com base nas dimensões configuradas.
      </div>
    </div>
  );
}
