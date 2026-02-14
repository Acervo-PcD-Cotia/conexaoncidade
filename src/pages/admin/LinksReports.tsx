import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  BarChart3,
  Link2,
  MousePointerClick,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  Download,
  Calendar,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';

export default function LinksReports() {
  const [period, setPeriod] = useState('7');

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['link-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('click_count')
        .limit(1000);
      
      if (error) throw error;
      
      const totalClicks = data?.reduce((acc, l) => acc + (l.click_count || 0), 0) || 0;
      return {
        totalLinks: data?.length || 0,
        totalClicks,
      };
    },
  });

  const { data: topLinks = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['top-links', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('id, slug, destination_url, click_count, created_at, utm_source, utm_medium, utm_campaign')
        .order('click_count', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return data;
    },
  });

  const { data: clickEvents = [] } = useQuery({
    queryKey: ['click-events', period],
    queryFn: async () => {
      // Note: click_events table may not exist - return empty for now
      return [] as { device_type?: string }[];
    },
  });

  // Calculate device distribution
  const deviceStats = clickEvents.reduce((acc, event) => {
    const device = event.device_type || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalDeviceClicks = Object.values(deviceStats).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Relatórios de Links</h1>
          <p className="text-muted-foreground">
            Analytics e métricas dos seus links rastreáveis
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" asChild>
            <Link to="/spah/painel/links">
              <Link2 className="mr-2 h-4 w-4" />
              Voltar para Links
            </Link>
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Links</CardTitle>
            <Link2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLinks || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalClicks?.toLocaleString('pt-BR') || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cliques no Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickEvents.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Taxa Média</CardTitle>
            <BarChart3 className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalLinks ? (stats.totalClicks / stats.totalLinks).toFixed(1) : 0}
            </div>
            <p className="text-xs text-muted-foreground">cliques/link</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Links */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Links Mais Clicados</CardTitle>
            <CardDescription>Ranking por número de cliques</CardDescription>
          </CardHeader>
          <CardContent>
            <AdminLoadingState
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
            >
              {topLinks.length === 0 ? (
                <AdminEmptyState
                  icon={BarChart3}
                  title="Sem dados"
                  description="Nenhum link com cliques registrados no período."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Campanha</TableHead>
                      <TableHead className="text-right">Cliques</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topLinks.slice(0, 10).map((link, index) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-bold text-muted-foreground">
                          {index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="truncate max-w-[250px]">
                            <p className="font-medium text-sm">/{link.slug}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {link.destination_url}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {link.utm_campaign ? (
                            <Badge variant="outline">{link.utm_campaign}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {link.click_count?.toLocaleString('pt-BR') || 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </AdminLoadingState>
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Dispositivos</CardTitle>
            <CardDescription>Distribuição por tipo de dispositivo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalDeviceClicks === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Sem dados no período
              </p>
            ) : (
              <>
                {Object.entries(deviceStats)
                  .sort((a, b) => b[1] - a[1])
                  .map(([device, count]) => {
                    const percentage = ((count / totalDeviceClicks) * 100).toFixed(1);
                    const Icon = device === 'mobile' ? Smartphone : device === 'desktop' ? Monitor : Globe;
                    
                    return (
                      <div key={device} className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium capitalize">{device}</span>
                            <span className="text-sm text-muted-foreground">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
