import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useCreateLink } from '@/hooks/useLinks';
import { useCampaigns } from '@/hooks/useCampaigns';
import { buildUTMUrl, generateSlug, validateUrl } from '@/lib/linkUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, Link2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function LinksBuilder() {
  const { toast } = useToast();
  const createLink = useCreateLink();
  const { data: campaigns } = useCampaigns();

  const [form, setForm] = useState({
    destination_url: '',
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_content: '',
    utm_term: '',
    campaign_id: '',
    slug: '',
  });

  const [generatedSlug] = useState(generateSlug());

  const finalUrl = buildUTMUrl(form.destination_url, {
    utm_source: form.utm_source || undefined,
    utm_medium: form.utm_medium || undefined,
    utm_campaign: form.utm_campaign || undefined,
    utm_content: form.utm_content || undefined,
    utm_term: form.utm_term || undefined,
  });

  const isValidUrl = form.destination_url ? validateUrl(form.destination_url) : true;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(finalUrl);
    toast({ title: 'URL copiada!' });
  };

  const handleCreate = async () => {
    if (!form.destination_url || !isValidUrl) {
      toast({ variant: 'destructive', title: 'URL inválida' });
      return;
    }

    await createLink.mutateAsync({
      destination_url: form.destination_url,
      utm_source: form.utm_source || undefined,
      utm_medium: form.utm_medium || undefined,
      utm_campaign: form.utm_campaign || undefined,
      utm_content: form.utm_content || undefined,
      utm_term: form.utm_term || undefined,
      campaign_id: form.campaign_id || undefined,
      slug: form.slug || generatedSlug,
    });

    setForm({
      destination_url: '',
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_content: '',
      utm_term: '',
      campaign_id: '',
      slug: '',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Criar Link Rastreável</h1>
        <p className="text-muted-foreground">Monte URLs com parâmetros UTM para rastreamento</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Parâmetros do Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>URL de Destino *</Label>
              <Input
                placeholder="https://exemplo.com/pagina"
                value={form.destination_url}
                onChange={(e) => setForm({ ...form, destination_url: e.target.value })}
                className={!isValidUrl ? 'border-destructive' : ''}
              />
              {!isValidUrl && <p className="text-sm text-destructive">URL inválida</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>utm_source</Label>
                <Input
                  placeholder="facebook, google, newsletter"
                  value={form.utm_source}
                  onChange={(e) => setForm({ ...form, utm_source: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>utm_medium</Label>
                <Input
                  placeholder="cpc, email, social"
                  value={form.utm_medium}
                  onChange={(e) => setForm({ ...form, utm_medium: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>utm_campaign</Label>
              <Input
                placeholder="lancamento_produto, black_friday"
                value={form.utm_campaign}
                onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>utm_content</Label>
                <Input
                  placeholder="banner_topo, link_rodape"
                  value={form.utm_content}
                  onChange={(e) => setForm({ ...form, utm_content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>utm_term</Label>
                <Input
                  placeholder="palavra-chave"
                  value={form.utm_term}
                  onChange={(e) => setForm({ ...form, utm_term: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Campanha (opcional)</Label>
              <Select value={form.campaign_id} onValueChange={(v) => setForm({ ...form, campaign_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma campanha" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Slug do Shortlink</Label>
              <Input
                placeholder={generatedSlug}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Deixe vazio para usar: {generatedSlug}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview da URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg break-all font-mono text-sm">
              {form.destination_url ? finalUrl : 'Digite uma URL para ver o preview'}
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCopy} variant="outline" disabled={!form.destination_url}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar URL
              </Button>
              <Button onClick={handleCreate} disabled={!form.destination_url || !isValidUrl || createLink.isPending}>
                <Link2 className="h-4 w-4 mr-2" />
                {createLink.isPending ? 'Criando...' : 'Criar Link'}
              </Button>
            </div>

            {form.destination_url && isValidUrl && (
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium">Shortlink:</p>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {window.location.origin}/r/{form.slug || generatedSlug}
                </code>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}