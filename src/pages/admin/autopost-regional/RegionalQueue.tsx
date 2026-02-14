import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sanitizeHtml } from '@/hooks/useSanitizedHtml';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  MapPin, 
  ArrowLeft, 
  RefreshCw,
  ExternalLink,
  Eye,
  SkipForward,
  Search,
  Sparkles,
  Send,
  Zap,
  Image,
  FileText,
  Tags,
} from 'lucide-react';
import { 
  useRegionalQueue,
  useReprocessRegionalItem,
  useSkipRegionalItem,
  useProcessRegionalItem,
  usePublishRegionalItem,
  useProcessAllNew,
  RegionalIngestItem,
} from '@/hooks/useRegionalAutoPost';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function RegionalQueue() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<RegionalIngestItem | null>(null);
  
  const { data: queue, isLoading, refetch } = useRegionalQueue();
  const reprocessItem = useReprocessRegionalItem();
  const skipItem = useSkipRegionalItem();
  const processItem = useProcessRegionalItem();
  const publishItem = usePublishRegionalItem();
  const processAllNew = useProcessAllNew();

  const filteredQueue = queue?.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.regional_sources?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const newItemsCount = queue?.filter(item => item.status === 'new').length || 0;

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
          {newItemsCount > 0 && (
            <Button 
              variant="default"
              onClick={() => processAllNew.mutate()}
              disabled={processAllNew.isPending}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Processar Todos ({newItemsCount})
            </Button>
          )}
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

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
                        {/* View Details */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedItem(item)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        {/* Open Original */}
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
                        
                        {/* Process with AI - for new items */}
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
                        
                        {/* Publish - for processed items */}
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
                        
                        {/* Reprocess - for failed items */}
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
                        
                        {/* Skip - for items not yet published/skipped */}
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
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      {selectedItem.generated_image_url ? 'Imagem Gerada por IA' : 'Imagem Original'}
                    </label>
                    <img 
                      src={selectedItem.generated_image_url || selectedItem.image_url || ''} 
                      alt="Preview" 
                      className="mt-2 rounded-lg max-h-64 object-cover w-full"
                    />
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
