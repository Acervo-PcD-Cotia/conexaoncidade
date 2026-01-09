import { useState } from 'react';
import { Image, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useAutoPostMedia } from '@/hooks/useAutoPost';

export default function AutoPostMedia() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { data: media, isLoading } = useAutoPostMedia();

  const filteredMedia = media?.filter(m => {
    if (search && !m.source_url.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && m.processing_status !== statusFilter) return false;
    return true;
  });

  const stats = {
    total: media?.length || 0,
    valid: media?.filter(m => m.is_valid).length || 0,
    invalid: media?.filter(m => m.is_valid === false).length || 0,
    pending: media?.filter(m => m.processing_status === 'pending').length || 0,
  };

  const getStatusBadge = (item: typeof media[0]) => {
    if (item.is_valid === true) {
      return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Válida</Badge>;
    }
    if (item.is_valid === false) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Inválida</Badge>;
    }
    return <Badge variant="outline"><RefreshCw className="h-3 w-3 mr-1" /> Processando</Badge>;
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Plugins', href: '/admin' },
        { label: 'Auto Post PRO', href: '/admin/autopost' },
        { label: 'Mídia' }
      ]} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Mídia</h1>
          <p className="text-muted-foreground">Visualize e valide imagens capturadas automaticamente</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Reprocessar Pendentes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Imagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" /> Válidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.valid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <XCircle className="h-4 w-4 text-destructive" /> Inválidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.invalid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-4 w-4 text-muted-foreground" /> Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle>Imagens Capturadas</CardTitle>
            <div className="flex gap-2">
              <Input 
                placeholder="Buscar por URL..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="processing">Processando</SelectItem>
                  <SelectItem value="completed">Completos</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando mídia...</div>
          ) : !filteredMedia?.length ? (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhuma imagem encontrada</h3>
              <p className="text-muted-foreground">As imagens serão exibidas aqui após a captura de conteúdo</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Preview</TableHead>
                  <TableHead>URL de Origem</TableHead>
                  <TableHead>Dimensões</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Erro</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedia.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {item.local_url || item.source_url ? (
                        <img 
                          src={item.local_url || item.source_url} 
                          alt={item.alt_text || 'Preview'} 
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate text-sm font-mono">{item.source_url}</p>
                    </TableCell>
                    <TableCell>
                      {item.width && item.height 
                        ? `${item.width}x${item.height}`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {item.file_size 
                        ? `${(item.file_size / 1024).toFixed(1)} KB`
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(item)}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {item.validation_error ? (
                        <span className="text-sm text-destructive flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {item.validation_error}
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <a href={item.source_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                        {item.local_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={item.local_url} download>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}