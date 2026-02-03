import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AdImageUploader } from '@/components/admin/AdImageUploader';
import type { WebStoriesChannelConfig } from '@/types/campaigns-unified';

interface WebStoriesChannelFormProps {
  config?: Partial<WebStoriesChannelConfig>;
  onChange: (config: Partial<WebStoriesChannelConfig>) => void;
  assetUrl?: string;
  onAssetChange: (url: string, alt?: string) => void;
}

export function WebStoriesChannelForm({
  config,
  onChange,
  assetUrl,
  onAssetChange,
}: WebStoriesChannelFormProps) {
  const storyType = config?.story_type || 'external';

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Tipo de Story</Label>
        <RadioGroup
          value={storyType}
          onValueChange={(value) => {
            onChange({
              ...config,
              story_type: value as 'external' | 'native',
            });
          }}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="external" id="story-external" />
            <Label htmlFor="story-external" className="font-normal cursor-pointer">
              URL Externa
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="native" id="story-native" />
            <Label htmlFor="story-native" className="font-normal cursor-pointer">
              Story Nativo (em breve)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {storyType === 'external' && (
        <div className="space-y-2">
          <Label>URL do Story</Label>
          <Input
            type="url"
            value={config?.story_url || ''}
            onChange={(e) => onChange({ ...config, story_url: e.target.value })}
            placeholder="https://exemplo.com/story"
          />
          <p className="text-xs text-muted-foreground">
            Cole a URL de um Web Story existente (Google Web Stories, AMP Stories, etc.)
          </p>
        </div>
      )}

      {storyType === 'native' && (
        <div className="p-4 rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            O editor de stories nativos estará disponível em breve.
          </p>
        </div>
      )}

      {/* Note: Story cover is 1080x1920 but using BatchAssetUploader for proper slot assignment */}
      <AdImageUploader
        value={assetUrl || ''}
        onChange={(url) => onAssetChange(url)}
        onAltChange={(alt) => onAssetChange(assetUrl || '', alt)}
        format="arranha-ceu"
        label="Capa do Story (proporção vertical)"
      />
    </div>
  );
}
