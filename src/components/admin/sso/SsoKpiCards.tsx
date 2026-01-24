import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import type { SsoStats } from "@/hooks/useSsoAnalytics";

interface SsoKpiCardsProps {
  stats: SsoStats;
  isLoading?: boolean;
}

export function SsoKpiCards({ stats, isLoading }: SsoKpiCardsProps) {
  const kpis = [
    {
      title: "Códigos Gerados",
      value: stats.totalGenerated,
      icon: Key,
      description: "Últimos 7 dias",
      color: "text-blue-600",
    },
    {
      title: "Trocas Sucesso",
      value: stats.totalExchanged,
      icon: CheckCircle,
      description: "Autenticações bem-sucedidas",
      color: "text-green-600",
    },
    {
      title: "Falhas",
      value: stats.totalFailed,
      icon: XCircle,
      description: "Tentativas rejeitadas",
      color: "text-red-600",
    },
    {
      title: "Taxa de Sucesso",
      value: `${stats.successRate}%`,
      icon: TrendingUp,
      description: "Trocas / Gerados",
      color: "text-emerald-600",
    },
    {
      title: "Tempo Médio",
      value: stats.avgExchangeTimeMs > 0 ? `${stats.avgExchangeTimeMs}ms` : "N/A",
      icon: Clock,
      description: "Tempo de troca",
      color: "text-amber-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 w-4 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 rounded bg-muted mb-1" />
              <div className="h-3 w-20 rounded bg-muted" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className="text-xs text-muted-foreground">{kpi.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
