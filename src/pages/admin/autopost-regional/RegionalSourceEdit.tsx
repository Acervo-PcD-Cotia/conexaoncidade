import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  MapPin, 
  ArrowLeft, 
  Save,
  TestTube,
  Loader2,
  Rss,
  Globe,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { 
  useRegionalSource,
  useUpdateRegionalSource,
  useTestSelectors,
} from '@/hooks/useRegionalAutoPost';
import { toast } from 'sonner';

interface Selectors {
  item_container: string;
  item_link: string;
  item_title: string;
  item_date: string;
  item_image: string;
  [key: string]: string;
}

export default function RegionalSourceEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: source, isLoading } = useRegionalSource(id || '');
  const updateSource = useUpdateRegionalSource();
  const testSelectors = useTestSelectors();

  const [formData, setFormData] = useState({
    name: '',
    city: '',
    type: 'rss' as 'rss' | 'listing',
    rss_url: '',
    listing_url: '',
    source_url: '',
    mode: 'review' as 'review' | 'auto_publish' | 'off',
    is_active: true,
    poll_interval_minutes: 120,
    rate_limit_per_hour: 10,
    tags_default: [] as string[],
  });

  const [selectors, setSelectors] = useState<Selectors>({
    item_container: 'article, .news-item, .post',
    item_link: 'a[href*="noticia"], a[href*="news"]',
    item_title: 'h2, h3, .title',
    item_date: 'time, .date, .published',
    item_image: 'img[src*="upload"], img.thumbnail',
  });

  const [testResult, setTestResult] = useState<{
    success: boolean;
    matches: Record<string, number>;
  } | null>(null);

  useEffect(() => {
    if (source) {
      setFormData({
        name: source.name,
        city: source.city,
        type: source.type,
        rss_url: source.rss_url || '',
        listing_url: source.listing_url || '',
        source_url: source.source_url || '',
        mode: source.mode,
        is_active: source.is_active,
        poll_interval_minutes: source.poll_interval_minutes,
        rate_limit_per_hour: source.rate_limit_per_hour,
        tags_default: source.tags_default || [],
      });
      if (source.selectors) {
        setSelectors({
          ...selectors,
          ...source.selectors,
        });
      }
    }
  }, [source]);

  const handleSave = async () => {
    if (!id) return;

    try {
      await updateSource.mutateAsync({
        id,
        ...formData,
        selectors: formData.type === 'listing' ? selectors : null,
      });
      navigate('/admin/autopost-regional/fontes');
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleTestSelectors = async () => {
    if (!id) return;

    try {
      const result = await testSelectors.mutateAsync({
        sourceId: id,
        selectors,
      });
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, matches: {} });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!source) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Fonte não encontrada</p>
        <Button asChild className="mt-4">
          <Link to="/admin/autopost-regional/fontes">Voltar</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/admin/autopost-regional/fontes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-500" />
            <h1 className="text-2xl font-bold">Editar Fonte</h1>
          </div>
          <p className="text-muted-foreground">
            {source.city} - {source.name}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
            <CardDescription>Dados gerais da fonte</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as 'rss' | 'listing' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">
                    <div className="flex items-center gap-2">
                      <Rss className="h-4 w-4 text-orange-500" />
                      RSS Feed
                    </div>
                  </SelectItem>
                  <SelectItem value="listing">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-500" />
                      HTML Listing
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'rss' && (
              <div className="space-y-2">
                <Label>URL do Feed RSS</Label>
                <Input
                  value={formData.rss_url}
                  onChange={(e) => setFormData({ ...formData, rss_url: e.target.value })}
                  placeholder="https://prefeitura.com/feed/rss"
                />
              </div>
            )}

            {formData.type === 'listing' && (
              <div className="space-y-2">
                <Label>URL da Página de Listagem</Label>
                <Input
                  value={formData.listing_url}
                  onChange={(e) => setFormData({ ...formData, listing_url: e.target.value })}
                  placeholder="https://prefeitura.com/noticias"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>URL do Site (para referência)</Label>
              <Input
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://prefeitura.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
            <CardDescription>Comportamento da ingestão</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Fonte Ativa</Label>
                <p className="text-sm text-muted-foreground">Habilitar ingestão automática</p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Modo de Publicação</Label>
              <Select
                value={formData.mode}
                onValueChange={(value) => setFormData({ ...formData, mode: value as 'review' | 'auto_publish' | 'off' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Revisão Manual</SelectItem>
                  <SelectItem value="auto_publish">Publicação Automática</SelectItem>
                  <SelectItem value="off">Desligado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Intervalo (minutos)</Label>
                <Input
                  type="number"
                  value={formData.poll_interval_minutes}
                  onChange={(e) => setFormData({ ...formData, poll_interval_minutes: parseInt(e.target.value) || 120 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Limite por Hora</Label>
                <Input
                  type="number"
                  value={formData.rate_limit_per_hour}
                  onChange={(e) => setFormData({ ...formData, rate_limit_per_hour: parseInt(e.target.value) || 10 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Tags Padrão</Label>
              <Input
                value={formData.tags_default.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  tags_default: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-xs text-muted-foreground">
                Separadas por vírgula. Serão adicionadas automaticamente às notícias.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* CSS Selectors - only for listing type */}
        {formData.type === 'listing' && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Editor de Seletores CSS</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestSelectors}
                  disabled={testSelectors.isPending}
                >
                  {testSelectors.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Testar Seletores
                </Button>
              </CardTitle>
              <CardDescription>
                Configure os seletores CSS para extrair conteúdo de páginas HTML
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Container do Item</Label>
                  <Input
                    value={selectors.item_container}
                    onChange={(e) => setSelectors({ ...selectors, item_container: e.target.value })}
                    placeholder="article, .news-item"
                  />
                  <p className="text-xs text-muted-foreground">
                    Elemento que envolve cada notícia na listagem
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Link da Notícia</Label>
                  <Input
                    value={selectors.item_link}
                    onChange={(e) => setSelectors({ ...selectors, item_link: e.target.value })}
                    placeholder="a[href*='noticia']"
                  />
                  <p className="text-xs text-muted-foreground">
                    Link para a página completa da notícia
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={selectors.item_title}
                    onChange={(e) => setSelectors({ ...selectors, item_title: e.target.value })}
                    placeholder="h2, h3, .title"
                  />
                  <p className="text-xs text-muted-foreground">
                    Elemento com o título da notícia
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Data (opcional)</Label>
                  <Input
                    value={selectors.item_date}
                    onChange={(e) => setSelectors({ ...selectors, item_date: e.target.value })}
                    placeholder="time, .date"
                  />
                  <p className="text-xs text-muted-foreground">
                    Elemento com a data de publicação
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Imagem (opcional)</Label>
                  <Input
                    value={selectors.item_image}
                    onChange={(e) => setSelectors({ ...selectors, item_image: e.target.value })}
                    placeholder="img.thumbnail"
                  />
                  <p className="text-xs text-muted-foreground">
                    Elemento de imagem da notícia
                  </p>
                </div>
              </div>

              {/* Test Results */}
              {testResult && (
                <div className={`mt-4 p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {testResult.success ? 'Teste bem-sucedido!' : 'Falha no teste'}
                    </span>
                  </div>
                  {testResult.matches && Object.keys(testResult.matches).length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(testResult.matches).map(([key, count]) => (
                        <Badge key={key} variant="outline">
                          {key}: {count} match{count !== 1 ? 'es' : ''}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" asChild>
          <Link to="/admin/autopost-regional/fontes">Cancelar</Link>
        </Button>
        <Button onClick={handleSave} disabled={updateSource.isPending}>
          {updateSource.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </div>
    </div>
  );
}
