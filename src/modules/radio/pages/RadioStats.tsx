import { useState } from "react";
import { BarChart3, Users, Clock, Globe, Smartphone, Music } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KpiCard } from "../components";
import { useRadioStats } from "../hooks/useRadioStats";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const periods = [
  { value: "day", label: "Hoje" },
  { value: "week", label: "Últimos 7 dias" },
  { value: "month", label: "Últimos 30 dias" },
] as const;

const chartConfig = {
  listeners: {
    label: "Ouvintes",
    color: "hsl(var(--primary))",
  },
};

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--muted))", "hsl(var(--accent))"];

export default function RadioStats() {
  const [period, setPeriod] = useState<"day" | "week" | "month">("week");
  const { data: stats, isLoading, error, refetch } = useRadioStats(period);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar estatísticas</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <BarChart3 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Estatísticas</h1>
            <p className="text-muted-foreground">
              Métricas de audiência e engajamento
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {periods.map((p) => (
            <Button
              key={p.value}
              variant={period === p.value ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Total de Ouvintes"
          value={stats?.summary.totalListeners.toLocaleString() ?? 0}
          icon={Users}
        />
        <KpiCard
          title="Pico de Ouvintes"
          value={stats?.summary.peakListeners ?? 0}
          icon={Users}
        />
        <KpiCard
          title="Sessão Média"
          value={`${stats?.summary.avgSessionMinutes ?? 0} min`}
          icon={Clock}
        />
        <KpiCard
          title="Horas Transmitidas"
          value={stats?.summary.totalHoursStreamed ?? 0}
          icon={Clock}
        />
      </div>

      {/* Listeners Over Time Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ouvintes ao Longo do Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.timeseries || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="ts"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return period === "day"
                      ? date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                      : date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="listeners"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Devices Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Smartphone className="h-4 w-4" />
              Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.devices || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ device, percentage }) => `${device} (${percentage}%)`}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="device"
                  >
                    {(stats?.devices || []).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {(stats?.devices || []).map((device, index) => (
                <Badge
                  key={device.device}
                  variant="outline"
                  style={{ borderColor: COLORS[index % COLORS.length] }}
                >
                  {device.device}: {device.percentage}%
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Top Países
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>País</TableHead>
                  <TableHead className="text-right">Ouvintes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(stats?.topCountries || []).map((country) => (
                  <TableRow key={country.code}>
                    <TableCell className="flex items-center gap-2">
                      <span className="text-lg">{getFlagEmoji(country.code)}</span>
                      {country.country}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {country.count.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Top Tracks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Music className="h-4 w-4" />
            Músicas Mais Tocadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Música</TableHead>
                <TableHead>Artista</TableHead>
                <TableHead className="text-right">Reproduções</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(stats?.topTracks || []).map((track, index) => (
                <TableRow key={track.trackId}>
                  <TableCell className="font-medium text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{track.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {track.artist}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {track.plays.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
