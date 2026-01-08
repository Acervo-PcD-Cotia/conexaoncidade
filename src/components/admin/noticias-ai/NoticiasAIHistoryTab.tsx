import { useState, useEffect } from 'react';
import { RefreshCw, ExternalLink, Edit, CheckCircle, XCircle, Wand2, FileText, FileSpreadsheet, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { exportHistoryToPDF, exportHistoryToExcel } from '@/lib/exportUtils';

interface ImportRecord {
  id: string;
  title: string;
  source_url: string;
  source_name: string;
  source_badge: string;
  import_type: string;
  status: string;
  format_corrected: boolean;
  news_id: string;
  created_at: string;
}

const SOURCE_COLORS: Record<string, string> = {
  'AB': 'bg-green-500',
  'G1': 'bg-red-500',
  'FSP': 'bg-blue-900',
  'UOL': 'bg-orange-500',
  'EST': 'bg-blue-500',
  'CNN': 'bg-red-800',
  'BBC': 'bg-gray-800',
  'R7': 'bg-red-600',
  'TRR': 'bg-green-600',
  'iG': 'bg-purple-600',
  'EXT': 'bg-gray-500',
};

const TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  individual: { label: 'Individual', icon: '🔗' },
  batch: { label: 'Lote', icon: '📦' },
  json: { label: 'JSON', icon: '📄' },
};

export function NoticiasAIHistoryTab() {
  const [imports, setImports] = useState<ImportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchImports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('noticias_ai_imports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setImports(data || []);
    } catch (error) {
      console.error('Error fetching imports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImports();
  }, []);

  return (
    <div className="space-y-4" data-tour="history-tab">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Histórico de Importações</CardTitle>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={imports.length === 0}>
                  <Download className="mr-1 h-4 w-4" />
                  Exportar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => exportHistoryToPDF(imports, 'Últimas 50 importações')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportHistoryToExcel(imports, 'Últimas 50 importações')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Exportar Excel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="sm" onClick={fetchImports} disabled={loading}>
              <RefreshCw className={`mr-1 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {imports.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center text-muted-foreground">
              Nenhuma importação registrada ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {imports.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(record.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <span className="line-clamp-1 font-medium">{record.title || 'Sem título'}</span>
                    </TableCell>
                    <TableCell>
                      {record.source_badge && (
                        <Badge
                          className={`${SOURCE_COLORS[record.source_badge] || SOURCE_COLORS.EXT} text-white`}
                        >
                          {record.source_badge}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        {TYPE_LABELS[record.import_type]?.icon || '📄'}
                        {TYPE_LABELS[record.import_type]?.label || record.import_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.status === 'success' ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Sucesso
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Erro
                          </Badge>
                        )}
                        {record.format_corrected && (
                          <Badge variant="outline" className="text-xs">
                            <Wand2 className="mr-1 h-3 w-3" />
                            Auto-corrigido
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {record.news_id && (
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/admin/news/${record.news_id}/edit`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {record.source_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={record.source_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
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
