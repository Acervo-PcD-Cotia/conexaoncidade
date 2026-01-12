import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BarChart3, Eye, MousePointer, TrendingUp, Download } from "lucide-react";
import { format, subDays, parseISO, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  clicks: {
    label: "Cliques",
    color: "hsl(var(--primary))",
  },
  impressions: {
    label: "Impressões",
    color: "hsl(var(--secondary))",
  },
  ctr: {
    label: "CTR (%)",
    color: "hsl(var(--accent))",
  },
};

export function BannerMetrics() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });

  // Fetch clicks for the period
  const { data: clicksData, isLoading: loadingClicks } = useQuery({
    queryKey: ["banner-clicks", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_clicks")
        .select("*, super_banners(id, title, image_url)")
        .gte("clicked_at", `${dateRange.start}T00:00:00`)
        .lte("clicked_at", `${dateRange.end}T23:59:59`);
      if (error) throw error;
      return data;
    },
  });

  // Fetch impressions for the period
  const { data: impressionsData, isLoading: loadingImpressions } = useQuery({
    queryKey: ["banner-impressions", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_impressions")
        .select("*, super_banners(id, title)")
        .gte("viewed_at", `${dateRange.start}T00:00:00`)
        .lte("viewed_at", `${dateRange.end}T23:59:59`);
      if (error) throw error;
      return data;
    },
  });

  // Calculate metrics per banner
  const metrics = useMemo(() => {
    const bannerStats: Record<
      string,
      {
        id: string;
        title: string;
        imageUrl: string;
        clicks: number;
        impressions: number;
        ctr: number;
      }
    > = {};

    clicksData?.forEach((click) => {
      const id = click.banner_id;
      if (!id) return;
      if (!bannerStats[id]) {
        bannerStats[id] = {
          id,
          title: click.super_banners?.title || "Sem título",
          imageUrl: click.super_banners?.image_url || "",
          clicks: 0,
          impressions: 0,
          ctr: 0,
        };
      }
      bannerStats[id].clicks++;
    });

    impressionsData?.forEach((imp) => {
      const id = imp.banner_id;
      if (!id) return;
      if (!bannerStats[id]) {
        bannerStats[id] = {
          id,
          title: imp.super_banners?.title || "Sem título",
          imageUrl: "",
          clicks: 0,
          impressions: 0,
          ctr: 0,
        };
      }
      bannerStats[id].impressions++;
    });

    // Calculate CTR
    Object.values(bannerStats).forEach((stat) => {
      stat.ctr = stat.impressions > 0 ? (stat.clicks / stat.impressions) * 100 : 0;
    });

    return Object.values(bannerStats).sort((a, b) => b.clicks - a.clicks);
  }, [clicksData, impressionsData]);

  // Daily data for line chart
  const dailyData = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return [];

    const startDate = parseISO(dateRange.start);
    const endDate = parseISO(dateRange.end);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const grouped: Record<string, { date: string; clicks: number; impressions: number; ctr: number }> = {};

    // Initialize all days
    days.forEach((day) => {
      const dateKey = format(day, "yyyy-MM-dd");
      grouped[dateKey] = { date: format(day, "dd/MM", { locale: ptBR }), clicks: 0, impressions: 0, ctr: 0 };
    });

    clicksData?.forEach((click) => {
      const date = format(new Date(click.clicked_at), "yyyy-MM-dd");
      if (grouped[date]) grouped[date].clicks++;
    });

    impressionsData?.forEach((imp) => {
      const date = format(new Date(imp.viewed_at), "yyyy-MM-dd");
      if (grouped[date]) grouped[date].impressions++;
    });

    // Calculate CTR for each day
    Object.values(grouped).forEach((day) => {
      day.ctr = day.impressions > 0 ? (day.clicks / day.impressions) * 100 : 0;
    });

    return Object.values(grouped);
  }, [clicksData, impressionsData, dateRange]);

  // CTR bar chart data
  const ctrBarData = useMemo(() => {
    return metrics.slice(0, 10).map((m) => ({
      name: m.title.length > 15 ? m.title.slice(0, 15) + "..." : m.title,
      ctr: Number(m.ctr.toFixed(2)),
      clicks: m.clicks,
    }));
  }, [metrics]);

  const totalClicks = metrics.reduce((sum, m) => sum + m.clicks, 0);
  const totalImpressions = metrics.reduce((sum, m) => sum + m.impressions, 0);
  const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  const isLoading = loadingClicks || loadingImpressions;

  const handleExportCSV = () => {
    const headers = ["Banner", "Cliques", "Impressões", "CTR (%)"];
    const rows = metrics.map((m) => [m.title, m.clicks, m.impressions, m.ctr.toFixed(2)]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `banner-metrics-${dateRange.start}-${dateRange.end}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Data Inicial</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, start: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Data Final</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, end: e.target.value }))
                }
              />
            </div>
            <Button variant="outline" onClick={handleExportCSV} disabled={metrics.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalClicks}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : totalImpressions}</div>
            <p className="text-xs text-muted-foreground">visualizações de banners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CTR Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : `${avgCtr.toFixed(2)}%`}
            </div>
            <p className="text-xs text-muted-foreground">taxa de cliques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Banners Ativos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "..." : metrics.length}</div>
            <p className="text-xs text-muted-foreground">com dados no período</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Line Chart - Daily Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Evolução Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : dailyData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Sem dados no período
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                      className="text-muted-foreground"
                    />
                    <YAxis yAxisId="left" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <p className="text-sm font-medium">{label}</p>
                              {payload.map((entry, index) => (
                                <p key={index} className="text-xs" style={{ color: entry.color }}>
                                  {entry.name}: {entry.value}
                                  {entry.name === "CTR" ? "%" : ""}
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="clicks"
                      name="Cliques"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="impressions"
                      name="Impressões"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="ctr"
                      name="CTR"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - CTR by Banner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              CTR por Banner
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Carregando...
              </div>
            ) : ctrBarData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Sem dados no período
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ctrBarData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 11 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <p className="text-sm font-medium">{data.name}</p>
                              <p className="text-xs text-muted-foreground">
                                CTR: {data.ctr}%
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Cliques: {data.clicks}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="ctr"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance por Banner
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">Carregando métricas...</div>
          ) : metrics.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum dado disponível no período selecionado
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banner</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">Impressões</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {m.imageUrl && (
                          <div className="h-10 w-16 overflow-hidden rounded">
                            <img
                              src={m.imageUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <span className="font-medium">{m.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{m.clicks}</TableCell>
                    <TableCell className="text-right">{m.impressions}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          m.ctr >= 3
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : m.ctr >= 1
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {m.ctr.toFixed(2)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        CTR = Cliques ÷ Impressões × 100. Verde: ≥3%, Amarelo: ≥1%, Cinza: &lt;1%
      </p>
    </div>
  );
}
