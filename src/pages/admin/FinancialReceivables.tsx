import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import { DollarSign, Clock, CheckCircle, XCircle, Filter, Download, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Aprovado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle },
  paid: { label: 'Pago', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const sourceLabels: Record<string, string> = {
  campaign: 'Campanha',
  banner: 'Banner',
  ad: 'Anúncio',
  event: 'Evento',
  other: 'Outro',
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function FinancialReceivables() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: receivables = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['receivables', statusFilter, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from('receivables')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (sourceFilter !== 'all') {
        query = query.eq('source_type', sourceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filteredReceivables = receivables.filter((r) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.description?.toLowerCase().includes(term) ||
      r.id.toLowerCase().includes(term)
    );
  });

  const totals = {
    pending: receivables.filter((r) => r.status === 'pending').reduce((acc, r) => acc + r.gross_amount, 0),
    approved: receivables.filter((r) => r.status === 'approved').reduce((acc, r) => acc + r.gross_amount, 0),
    paid: receivables.filter((r) => r.status === 'paid').reduce((acc, r) => acc + r.gross_amount, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recebíveis</h1>
          <p className="text-muted-foreground">
            Acompanhe pagamentos de campanhas, eventos e anúncios
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totals.pending)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(totals.approved)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totals.paid)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="approved">Aprovados</SelectItem>
            <SelectItem value="paid">Pagos</SelectItem>
            <SelectItem value="cancelled">Cancelados</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Origem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="campaign">Campanhas</SelectItem>
            <SelectItem value="banner">Banners</SelectItem>
            <SelectItem value="ad">Anúncios</SelectItem>
            <SelectItem value="event">Eventos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <AdminLoadingState
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        loadingMessage="Carregando recebíveis..."
      >
        {filteredReceivables.length === 0 ? (
          <AdminEmptyState
            icon={DollarSign}
            title="Nenhum recebível encontrado"
            description="Quando houver pagamentos de campanhas, eventos ou anúncios, eles aparecerão aqui."
          />
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Valor Bruto</TableHead>
                  <TableHead>Valor Líquido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceivables.map((receivable) => {
                  const status = statusConfig[receivable.status || 'pending'];
                  return (
                    <TableRow key={receivable.id}>
                      <TableCell>
                        <div className="font-medium">
                          {receivable.description || `#${receivable.id.slice(0, 8)}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {sourceLabels[receivable.source_type] || receivable.source_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(receivable.gross_amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(receivable.net_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(receivable.created_at), "dd/MM/yyyy", { locale: ptBR })}
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
