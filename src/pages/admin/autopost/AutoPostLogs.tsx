import { useState } from 'react';
import { Search, RefreshCw, Download, Filter, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useAutoPostLogs } from '@/hooks/useAutoPost';

const actionCategories = {
  source: 'Fontes',
  capture: 'Captura',
  rewrite: 'Reescrita',
  publish: 'Publicação',
  review: 'Revisão',
  rule: 'Regras',
  system: 'Sistema',
};

const actionLabels: Record<string, string> = {
  source_created: 'Fonte criada',
  source_updated: 'Fonte atualizada',
  source_deleted: 'Fonte removida',
  source_paused: 'Fonte pausada',
  source_activated: 'Fonte ativada',
  job_started: 'Captura iniciada',
  job_completed: 'Captura concluída',
  job_failed: 'Captura falhou',
  item_captured: 'Item capturado',
  item_duplicate: 'Duplicado detectado',
  item_rewritten: 'Item reescrito',
  item_approved: 'Item aprovado',
  item_rejected: 'Item rejeitado',
  item_published: 'Item publicado',
  rule_created: 'Regra criada',
  rule_updated: 'Regra atualizada',
  rule_deleted: 'Regra removida',
};

export default function AutoPostLogs() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('');
  
  const { data: logs, isLoading, refetch } = useAutoPostLogs();

  const filteredLogs = logs?.filter(log => {
    if (search) {
      const searchLower = search.toLowerCase();
      if (
        !log.action.toLowerCase().includes(searchLower) &&
        !log.entity_name?.toLowerCase().includes(searchLower) &&
        !log.actor_email?.toLowerCase().includes(searchLower)
      ) {
        return false;
      }
    }
    if (categoryFilter && log.action_category !== categoryFilter) return false;
    if (actionFilter && log.action !== actionFilter) return false;
    return true;
  });

  const getLevelIcon = (action: string) => {
    if (action.includes('failed') || action.includes('error')) {
      return <AlertCircle className="h-4 w-4 text-destructive" />;
    }
    if (action.includes('warning') || action.includes('duplicate')) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    if (action.includes('completed') || action.includes('published') || action.includes('approved')) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const exportLogs = () => {
    if (!filteredLogs) return;
    const csv = [
      ['Data', 'Ação', 'Entidade', 'Usuário', 'Detalhes'].join(','),
      ...filteredLogs.map(log => [
        format(new Date(log.created_at || ''), "dd/MM/yyyy HH:mm:ss"),
        actionLabels[log.action] || log.action,
        log.entity_name || log.entity_id,
        log.actor_email || '-',
        JSON.stringify(log.metadata || {}),
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autopost-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Logs de Auditoria</h1>
          <p className="text-muted-foreground">Histórico completo de ações do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {Object.entries(actionCategories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando logs...</div>
          ) : !filteredLogs?.length ? (
            <div className="text-center py-12">
              <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum log encontrado</h3>
              <p className="text-muted-foreground">Os logs serão exibidos aqui conforme o sistema opera</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Categoria</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {getLevelIcon(log.action)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at || ''), "dd/MM HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {actionLabels[log.action] || log.action}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {log.entity_name || log.entity_id}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.actor_email || 'Sistema'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {actionCategories[log.action_category as keyof typeof actionCategories] || log.action_category}
                      </Badge>
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