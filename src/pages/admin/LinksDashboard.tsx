import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLinkStats, useLinks } from '@/hooks/useLinks';
import { formatNumber } from '@/lib/linkUtils';
import { Link2, QrCode, FileText, BarChart3, Plus, MousePointerClick, TrendingUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function LinksDashboard() {
  const { data: stats } = useLinkStats();
  const { data: recentLinks, isLoading: linksLoading } = useLinks();

  const kpis = [
    { label: 'Total de Links', value: stats?.totalLinks || 0, icon: Link2, color: 'text-blue-500' },
    { label: 'Total de Cliques', value: stats?.totalClicks || 0, icon: MousePointerClick, color: 'text-green-500' },
    { label: 'Cliques 24h', value: stats?.clicks24h || 0, icon: Clock, color: 'text-orange-500' },
    { label: 'Cliques 7 dias', value: stats?.clicks7d || 0, icon: TrendingUp, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gerador de Links</h1>
          <p className="text-muted-foreground">Gerencie links rastreáveis, QR codes e páginas bio</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(kpi.value)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/admin/links/create">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Novo Link</h3>
                <p className="text-sm text-muted-foreground">Criar link rastreável</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/links/qr">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <QrCode className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Novo QR Code</h3>
                <p className="text-sm text-muted-foreground">Gerar QR para link</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/links/bio">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Nova Página Bio</h3>
                <p className="text-sm text-muted-foreground">Link-in-bio personalizado</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/links/reports">
          <Card className="cursor-pointer hover:bg-accent transition-colors">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="font-semibold">Relatórios</h3>
                <p className="text-sm text-muted-foreground">Analytics e métricas</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent Links */}
      <Card>
        <CardHeader>
          <CardTitle>Links Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {linksLoading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : recentLinks && recentLinks.length > 0 ? (
            <div className="space-y-4">
              {recentLinks.slice(0, 5).map((link) => (
                <div key={link.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{link.destination_url}</p>
                    <p className="text-sm text-muted-foreground">
                      {link.short_url || link.slug || 'Sem slug'}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <p className="font-semibold">{link.click_count}</p>
                      <p className="text-xs text-muted-foreground">cliques</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(link.created_at), "dd/MM", { locale: ptBR })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhum link criado ainda.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}