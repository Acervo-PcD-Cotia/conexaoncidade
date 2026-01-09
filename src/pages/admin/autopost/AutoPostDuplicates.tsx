import { useState } from 'react';
import { Copy, Eye, Link2, FileText, Trash2, Check, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useAutoPostQueue, useAutoPostItem, useUpdateAutoPostItem } from '@/hooks/useAutoPost';

export default function AutoPostDuplicates() {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { data: duplicates, isLoading } = useAutoPostQueue('duplicate');
  const { data: selectedItem } = useAutoPostItem(selectedId || undefined);
  const updateItem = useUpdateAutoPostItem();

  const filteredDuplicates = duplicates?.filter(d => {
    if (search && !d.original_title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getDuplicateReasonBadge = (reason: string | null) => {
    switch (reason) {
      case 'url':
        return <Badge variant="outline"><Link2 className="h-3 w-3 mr-1" /> URL Idêntica</Badge>;
      case 'content_hash':
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" /> Conteúdo Idêntico</Badge>;
      case 'title_similarity':
        return <Badge variant="outline"><Copy className="h-3 w-3 mr-1" /> Título Similar</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const handleOverrideDuplicate = (id: string) => {
    updateItem.mutate({ id, status: 'queued', duplicate_of: null, duplicate_reason: null });
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Plugins', href: '/admin' },
        { label: 'Auto Post PRO', href: '/admin/autopost' },
        { label: 'Duplicados' }
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Duplicados</h1>
          <p className="text-muted-foreground">Revise itens detectados como duplicados pelo sistema</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Link2 className="h-4 w-4" /> Por URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {duplicates?.filter(d => d.duplicate_reason === 'url').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <FileText className="h-4 w-4" /> Por Conteúdo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {duplicates?.filter(d => d.duplicate_reason === 'content_hash').length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Copy className="h-4 w-4" /> Por Título Similar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {duplicates?.filter(d => d.duplicate_reason === 'title_similarity').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Itens Duplicados</CardTitle>
            <Input 
              placeholder="Buscar por título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando duplicados...</div>
          ) : !filteredDuplicates?.length ? (
            <div className="text-center py-12">
              <Check className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum duplicado detectado</h3>
              <p className="text-muted-foreground">O sistema de detecção está funcionando corretamente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Similaridade</TableHead>
                  <TableHead>Detectado em</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDuplicates.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs">
                      <p className="font-medium line-clamp-2">{item.original_title}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.source_id}
                    </TableCell>
                    <TableCell>
                      {getDuplicateReasonBadge(item.duplicate_reason)}
                    </TableCell>
                    <TableCell>
                      {item.similarity_score 
                        ? `${(item.similarity_score * 100).toFixed(0)}%`
                        : '100%'
                      }
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at || ''), "dd/MM HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedId(item.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleOverrideDuplicate(item.id)}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Forçar
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Item Details Sheet */}
      <Sheet open={!!selectedId} onOpenChange={() => setSelectedId(null)}>
        <SheetContent className="w-[600px] sm:max-w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Comparação de Duplicados</SheetTitle>
          </SheetHeader>
          {selectedItem && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-medium mb-2">Item Detectado</h3>
                <Card>
                  <CardContent className="p-4">
                    <p className="font-medium">{selectedItem.original_title}</p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-4">
                      {selectedItem.original_excerpt || selectedItem.original_content?.slice(0, 200)}
                    </p>
                    <a 
                      href={selectedItem.original_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary mt-2 inline-block hover:underline"
                    >
                      Ver original →
                    </a>
                  </CardContent>
                </Card>
              </div>

              {selectedItem.duplicate_of && (
                <div>
                  <h3 className="font-medium mb-2">Original (já publicado)</h3>
                  <Card className="border-green-200 bg-green-50/50">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        ID: {selectedItem.duplicate_of}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => handleOverrideDuplicate(selectedItem.id)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Ignorar Duplicação
                </Button>
                <Button 
                  variant="destructive" 
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Descartar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}