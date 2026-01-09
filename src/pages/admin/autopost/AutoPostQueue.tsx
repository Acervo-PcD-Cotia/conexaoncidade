import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle 
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Download, CheckCircle, Clock, XCircle, ExternalLink, 
  RefreshCw, Calendar, Eye, FileText
} from 'lucide-react';
import { useAutoPostQueue, useUpdateAutoPostItem, useAutoPostItem } from '@/hooks/useAutoPost';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type QueueStatus = 'captured' | 'processed' | 'queued' | 'approved' | 'scheduled' | 'published' | 'rejected' | 'duplicate';

const statusLabels: Record<QueueStatus, string> = {
  captured: 'Capturado',
  processed: 'Processado',
  queued: 'Na Fila',
  approved: 'Aprovado',
  scheduled: 'Agendado',
  published: 'Publicado',
  rejected: 'Rejeitado',
  duplicate: 'Duplicado'
};

const statusColors: Record<QueueStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  captured: 'outline',
  processed: 'secondary',
  queued: 'secondary',
  approved: 'default',
  scheduled: 'default',
  published: 'default',
  rejected: 'destructive',
  duplicate: 'destructive'
};

export default function AutoPostQueue() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const { data: queueItems, isLoading, refetch } = useAutoPostQueue(
    activeTab === 'all' ? undefined : activeTab
  );
  const { data: selectedItem } = useAutoPostItem(selectedItemId || undefined);
  const updateItem = useUpdateAutoPostItem();

  const handleApprove = (id: string) => {
    updateItem.mutate({ id, status: 'approved' });
    setSelectedItemId(null);
  };

  const handleReject = (id: string) => {
    updateItem.mutate({ id, status: 'rejected' });
    setSelectedItemId(null);
  };

  const tabCounts = {
    all: queueItems?.length || 0,
    captured: queueItems?.filter(i => i.status === 'captured').length || 0,
    processed: queueItems?.filter(i => i.status === 'processed').length || 0,
    queued: queueItems?.filter(i => i.status === 'queued').length || 0,
    approved: queueItems?.filter(i => i.status === 'approved').length || 0,
    scheduled: queueItems?.filter(i => i.status === 'scheduled').length || 0
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fila Editorial</h1>
          <p className="text-muted-foreground">
            Revise e aprove conteúdos capturados das fontes
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Todos ({tabCounts.all})
          </TabsTrigger>
          <TabsTrigger value="captured">
            Capturados ({tabCounts.captured})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processados ({tabCounts.processed})
          </TabsTrigger>
          <TabsTrigger value="queued">
            Na Fila ({tabCounts.queued})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Aprovados ({tabCounts.approved})
          </TabsTrigger>
          <TabsTrigger value="scheduled">
            Agendados ({tabCounts.scheduled})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : queueItems?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum item na fila</p>
                </div>
              ) : (
                <div className="divide-y">
                  {queueItems?.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedItemId(item.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={statusColors[item.status as QueueStatus]}>
                              {statusLabels[item.status as QueueStatus]}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {(item.source as { name?: string })?.name}
                            </span>
                          </div>
                          <h3 className="font-medium line-clamp-2">
                            {item.original_title}
                          </h3>
                          {item.original_excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {item.original_excerpt}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatDistanceToNow(new Date(item.created_at), {
                                addSuffix: true,
                                locale: ptBR
                              })}
                            </span>
                            {item.word_count > 0 && (
                              <span>{item.word_count} palavras</span>
                            )}
                            <a 
                              href={item.original_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ver original
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                        {item.original_image_url && (
                          <img 
                            src={item.original_image_url} 
                            alt=""
                            className="w-24 h-16 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Item Detail Sheet */}
      <Sheet open={!!selectedItemId} onOpenChange={() => setSelectedItemId(null)}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Detalhes do Item</SheetTitle>
            <SheetDescription>
              Revise e edite o conteúdo antes de aprovar
            </SheetDescription>
          </SheetHeader>

          {selectedItem && (
            <ScrollArea className="h-[calc(100vh-200px)] mt-6 pr-4">
              <div className="space-y-6">
                {/* Status and Source */}
                <div className="flex items-center gap-3">
                  <Badge variant={statusColors[selectedItem.status as QueueStatus]}>
                    {statusLabels[selectedItem.status as QueueStatus]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    de {(selectedItem.source as { name?: string })?.name}
                  </span>
                </div>

                {/* Original Content */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Conteúdo Original
                  </h3>
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input value={selectedItem.original_title} readOnly />
                  </div>
                  {selectedItem.original_excerpt && (
                    <div className="space-y-2">
                      <Label>Resumo</Label>
                      <Textarea value={selectedItem.original_excerpt} readOnly rows={3} />
                    </div>
                  )}
                  <a 
                    href={selectedItem.original_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    Ver artigo original
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                <Separator />

                {/* Rewritten Content (if exists) */}
                {Array.isArray(selectedItem.rewritten_post) && selectedItem.rewritten_post[0] && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Versão Reescrita
                    </h3>
                    <div className="space-y-2">
                      <Label>Título Final</Label>
                      <Input 
                        value={(selectedItem.rewritten_post[0] as { final_title?: string }).final_title || ''} 
                        readOnly 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Resumo</Label>
                      <Textarea 
                        value={(selectedItem.rewritten_post[0] as { summary?: string }).summary || ''} 
                        readOnly 
                        rows={3} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Meta Title</Label>
                        <Input 
                          value={(selectedItem.rewritten_post[0] as { seo_meta_title?: string }).seo_meta_title || ''} 
                          readOnly 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Qualidade</Label>
                        <Input 
                          value={`${(selectedItem.rewritten_post[0] as { quality_score?: number }).quality_score || 0}%`} 
                          readOnly 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Image */}
                {selectedItem.original_image_url && (
                  <>
                    <Separator />
                    <div className="space-y-3">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                        Imagem
                      </h3>
                      <img 
                        src={selectedItem.original_image_url}
                        alt="Imagem do artigo"
                        className="w-full rounded-lg"
                      />
                    </div>
                  </>
                )}

                {/* Metadata */}
                <Separator />
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                    Metadados
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Capturado em</p>
                      <p>{format(new Date(selectedItem.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Palavras</p>
                      <p>{selectedItem.word_count}</p>
                    </div>
                    {selectedItem.original_author && (
                      <div>
                        <p className="text-muted-foreground">Autor original</p>
                        <p>{selectedItem.original_author}</p>
                      </div>
                    )}
                    {selectedItem.original_published_at && (
                      <div>
                        <p className="text-muted-foreground">Publicado em</p>
                        <p>{format(new Date(selectedItem.original_published_at), "dd/MM/yyyy", { locale: ptBR })}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          {/* Actions */}
          {selectedItem && !['published', 'rejected'].includes(selectedItem.status) && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-background border-t flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleReject(selectedItem.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar
              </Button>
              <Button 
                className="flex-1"
                onClick={() => handleApprove(selectedItem.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
