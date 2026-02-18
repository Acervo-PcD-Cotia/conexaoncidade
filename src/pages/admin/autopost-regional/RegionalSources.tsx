import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { 
  MapPin, ArrowLeft, Play, Pause, PlayCircle, TestTube, 
  CheckCircle2, AlertTriangle, Rss, Globe, ExternalLink, 
  Pencil, Plus, Loader2, RefreshCw,
} from 'lucide-react';
import { 
  useRegionalSources, useTestRegionalSource, useRunRegionalIngest,
  usePauseRegionalSource, useResumeRegionalSource, useCreateRegionalSource,
} from '@/hooks/useRegionalAutoPost';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RegionalSources() {
  const { data: sources, isLoading } = useRegionalSources();
  const testSource = useTestRegionalSource();
  const runIngest = useRunRegionalIngest();
  const pauseSource = usePauseRegionalSource();
  const resumeSource = useResumeRegionalSource();
  const createSource = useCreateRegionalSource();
  
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [showNewSourceDialog, setShowNewSourceDialog] = useState(false);
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [newSource, setNewSource] = useState({
    city: '', name: '', type: 'rss' as 'rss' | 'listing',
    rss_url: '', listing_url: '', source_url: '',
  });

  const handleTest = async (sourceId: string) => {
    const result = await testSource.mutateAsync(sourceId);
    setTestResult(result);
    setShowTestDialog(true);
  };

  const handleCreateSource = async () => {
    await createSource.mutateAsync({
      ...newSource,
      is_active: true,
      mode: 'review',
      poll_interval_minutes: 120,
      rate_limit_per_hour: 10,
      tags_default: [newSource.city.toLowerCase().replace(/\s+/g, '-')],
      selectors: null,
    });
    setShowNewSourceDialog(false);
    setNewSource({ city: '', name: '', type: 'rss', rss_url: '', listing_url: '', source_url: '' });
  };

  const handleIngestSelected = () => {
    if (selectedSourceIds.length === 0) {
      runIngest.mutate(undefined);
    } else {
      selectedSourceIds.forEach((id) => runIngest.mutate(id));
    }
    setSelectedSourceIds([]);
  };

  const toggleSourceSelection = (id: string) => {
    setSelectedSourceIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedSourceIds.length === (sources?.length || 0)) {
      setSelectedSourceIds([]);
    } else {
      setSelectedSourceIds(sources?.map(s => s.id) || []);
    }
  };

  const getStatusIcon = (source: any) => {
    if (!source.is_active) return <Pause className="h-4 w-4 text-muted-foreground" />;
    if (source.error_count > 0) return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    return <CheckCircle2 className="h-4 w-4 text-green-600" />;
  };

  const getStatusBadge = (source: any) => {
    if (!source.is_active) return <Badge variant="outline" className="text-muted-foreground">Pausada</Badge>;
    if (source.error_count > 0) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">{source.error_count} erro{source.error_count > 1 ? 's' : ''}</Badge>;
    return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ativa</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/spah/painel/autopost-regional"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h1 className="text-2xl font-bold">Fontes Regionais</h1>
            </div>
            <p className="text-muted-foreground">{sources?.length || 0} fontes cadastradas</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleIngestSelected} disabled={runIngest.isPending}>
            <RefreshCw className={`h-4 w-4 mr-2 ${runIngest.isPending ? 'animate-spin' : ''}`} />
            {selectedSourceIds.length > 0 ? `Buscar de ${selectedSourceIds.length} fonte(s)` : 'Buscar de Todas'}
          </Button>
          <Button onClick={() => setShowNewSourceDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />Nova Fonte
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fontes Cadastradas</CardTitle>
          <CardDescription>Prefeituras e portais configurados para ingestão automática de notícias</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando fontes...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox checked={selectedSourceIds.length === (sources?.length || 0) && (sources?.length || 0) > 0} onCheckedChange={toggleSelectAll} />
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Última Execução</TableHead>
                  <TableHead>Modo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources?.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <Checkbox checked={selectedSourceIds.includes(source.id)} onCheckedChange={() => toggleSourceSelection(source.id)} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">{getStatusIcon(source)}{getStatusBadge(source)}</div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{source.city}</p>
                        <p className="text-xs text-muted-foreground">{source.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {source.type === 'rss' ? (<><Rss className="h-4 w-4 text-orange-500" /><span className="text-sm">RSS</span></>) : (<><Globe className="h-4 w-4 text-blue-500" /><span className="text-sm">Listing</span></>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {source.last_fetched_at ? (
                        <span className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(source.last_fetched_at), { addSuffix: true, locale: ptBR })}</span>
                      ) : (<span className="text-sm text-muted-foreground">Nunca</span>)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{source.mode === 'review' ? 'Revisão' : source.mode === 'auto_publish' ? 'Auto' : 'Off'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleTest(source.id)} disabled={testSource.isPending} title="Testar fonte"><TestTube className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => runIngest.mutate(source.id)} disabled={runIngest.isPending || !source.is_active} title="Executar agora"><PlayCircle className="h-4 w-4" /></Button>
                        {source.is_active ? (
                          <Button variant="ghost" size="icon" onClick={() => pauseSource.mutate(source.id)} disabled={pauseSource.isPending} title="Pausar"><Pause className="h-4 w-4" /></Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => resumeSource.mutate(source.id)} disabled={resumeSource.isPending} title="Ativar"><Play className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" asChild title="Editar fonte">
                          <Link to={`/spah/painel/autopost-regional/fontes/${source.id}/edit`}><Pencil className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="Abrir site">
                          <a href={source.source_url || source.rss_url || source.listing_url || '#'} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {sources?.some((s) => s.last_error) && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-amber-600 flex items-center gap-2"><AlertTriangle className="h-5 w-5" />Fontes com Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sources.filter((s) => s.last_error).map((source) => (
                <div key={source.id} className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
                  <p className="font-medium">{source.city}</p>
                  <p className="text-sm text-muted-foreground mt-1">{source.last_error}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Source Dialog */}
      <Dialog open={showNewSourceDialog} onOpenChange={setShowNewSourceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Fonte</DialogTitle>
            <DialogDescription>Cadastre uma nova fonte de notícias regionais</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={newSource.city} onChange={(e) => setNewSource({ ...newSource, city: e.target.value })} placeholder="Ex: Cotia" />
              </div>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={newSource.name} onChange={(e) => setNewSource({ ...newSource, name: e.target.value })} placeholder="Ex: Prefeitura de Cotia" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newSource.type} onValueChange={(v) => setNewSource({ ...newSource, type: v as 'rss' | 'listing' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">RSS Feed</SelectItem>
                  <SelectItem value="listing">HTML Listing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {newSource.type === 'rss' ? (
              <div className="space-y-2">
                <Label>URL do Feed RSS</Label>
                <Input value={newSource.rss_url} onChange={(e) => setNewSource({ ...newSource, rss_url: e.target.value })} placeholder="https://exemplo.com/feed/" />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>URL da Listagem</Label>
                <Input value={newSource.listing_url} onChange={(e) => setNewSource({ ...newSource, listing_url: e.target.value })} placeholder="https://exemplo.com/noticias" />
              </div>
            )}
            <div className="space-y-2">
              <Label>URL do Site</Label>
              <Input value={newSource.source_url} onChange={(e) => setNewSource({ ...newSource, source_url: e.target.value })} placeholder="https://exemplo.com" />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewSourceDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreateSource} disabled={createSource.isPending || !newSource.city || !newSource.name}>
                {createSource.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                Criar Fonte
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Result Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultado do Teste</DialogTitle>
            <DialogDescription>Preview dos itens encontrados (sem gravar no banco)</DialogDescription>
          </DialogHeader>
          {testResult?.results?.[0] && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <Badge>{testResult.results[0].city}</Badge>
                <span>{testResult.results[0].items_found} itens encontrados</span>
              </div>
              {testResult.results[0].preview?.length > 0 ? (
                <div className="space-y-2">
                  {testResult.results[0].preview.map((item: any, idx: number) => (
                    <div key={idx} className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-sm">{item.title}</p>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{item.url}</a>
                      {item.excerpt && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>}
                    </div>
                  ))}
                </div>
              ) : testResult.results[0].error ? (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-destructive">{testResult.results[0].error}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum item encontrado</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
