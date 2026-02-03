import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { LoginPanelChannelConfig } from '@/types/campaigns-unified';

interface LoginPanelChannelFormProps {
  config?: Partial<LoginPanelChannelConfig>;
  onChange: (config: Partial<LoginPanelChannelConfig>) => void;
}

export function LoginPanelChannelForm({ config, onChange }: LoginPanelChannelFormProps) {
  const updateConfig = (key: keyof LoginPanelChannelConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm">
        <strong>Painel de Login:</strong> Criativo exibido no lado esquerdo da página de autenticação.
      </div>

      <div className="space-y-2">
        <Label>Tipo de exibição</Label>
        <Select
          value={config?.display_type || 'publidoor'}
          onValueChange={(value) => updateConfig('display_type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="publidoor">Publidoor (imagem + texto)</SelectItem>
            <SelectItem value="story">WebStory (capa do story)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          O criativo será selecionado automaticamente dos assets da campanha
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="login-text">Texto curto (opcional)</Label>
        <Textarea
          id="login-text"
          placeholder="Breve descrição ou chamada..."
          value={config?.short_text || ''}
          onChange={(e) => updateConfig('short_text', e.target.value)}
          maxLength={100}
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Máximo 100 caracteres. Aparece abaixo do criativo.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="login-cta-text">Texto do CTA (opcional)</Label>
          <Input
            id="login-cta-text"
            placeholder="Saiba mais"
            value={config?.cta_text || ''}
            onChange={(e) => updateConfig('cta_text', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="login-cta-url">URL do CTA</Label>
          <Input
            id="login-cta-url"
            type="url"
            placeholder="https://..."
            value={config?.cta_url || ''}
            onChange={(e) => updateConfig('cta_url', e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Abre em nova aba
          </p>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        <strong>Importante:</strong> O CTA nunca bloqueará o processo de login. 
        Usuários sempre poderão acessar o formulário de autenticação.
      </div>
    </div>
  );
}
