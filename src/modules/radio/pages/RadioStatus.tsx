import { Radio, Users, Gauge, Clock, RefreshCw, Power } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, KpiCard } from "../components";
import { useRadioStatus } from "../hooks/useRadioStatus";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

// Mock uptime data for chart
const uptimeData = [
  { time: "00:00", listeners: 45 },
  { time: "02:00", listeners: 32 },
  { time: "04:00", listeners: 28 },
  { time: "06:00", listeners: 65 },
  { time: "08:00", listeners: 120 },
  { time: "10:00", listeners: 180 },
  { time: "12:00", listeners: 210 },
  { time: "14:00", listeners: 195 },
  { time: "16:00", listeners: 165 },
  { time: "18:00", listeners: 142 },
  { time: "20:00", listeners: 89 },
  { time: "22:00", listeners: 67 },
];

const chartConfig = {
  listeners: {
    label: "Ouvintes",
    color: "hsl(var(--primary))",
  },
};

export default function RadioStatus() {
  const { data: status, isLoading, error, refetch } = useRadioStatus();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar status do stream</p>
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
            <Radio className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Status do Stream</h1>
            <p className="text-muted-foreground">
              Monitoramento em tempo real da transmissão
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {status && <StatusBadge state={status.state} />}
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Ouvintes Agora"
          value={status?.listenersNow ?? 0}
          icon={Users}
          trend={{ value: 12, label: "vs. ontem" }}
        />
        <KpiCard
          title="Pico do Dia"
          value={status?.peakToday ?? 0}
          icon={Users}
          subtitle="às 12:34"
        />
        <KpiCard
          title="Bitrate"
          value={`${status?.bitrateKbps ?? 0} kbps`}
          icon={Gauge}
        />
        <KpiCard
          title="Uptime"
          value="99.8%"
          icon={Clock}
          subtitle="Últimas 24h"
        />
      </div>

      {/* Listeners Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ouvintes ao Longo do Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={uptimeData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
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

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ações</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="outline" disabled>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reiniciar Stream
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Requer serviço de rádio ativo
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button variant="outline" disabled>
                    <Power className="h-4 w-4 mr-2" />
                    Forçar Reconexão
                  </Button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                Requer serviço de rádio ativo
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardContent>
      </Card>

      {/* Recent Events Log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Eventos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {[
              { time: "12:45", event: "Pico de ouvintes: 210 conexões" },
              { time: "10:30", event: "Stream reconectado automaticamente" },
              { time: "08:15", event: "AutoDJ assumiu a transmissão" },
              { time: "06:00", event: "Playlist 'Manhãs' iniciada" },
              { time: "00:00", event: "Estatísticas do dia resetadas" },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0">
                <span className="text-muted-foreground font-mono text-xs">
                  {log.time}
                </span>
                <span>{log.event}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
