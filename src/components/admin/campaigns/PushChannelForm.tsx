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
import type { PushChannelConfig } from '@/types/campaigns-unified';

interface PushChannelFormProps {
  config?: Partial<PushChannelConfig>;
  onChange: (config: Partial<PushChannelConfig>) => void;
}

export function PushChannelForm({ config, onChange }: PushChannelFormProps) {
  const updateConfig = (key: keyof PushChannelConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
        <strong>Atenção:</strong> Push notifications requerem confirmação antes do envio.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="push-title">Título *</Label>
          <Input
            id="push-title"
            placeholder="Título da notificação"
            value={config?.title || ''}
            onChange={(e) => updateConfig('title', e.target.value)}
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            Máximo 50 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="push-url">URL de destino *</Label>
          <Input
            id="push-url"
            type="url"
            placeholder="https://..."
            value={config?.action_url || ''}
            onChange={(e) => updateConfig('action_url', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="push-body">Mensagem *</Label>
        <Textarea
          id="push-body"
          placeholder="Corpo da notificação..."
          value={config?.body || ''}
          onChange={(e) => updateConfig('body', e.target.value)}
          maxLength={150}
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Máximo 150 caracteres
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="push-icon">URL do ícone (opcional)</Label>
          <Input
            id="push-icon"
            type="url"
            placeholder="https://..."
            value={config?.icon_url || ''}
            onChange={(e) => updateConfig('icon_url', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="push-audience">Público-alvo</Label>
          <Select
            value={config?.target_audience || 'subscribers'}
            onValueChange={(value) => updateConfig('target_audience', value)}
          >
            <SelectTrigger id="push-audience">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os usuários</SelectItem>
              <SelectItem value="subscribers">Assinantes Push</SelectItem>
              <SelectItem value="segment">Segmento específico</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="push-schedule">Agendar envio (opcional)</Label>
        <Input
          id="push-schedule"
          type="datetime-local"
          value={config?.send_at || ''}
          onChange={(e) => updateConfig('send_at', e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Deixe em branco para enviar após confirmação manual
        </p>
      </div>
    </div>
  );
}
