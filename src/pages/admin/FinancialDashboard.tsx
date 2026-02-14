import { Link } from 'react-router-dom';
import { DollarSign, FileText, Users, TrendingUp, ArrowRight, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFinancialSummary, useReceivables, useFiscalProfiles } from '@/hooks/useFiscal';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  pending: { label: 'Pendente', variant: 'secondary', icon: Clock },
  approved: { label: 'Aprovado', variant: 'outline', icon: CheckCircle },
  paid: { label: 'Pago', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'destructive', icon: XCircle },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export default function FinancialDashboard() {
  const { data: summary, isLoading: loadingSummary } = useFinancialSummary();
  const { data: receivables = [], isLoading: loadingReceivables } = useReceivables();
  const { data: profiles = [] } = useFiscalProfiles();

  const recentReceivables = receivables.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Gerencie recebíveis, notas e perfis fiscais</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bruto</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loadingSummary ? '...' : formatCurrency(summary?.total_gross || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Líquido: {loadingSummary ? '...' : formatCurrency(summary?.total_net || 0)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loadingSummary ? '...' : formatCurrency(summary?.pending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Aguardando aprovação</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pagos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loadingSummary ? '...' : formatCurrency(summary?.paid || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Já recebido</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Perfis Fiscais</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
            <p className="text-xs text-muted-foreground">Cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Perfis Fiscais
            </CardTitle>
            <CardDescription>
              Gerencie dados fiscais de jornalistas e colaboradores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/spah/painel/financial/profiles">
                Gerenciar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recebíveis
            </CardTitle>
            <CardDescription>
              Acompanhe pagamentos de campanhas, eventos e ads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/spah/painel/financial/receivables">
                Ver Todos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notas e Recibos
            </CardTitle>
            <CardDescription>
              Emita e gerencie documentos fiscais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/spah/painel/financial/invoices">
                Gerenciar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Receivables */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recebíveis Recentes</CardTitle>
            <CardDescription>Últimas movimentações financeiras</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/spah/painel/financial/receivables">
              Ver todos
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loadingReceivables ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-24 bg-muted rounded" />
                  </div>
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>
              ))}
            </div>
          ) : recentReceivables.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum recebível registrado ainda</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentReceivables.map(receivable => {
                const status = statusConfig[receivable.status || 'pending'];
                const StatusIcon = status.icon;
                
                return (
                  <div
                    key={receivable.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon className={`h-5 w-5 ${
                        receivable.status === 'paid' ? 'text-green-500' :
                        receivable.status === 'pending' ? 'text-yellow-500' :
                        receivable.status === 'cancelled' ? 'text-red-500' :
                        'text-muted-foreground'
                      }`} />
                      <div>
                        <p className="font-medium">{receivable.description || `${receivable.source_type} - ${receivable.id.slice(0, 8)}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {receivable.created_at && format(new Date(receivable.created_at), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(receivable.gross_amount)}</p>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
