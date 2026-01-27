import { useState } from "react";
import { Eye, MousePointer, TrendingUp, Clock, Monitor, Smartphone, Tablet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePublidoorMetrics, usePublidoorDashboardStats, usePublidoorItems } from "@/hooks/usePublidoor";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function PublidoorMetrics() {
  const [days, setDays] = useState(30);
  const [selectedPublidoor, setSelectedPublidoor] = useState<string>("all");
  
  const { data: stats } = usePublidoorDashboardStats();
  const { data: items } = usePublidoorItems();
  const { data: metrics, isLoading } = usePublidoorMetrics(
    selectedPublidoor === "all" ? undefined : selectedPublidoor,
    days
  );

  // Aggregate metrics by date
  const dailyData = metrics?.reduce((acc, m) => {
    const key = m.date;
    if (!acc[key]) {
      acc[key] = { date: key, impressions: 0, clicks: 0 };
    }
    acc[key].impressions += m.impressions;
    acc[key].clicks += m.clicks;
    return acc;
  }, {} as Record<string, { date: string; impressions: number; clicks: number }>);

  const chartData = Object.values(dailyData || {})
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({
      ...d,
      dateLabel: format(new Date(d.date), "dd/MM", { locale: ptBR }),
      ctr: d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(2) : 0,
    }));

  // Device breakdown
  const deviceData = metrics?.reduce((acc, m) => {
    const device = m.device || "desktop";
    if (!acc[device]) {
      acc[device] = { device, impressions: 0, clicks: 0 };
    }
    acc[device].impressions += m.impressions;
    acc[device].clicks += m.clicks;
    return acc;
  }, {} as Record<string, { device: string; impressions: number; clicks: number }>);

  const deviceChartData = Object.values(deviceData || {}).map((d) => ({
    name: d.device === "desktop" ? "Desktop" : d.device === "mobile" ? "Mobile" : "Tablet",
    value: d.impressions,
    clicks: d.clicks,
  }));

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop":
        return <Monitor className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Tablet className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Métricas</h1>
          <p className="text-muted-foreground">Acompanhe o desempenho dos seus Publidoors</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedPublidoor} onValueChange={setSelectedPublidoor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos os Publidoors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Publidoors</SelectItem>
              {items?.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.internal_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalImpressions?.toLocaleString("pt-BR") || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalClicks?.toLocaleString("pt-BR") || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.ctr || 0}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Est.</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {stats?.estimatedRevenue?.toLocaleString("pt-BR") || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Impressions & Clicks Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Impressões e Cliques</CardTitle>
            <CardDescription>Evolução ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="impressions" fill="#3b82f6" name="Impressões" />
                  <Bar dataKey="clicks" fill="#10b981" name="Cliques" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* CTR Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Cliques (CTR)</CardTitle>
            <CardDescription>Evolução do CTR ao longo do tempo</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados para o período selecionado
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateLabel" />
                  <YAxis unit="%" />
                  <Tooltip formatter={(value) => [`${value}%`, "CTR"]} />
                  <Line type="monotone" dataKey="ctr" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Device Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Dispositivo</CardTitle>
            <CardDescription>Impressões por tipo de dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            {deviceChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados disponíveis
              </div>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {deviceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {deviceChartData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                      />
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(d.name)}
                        <span>{d.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {d.value.toLocaleString("pt-BR")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comparison Info */}
        <Card>
          <CardHeader>
            <CardTitle>Comparativo</CardTitle>
            <CardDescription>Publidoor vs Banner Tradicional</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                <div>
                  <p className="font-medium">Publidoor Premium</p>
                  <p className="text-sm text-muted-foreground">Outdoor digital interativo</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">CTR ~2.5%</p>
                  <p className="text-xs text-muted-foreground">Média de engajamento</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Banner Tradicional</p>
                  <p className="text-sm text-muted-foreground">Formato estático padrão</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-muted-foreground">CTR ~0.5%</p>
                  <p className="text-xs text-muted-foreground">Média de engajamento</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center pt-2">
                Publidoors premium têm em média 5x mais engajamento que banners tradicionais.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
