import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MousePointer, TrendingUp, Store, Smartphone, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePhoneOfferStats } from '@/hooks/usePhoneOffers';
import { useRequireRole } from '@/hooks/useRequireRole';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export default function PhoneOffersReport() {
  useRequireRole(['admin', 'super_admin']);

  const [period, setPeriod] = useState<string>('30');
  const { stats, isLoadingStats } = usePhoneOfferStats(Number(period));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/community">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Relatório de Ofertas</h1>
          <p className="text-muted-foreground">Métricas de cliques em links de afiliado</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoadingStats ? (
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-80" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      ) : !stats ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum dado disponível para o período selecionado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
                <MousePointer className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  Nos últimos {period} dias
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Top Celular</CardTitle>
                <Smartphone className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold truncate">
                  {stats.clicksByPhone[0]?.phone_name || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.clicksByPhone[0]?.clicks || 0} cliques
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Top Loja</CardTitle>
                <Store className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">
                  {stats.clicksByStore[0]?.store || 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.clicksByStore[0]?.clicks || 0} cliques
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Clicks Over Time Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Cliques por Dia
              </CardTitle>
              <CardDescription>Evolução de cliques no período</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.clicksByDate.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Sem dados para exibir
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.clicksByDate}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getDate()}/${date.getMonth() + 1}`;
                      }}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('pt-BR');
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="clicks"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Clicks by Store Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Cliques por Loja
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.clicksByStore.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Sem dados para exibir
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={stats.clicksByStore}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        fill="hsl(var(--primary))"
                        paddingAngle={2}
                        dataKey="clicks"
                        nameKey="store"
                        label={({ store, percent }) => `${store} ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.clicksByStore.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Top Phones Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  Top Celulares
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats.clicksByPhone.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    Sem dados para exibir
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stats.clicksByPhone.slice(0, 5)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis
                        type="category"
                        dataKey="phone_name"
                        width={120}
                        className="text-xs"
                        tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Offers Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Ofertas</CardTitle>
              <CardDescription>Ofertas com mais cliques no período</CardDescription>
            </CardHeader>
            <CardContent>
              {stats.topOffers.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhum clique registrado no período
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Celular</TableHead>
                      <TableHead>Loja</TableHead>
                      <TableHead className="text-right">Cliques</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topOffers.map((offer, index) => (
                      <TableRow key={offer.offer_id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{offer.phone_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{offer.store}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{offer.clicks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
