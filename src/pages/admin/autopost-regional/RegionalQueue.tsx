import { useState } from 'react';
import { Link } from 'react-router-dom';
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
  MapPin, 
  ArrowLeft, 
  RefreshCw,
  ExternalLink,
  Eye,
  SkipForward,
  Search,
} from 'lucide-react';
import { 
  useRegionalQueue,
  useReprocessRegionalItem,
  useSkipRegionalItem,
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

  const filteredQueue = queue?.filter((item) => {
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.regional_sources as any)?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
            <Link to="/admin/autopost-regional">
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
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
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
                          {item.title || 'Sem título'}
                        </p>
                        {item.excerpt && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.excerpt}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {(item.regional_sources as any)?.city || 'N/A'}
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
                        {(item.status === 'new' || item.status === 'failed') && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => reprocessItem.mutate(item.id)}
                            disabled={reprocessItem.isPending}
                            title="Reprocessar"
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

      {/* Item Detail Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Item</DialogTitle>
            <DialogDescription>
              Informações capturadas da fonte original
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Título</label>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedItem.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Cidade</label>
                  <p className="text-sm">{(selectedItem.regional_sources as any)?.city || 'N/A'}</p>
                </div>
              </div>
              
              {selectedItem.excerpt && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resumo</label>
                  <p className="text-sm">{selectedItem.excerpt}</p>
                </div>
              )}
              
              {selectedItem.image_url && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Imagem</label>
                  <img 
                    src={selectedItem.image_url} 
                    alt="Preview" 
                    className="mt-1 max-h-48 rounded-lg object-cover"
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Payload Bruto</label>
                <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-auto max-h-48">
                  {JSON.stringify(selectedItem.raw_payload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}