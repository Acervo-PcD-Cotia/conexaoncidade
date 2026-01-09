import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, Search, MoreHorizontal, Pencil, Pause, Play, 
  Trash2, ExternalLink, Activity, Rss, Globe, FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAutoPostSources, useAutoPostGroups, useUpdateAutoPostSource, useDeleteAutoPostSource } from '@/hooks/useAutoPost';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';

const sourceTypeIcons: Record<string, React.ReactNode> = {
  rss: <Rss className="h-4 w-4" />,
  sitemap: <Globe className="h-4 w-4" />,
  html_crawler: <FileText className="h-4 w-4" />,
  api: <Activity className="h-4 w-4" />,
  manual_url: <ExternalLink className="h-4 w-4" />
};

type SourceStatus = 'active' | 'paused' | 'error';

export default function AutoPostSources() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SourceStatus | ''>('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sources, isLoading } = useAutoPostSources({
    status: statusFilter || undefined,
    groupId: groupFilter || undefined
  });
  const { data: groups } = useAutoPostGroups();
  const updateSource = useUpdateAutoPostSource();
  const deleteSource = useDeleteAutoPostSource();

  const filteredSources = sources?.filter(source =>
    source.name.toLowerCase().includes(search.toLowerCase()) ||
    source.site_url.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleStatus = (source: NonNullable<typeof sources>[0]) => {
    const newStatus = source.status === 'active' ? 'paused' : 'active';
    updateSource.mutate({ id: source.id, status: newStatus });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteSource.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fontes & Parceiros</h1>
          <p className="text-muted-foreground">
            Gerencie as fontes de conteúdo para importação automática
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/autopost/sources/new">
            <Plus className="h-4 w-4 mr-2" />
            Nova Fonte
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar fontes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SourceStatus | '')}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os status</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="paused">Pausado</SelectItem>
                <SelectItem value="error">Com erro</SelectItem>
              </SelectContent>
            </Select>
            <Select value={groupFilter} onValueChange={setGroupFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os grupos</SelectItem>
                {groups?.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Modo</TableHead>
                <TableHead>Frequência</TableHead>
                <TableHead>Última Execução</TableHead>
                <TableHead>Saúde</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                  </TableRow>
                ))
              ) : filteredSources?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nenhuma fonte encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredSources?.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{source.name}</p>
                        <a 
                          href={source.site_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:underline flex items-center gap-1"
                        >
                          {source.site_url.replace(/^https?:\/\//, '').slice(0, 30)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {sourceTypeIcons[source.source_type]}
                        <span className="text-sm capitalize">
                          {source.source_type.replace('_', ' ')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(source.group as { name?: string })?.name || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        source.status === 'active' ? 'default' :
                        source.status === 'error' ? 'destructive' : 'secondary'
                      }>
                        {source.status === 'active' && 'Ativo'}
                        {source.status === 'paused' && 'Pausado'}
                        {source.status === 'error' && 'Erro'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {source.import_mode === 'auto_publish' && 'Auto'}
                        {source.import_mode === 'queue_review' && 'Fila'}
                        {source.import_mode === 'capture_only' && 'Captura'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {source.schedule_frequency_minutes}min
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {source.last_run_at ? formatDistanceToNow(new Date(source.last_run_at), {
                          addSuffix: true,
                          locale: ptBR
                        }) : 'Nunca'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-sm font-medium ${getHealthColor(source.health_score)}`}>
                        {source.health_score}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/autopost/sources/${source.id}`}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(source)}>
                            {source.status === 'active' ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pausar
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Ativar
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => setDeleteId(source.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir fonte?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os itens capturados desta fonte 
              também serão excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
