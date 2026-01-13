import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileText, Plus, Eye, Download, Filter, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import { AdminEmptyState, IntegrationPendingState } from '@/components/admin/AdminEmptyState';
import { toast } from 'sonner';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  draft: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  sent: { label: 'Enviada', color: 'bg-blue-100 text-blue-700', icon: Send },
  paid: { label: 'Paga', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  overdue: { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function FinancialInvoices() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Try to fetch invoices - this table might not exist yet
  const { data: invoices = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ['invoices', statusFilter, typeFilter],
    queryFn: async () => {
      // Check if table exists by trying a simple query
      const { data, error } = await supabase
        .from('banner_campaign_invoices')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.log('Invoice fetch error:', error);
        // Return empty array if table doesn't exist or has issues
        return [];
      }
      return data || [];
    },
    retry: false,
  });

  const handleCreateInvoice = () => {
    toast.info('Função de criação de notas em desenvolvimento');
  };

  // Show integration pending state if no data and potentially no table
  const showIntegrationPending = invoices.length === 0 && !isLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notas e Recibos</h1>
          <p className="text-muted-foreground">
            Emita e gerencie documentos fiscais
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button onClick={handleCreateInvoice}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Nota
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Emitido</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">notas/recibos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {invoices.filter((i) => i.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {invoices.filter((i) => i.paid_at).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(invoices.reduce((acc, i) => acc + (i.total_amount || 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunhos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="sent">Enviadas</SelectItem>
            <SelectItem value="paid">Pagas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="nf">Nota Fiscal</SelectItem>
            <SelectItem value="receipt">Recibo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      <AdminLoadingState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Carregando notas e recibos..."
      >
        {showIntegrationPending ? (
          <IntegrationPendingState
            featureName="Emissão de Notas Fiscais"
            description="A integração com serviços de emissão de NF-e está em desenvolvimento. Por enquanto, você pode gerar recibos manuais."
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const status = statusConfig[invoice.status || 'pending'];
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-mono text-sm">
                        #{invoice.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {invoice.invoice_period_start && invoice.invoice_period_end && (
                          <span className="text-sm">
                            {format(new Date(invoice.invoice_period_start), 'dd/MM', { locale: ptBR })}
                            {' - '}
                            {format(new Date(invoice.invoice_period_end), 'dd/MM/yy', { locale: ptBR })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.total_amount || 0)}
                      </TableCell>
                      <TableCell>
                        <Badge className={status?.color || 'bg-gray-100'}>
                          {status?.label || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invoice.due_date
                          ? format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </AdminLoadingState>
    </div>
  );
}
