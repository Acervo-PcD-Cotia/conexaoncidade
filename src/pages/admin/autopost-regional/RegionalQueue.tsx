import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeHtml } from '@/hooks/useSanitizedHtml';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { 
  MapPin, ArrowLeft, RefreshCw, ExternalLink, Eye, SkipForward, Search,
  Sparkles, Send, Zap, Image, FileText, Tags, Rocket, Upload, Trash2,
} from 'lucide-react';
import { 
  useRegionalQueue, useReprocessRegionalItem, useSkipRegionalItem,
  useProcessRegionalItem, usePublishRegionalItem, useProcessAllNew,
  usePublishAllProcessed, useFullPipeline, useRunRegionalIngest,
  useDeleteRegionalItems, useDeleteRegionalItemsByStatus,
  RegionalIngestItem,
} from '@/hooks/useRegionalAutoPost';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RegionalQueue() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<RegionalIngestItem | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data: queue, isLoading, refetch } = useRegionalQueue();
  const reprocessItem = useReprocessRegionalItem();
  const skipItem = useSkipRegionalItem();
  const processItem = useProcessRegionalItem();
  const publishItem = usePublishRegionalItem();
  const processAllNew = useProcessAllNew();
  const publishAllProcessed = usePublishAllProcessed();
  const fullPipeline = useFullPipeline();
  const runIngest = useRunRegionalIngest();
  const deleteItems = useDeleteRegionalItems();
  const deleteByStatus = useDeleteRegionalItemsByStatus();

  const filteredQueue = queue?.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regional_sources?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newItemsCount = queue?.filter(item => item.status === 'new').length || 0;
  const processedItemsCount = queue?.filter(item => item.status === 'processed').length || 0;
  const failedItemsCount = queue?.filter(item => item.status === 'failed').length || 0;
  const isAnyPending = fullPipeline.isPending || processAllNew.isPending || publishAllProcessed.isPending || runIngest.isPending;

  const toggleItemSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAllFiltered = () => {
    const ids = filteredQueue?.map(i => i.id) || [];
    if (selectedIds.length === ids.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ids);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length > 0) {
      deleteItems.mutate(selectedIds);
      setSelectedIds([]);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline">Novo</Badge>;
      case 'queued':
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Na Fila</Badge>;
      case 'processing':
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Processando</Badge>;
      case 'processed':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Processado</Badge>;
      case 'published':
        return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Publicado</Badge>;
      case 'skipped':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Ignorado</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Erro</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/spah/painel/autopost-regional">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-amber-500" />
              <h1 className="text-2xl font-bold">Fila Editorial</h1>
            </div>
            <p className="text-muted-foreground">
              Itens capturados para processamento
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Automation Actions */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5 text-amber-500" />
            Automação em Lote
          </CardTitle>
          <CardDescription>
            Execute todo o pipeline de uma vez ou etapas individuais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Full Pipeline - THE BIG BUTTON */}
            <Button 
              onClick={() => fullPipeline.mutate()}
              disabled={isAnyPending}
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
              size="lg"
            >
              <Rocket className="h-4 w-4 mr-2" />
              {fullPipeline.isPending ? 'Executando Pipeline...' : '🚀 Pipeline Completo (Ingerir + Processar + Publicar)'}
            </Button>

            {/* Individual steps */}
            <Button 
              variant="outline"
              onClick={() => runIngest.mutate(undefined)}
              disabled={isAnyPending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${runIngest.isPending ? 'animate-spin' : ''}`} />
              {runIngest.isPending ? 'Ingerindo...' : 'Buscar Notícias (Todas as Fontes)'}
            </Button>

            {newItemsCount > 0 && (
              <Button 
                variant="outline"
                onClick={() => processAllNew.mutate()}
                disabled={isAnyPending}
                className="border-purple-500/30 text-purple-600 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {processAllNew.isPending ? 'Processando...' : `Processar Todos (${newItemsCount})`}
              </Button>
            )}

            {processedItemsCount > 0 && (
              <Button 
                variant="outline"
                onClick={() => publishAllProcessed.mutate()}
                disabled={isAnyPending}
                className="border-green-500/30 text-green-600 hover:bg-green-50"
              >
                <Upload className="h-4 w-4 mr-2" />
                {publishAllProcessed.isPending ? 'Publicando...' : `Publicar Todos (${processedItemsCount})`}
              </Button>
            )}

            {/* Delete buttons */}
            {selectedIds.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Selecionados ({selectedIds.length})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir {selectedIds.length} item(ns)?</AlertDialogTitle>
                    <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteSelected} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {failedItemsCount > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir com Erro ({failedItemsCount})
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir todos os itens com erro?</AlertDialogTitle>
                    <AlertDialogDescription>Serão excluídos {failedItemsCount} itens com status "Erro".</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteByStatus.mutate('failed')} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Excluir</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por título ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="queued">Na Fila</SelectItem>
                <SelectItem value="processing">Processando</SelectItem>
                <SelectItem value="processed">Processado</SelectItem>
                <SelectItem value="published">Publicado</SelectItem>
                <SelectItem value="skipped">Ignorado</SelectItem>
                <SelectItem value="failed">Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Itens na Fila</CardTitle>
          <CardDescription>
            {filteredQueue?.length || 0} itens encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : filteredQueue && filteredQueue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox 
                      checked={selectedIds.length === (filteredQueue?.length || 0) && (filteredQueue?.length || 0) > 0}
                      onCheckedChange={toggleSelectAllFiltered}
                    />
                  </TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Capturado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQueue.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedIds.includes(item.id)}
                        onCheckedChange={() => toggleItemSelection(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="font-medium truncate">
                          {item.rewritten_title || item.title || 'Sem título'}
                        </p>
                        {item.excerpt && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.excerpt}
                          </p>
                        )}
                        {item.error_message && (
                          <p className="text-xs text-red-500 truncate mt-1">
                            ⚠️ {item.error_message}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.regional_sources?.city || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedItem(item)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          title="Abrir original"
                        >
                          <a href={item.canonical_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        
                        {(item.status === 'new' || item.status === 'queued') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => processItem.mutate(item.id)}
                            disabled={processItem.isPending}
                            title="Processar com IA"
                            className="text-purple-500 hover:text-purple-700 hover:bg-purple-50"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.status === 'processed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => publishItem.mutate(item.id)}
                            disabled={publishItem.isPending}
                            title="Publicar agora"
                            className="text-green-500 hover:text-green-700 hover:bg-green-50"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => reprocessItem.mutate(item.id)}
                            disabled={reprocessItem.isPending}
                            title="Tentar novamente"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {item.status !== 'published' && item.status !== 'skipped' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => skipItem.mutate(item.id)}
                            disabled={skipItem.isPending}
                            title="Ignorar"
                          >
                            <SkipForward className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteItems.mutate([item.id])}
                          disabled={deleteItems.isPending}
                          title="Excluir"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground">Nenhum item na fila</p>
          )}
        </CardContent>
      </Card>

      {/* Item Detail Dialog with Tabs */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Item</DialogTitle>
            <DialogDescription>
              {selectedItem?.regional_sources?.city} - {getStatusBadge(selectedItem?.status || '')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <Tabs defaultValue="original" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="original" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Original
                </TabsTrigger>
                <TabsTrigger value="rewritten" className="flex items-center gap-1" disabled={!selectedItem.rewritten_content}>
                  <Sparkles className="h-3 w-3" />
                  Reescrito
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex items-center gap-1" disabled={!selectedItem.seo_meta_title}>
                  <Tags className="h-3 w-3" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="image" className="flex items-center gap-1" disabled={!selectedItem.generated_image_url && !selectedItem.image_url}>
                  <Image className="h-3 w-3" />
                  Imagem
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="original" className="mt-4 space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Título Original</label>
                  <p className="font-medium">{selectedItem.title || 'Sem título'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">URL Original</label>
                  <a 
                    href={selectedItem.canonical_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm block truncate"
                  >
                    {selectedItem.canonical_url}
                  </a>
                </div>

                {selectedItem.published_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data Original da Notícia</label>
                    <p className="text-sm">{new Date(selectedItem.published_at).toLocaleString('pt-BR')}</p>
                  </div>
                )}
                
                {selectedItem.excerpt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resumo</label>
                    <p className="text-sm">{selectedItem.excerpt}</p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payload Bruto</label>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-48">
                    {JSON.stringify(selectedItem.raw_payload, null, 2)}
                  </pre>
                </div>
              </TabsContent>
              
              <TabsContent value="rewritten" className="mt-4 space-y-4">
                {selectedItem.rewritten_title ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Título Reescrito</label>
                      <p className="font-medium text-lg">{selectedItem.rewritten_title}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Conteúdo Reescrito</label>
                      <div 
                        className="mt-1 p-4 bg-muted/50 rounded-lg prose prose-sm max-h-80 overflow-auto"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(selectedItem.rewritten_content || '') }}
                      />
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Este item ainda não foi processado pela IA.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="seo" className="mt-4 space-y-4">
                {selectedItem.seo_meta_title ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                      <p className="font-medium">{selectedItem.seo_meta_title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedItem.seo_meta_title.length}/60 caracteres
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                      <p className="text-sm">{selectedItem.seo_meta_description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedItem.seo_meta_description?.length || 0}/155 caracteres
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Metadados SEO serão gerados após o processamento.
                  </p>
                )}
              </TabsContent>
              
              <TabsContent value="image" className="mt-4 space-y-4">
                {(selectedItem.generated_image_url || selectedItem.image_url) ? (
                  <div className="space-y-4">
                    <img 
                      src={selectedItem.generated_image_url || selectedItem.image_url || ''} 
                      alt="Preview" 
                      className="w-full max-h-80 object-cover rounded-lg border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <p className="text-xs text-muted-foreground truncate">
                      {selectedItem.generated_image_url || selectedItem.image_url}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma imagem disponível.
                  </p>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
