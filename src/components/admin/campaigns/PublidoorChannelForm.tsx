import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AdImageUploader } from '@/components/admin/AdImageUploader';
import type { PublidoorChannelConfig } from '@/types/campaigns-unified';

interface PublidoorChannelFormProps {
  config?: Partial<PublidoorChannelConfig>;
  onChange: (config: Partial<PublidoorChannelConfig>) => void;
  assetUrl?: string;
  onAssetChange: (url: string, alt?: string) => void;
}

const TYPE_OPTIONS = [
  { value: 'narrativo', label: 'Narrativo', description: 'História envolvente sobre a marca' },
  { value: 'contextual', label: 'Contextual', description: 'Conteúdo relacionado ao contexto' },
  { value: 'geografico', label: 'Geográfico', description: 'Baseado na localização' },
  { value: 'editorial', label: 'Editorial', description: 'Estilo jornalístico' },
  { value: 'impacto_total', label: 'Impacto Total', description: 'Formato premium fullwidth' },
];

export function PublidoorChannelForm({
  config,
  onChange,
  assetUrl,
  onAssetChange,
}: PublidoorChannelFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Tipo de Exibição</Label>
        <Select
          value={config?.type || 'narrativo'}
          onValueChange={(value) => {
            onChange({
              ...config,
              type: value as PublidoorChannelConfig['type'],
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o tipo" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map(type => (
              <SelectItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-xs text-muted-foreground">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Frase Principal *</Label>
        <Input
          value={config?.phrase_1 || ''}
          onChange={(e) => onChange({ ...config, phrase_1: e.target.value })}
          placeholder="Texto principal da exibição"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Frase Secundária</Label>
        <Input
          value={config?.phrase_2 || ''}
          onChange={(e) => onChange({ ...config, phrase_2: e.target.value })}
          placeholder="Subtítulo ou complemento"
        />
      </div>

      <div className="space-y-2">
        <Label>Descrição</Label>
        <Textarea
          value={config?.phrase_3 || ''}
          onChange={(e) => onChange({ ...config, phrase_3: e.target.value })}
          placeholder="Descrição adicional (opcional)"
          rows={2}
        />
      </div>

      <AdImageUploader
        value={assetUrl || ''}
        onChange={(url) => onAssetChange(url)}
        onAltChange={(alt) => onAssetChange(assetUrl || '', alt)}
        format="retangulo-medio"
        label="Imagem da Exibição"
      />
    </div>
  );
}
