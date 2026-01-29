import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  ArrowLeft, 
  Play, 
  Pause, 
  PlayCircle, 
  TestTube, 
  Settings,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Rss,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { 
  useRegionalSources, 
  useTestRegionalSource, 
  useRunRegionalIngest,
  usePauseRegionalSource,
  useResumeRegionalSource,
} from '@/hooks/useRegionalAutoPost';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RegionalSources() {
  const { data: sources, isLoading } = useRegionalSources();
  const testSource = useTestRegionalSource();
  const runIngest = useRunRegionalIngest();
  const pauseSource = usePauseRegionalSource();
  const resumeSource = useResumeRegionalSource();
  
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);

  const handleTest = async (sourceId: string) => {
    const result = await testSource.mutateAsync(sourceId);
    setTestResult(result);
    setShowTestDialog(true);
  };

  const getStatusIcon = (source: any) => {
    if (!source.is_active) {
      return <Pause className="h-4 w-4 text-gray-400" />;
    }
    if (source.error_count > 0) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    return <CheckCircle2 className="h-4 w-4 text-green-500" />;
  };

  const getStatusBadge = (source: any) => {
    if (!source.is_active) {
      return <Badge variant="outline" className="text-gray-500">Pausada</Badge>;
    }
    if (source.error_count > 0) {
      return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">
        {source.error_count} erro{source.error_count > 1 ? 's' : ''}
      </Badge>;
    }
    return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Ativa</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/admin/autopost-regional">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h1 className="text-2xl font-bold">Fontes Regionais</h1>
            </div>
            <p className="text-muted-foreground">
              13 prefeituras da Grande Cotia
            </p>
          </div>
        </div>
      </div>

      {/* Sources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Fontes Cadastradas</CardTitle>
          <CardDescription>
            Prefeituras configuradas para ingestão automática de notícias
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando fontes...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
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
                      <div className="flex items-center gap-2">
                        {getStatusIcon(source)}
                        {getStatusBadge(source)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{source.city}</p>
                        <p className="text-xs text-muted-foreground">{source.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {source.type === 'rss' ? (
                          <>
                            <Rss className="h-4 w-4 text-orange-500" />
                            <span className="text-sm">RSS</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">Listing</span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {source.last_fetched_at ? (
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(source.last_fetched_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nunca</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {source.mode === 'review' ? 'Revisão' : source.mode === 'auto_publish' ? 'Auto' : 'Off'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleTest(source.id)}
                          disabled={testSource.isPending}
                          title="Testar fonte"
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => runIngest.mutate(source.id)}
                          disabled={runIngest.isPending || !source.is_active}
                          title="Executar agora"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                        {source.is_active ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => pauseSource.mutate(source.id)}
                            disabled={pauseSource.isPending}
                            title="Pausar"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => resumeSource.mutate(source.id)}
                            disabled={resumeSource.isPending}
                            title="Ativar"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Abrir site"
                        >
                          <a href={source.source_url || source.rss_url || source.listing_url || '#'} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
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

      {/* Error Details */}
      {sources?.some((s) => s.last_error) && (
        <Card className="border-amber-500/50">
          <CardHeader>
            <CardTitle className="text-amber-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Fontes com Erro
            </CardTitle>
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

      {/* Test Result Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resultado do Teste</DialogTitle>
            <DialogDescription>
              Preview dos itens encontrados (sem gravar no banco)
            </DialogDescription>
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
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline truncate block"
                      >
                        {item.url}
                      </a>
                      {item.excerpt && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {item.excerpt}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : testResult.results[0].error ? (
                <div className="p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <p className="text-red-600">{testResult.results[0].error}</p>
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