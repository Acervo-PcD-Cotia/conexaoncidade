import { useState } from "react";
import { BarChart3, Users, Eye, Clock, Globe, Monitor, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useTvStats } from "../hooks";
import { KpiCard } from "../components";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "#10b981", "#f59e0b", "#8b5cf6"];

const countryFlags: Record<string, string> = {
  BR: "🇧🇷",
  US: "🇺🇸",
  PT: "🇵🇹",
  AR: "🇦🇷",
  MX: "🇲🇽",
};

export default function TvStats() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");
  const { data: stats, isLoading, error, refetch } = useTvStats(period);

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            Erro ao carregar estatísticas
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Estatísticas</h1>
            <p className="text-muted-foreground">Métricas de audiência e engajamento</p>
          </div>
        </div>

        <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Hoje</SelectItem>
            <SelectItem value="week">Últimos 7 dias</SelectItem>
            <SelectItem value="month">Últimos 30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      ) : stats ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiCard
              title="Total de Views"
              value={stats.summary.totalViews.toLocaleString()}
              icon={Eye}
            />
            <KpiCard
              title="Pico de Espectadores"
              value={stats.summary.peakViewers.toLocaleString()}
              icon={Users}
            />
            <KpiCard
              title="Sessão Média"
              value={`${stats.summary.avgWatchMinutes} min`}
              icon={Clock}
            />
            <KpiCard
              title="Horas Assistidas"
              value={stats.summary.totalHoursWatched.toLocaleString()}
              icon={Monitor}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Views Timeseries */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Views ao Longo do Tempo</CardTitle>
                <CardDescription>Evolução de visualizações no período</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.viewsTimeseries}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="ts" 
                        tick={{ fontSize: 12 }}
                        className="text-muted-foreground"
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return period === "day" 
                            ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                            : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                        }}
                      />
                      <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleString("pt-BR")}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Devices Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dispositivos</CardTitle>
                <CardDescription>Distribuição por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.devices}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="count"
                        nameKey="device"
                      >
                        {stats.devices.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value, name) => [`${value} (${stats.devices.find(d => d.device === name)?.percentage}%)`, name]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {stats.devices.map((device, index) => (
                    <div key={device.device} className="flex items-center gap-1.5 text-xs">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span>{device.device}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tables Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top Referrers</CardTitle>
                <CardDescription>De onde vem o tráfego</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topReferrers.slice(0, 5).map((ref) => (
                      <TableRow key={ref.ref}>
                        <TableCell className="font-medium truncate max-w-[150px]">
                          {ref.ref}
                        </TableCell>
                        <TableCell className="text-right">{ref.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top VODs */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Top VODs</CardTitle>
                <CardDescription>Vídeos mais assistidos</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topVods.slice(0, 5).map((vod) => (
                      <TableRow key={vod.vodId}>
                        <TableCell className="font-medium truncate max-w-[150px]">
                          {vod.title}
                        </TableCell>
                        <TableCell className="text-right">{vod.views.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Countries */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Top Países
                </CardTitle>
                <CardDescription>Distribuição geográfica</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>País</TableHead>
                      <TableHead className="text-right">Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.geoData.slice(0, 5).map((geo) => (
                      <TableRow key={geo.code}>
                        <TableCell className="font-medium">
                          <span className="mr-2">{countryFlags[geo.code] || "🌍"}</span>
                          {geo.country}
                        </TableCell>
                        <TableCell className="text-right">{geo.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
