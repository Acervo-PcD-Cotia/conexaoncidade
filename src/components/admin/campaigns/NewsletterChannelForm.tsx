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
import type { NewsletterChannelConfig } from '@/types/campaigns-unified';

interface NewsletterChannelFormProps {
  config?: Partial<NewsletterChannelConfig>;
  onChange: (config: Partial<NewsletterChannelConfig>) => void;
}

export function NewsletterChannelForm({ config, onChange }: NewsletterChannelFormProps) {
  const updateConfig = (key: keyof NewsletterChannelConfig, value: string) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm">
        <strong>Atenção:</strong> Newsletter requer confirmação antes do envio.
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newsletter-subject">Assunto do e-mail *</Label>
          <Input
            id="newsletter-subject"
            placeholder="Assunto da newsletter"
            value={config?.subject || ''}
            onChange={(e) => updateConfig('subject', e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newsletter-list">Lista de destino *</Label>
          <Select
            value={config?.target_list || ''}
            onValueChange={(value) => updateConfig('target_list', value)}
          >
            <SelectTrigger id="newsletter-list">
              <SelectValue placeholder="Selecionar lista" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os assinantes</SelectItem>
              <SelectItem value="active">Assinantes ativos</SelectItem>
              <SelectItem value="premium">Assinantes premium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newsletter-preview">Texto de preview</Label>
        <Textarea
          id="newsletter-preview"
          placeholder="Texto que aparece antes de abrir o e-mail..."
          value={config?.preview_text || ''}
          onChange={(e) => updateConfig('preview_text', e.target.value)}
          maxLength={200}
          rows={2}
        />
        <p className="text-xs text-muted-foreground">
          Este texto aparece na prévia do e-mail. Máximo 200 caracteres.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newsletter-template">Template (opcional)</Label>
          <Select
            value={config?.template_id || ''}
            onValueChange={(value) => updateConfig('template_id', value)}
          >
            <SelectTrigger id="newsletter-template">
              <SelectValue placeholder="Template padrão" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Template padrão</SelectItem>
              <SelectItem value="minimal">Minimalista</SelectItem>
              <SelectItem value="featured">Destaque</SelectItem>
              <SelectItem value="promotional">Promocional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="newsletter-schedule">Agendar envio (opcional)</Label>
          <Input
            id="newsletter-schedule"
            type="datetime-local"
            value={config?.send_at || ''}
            onChange={(e) => updateConfig('send_at', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
