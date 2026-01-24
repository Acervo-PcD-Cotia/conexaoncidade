import { useEffect } from "react";
import { useSsoAnalytics } from "@/hooks/useSsoAnalytics";
import { SsoKpiCards } from "@/components/admin/sso/SsoKpiCards";
import { SsoChart } from "@/components/admin/sso/SsoChart";
import { SsoLogsTable } from "@/components/admin/sso/SsoLogsTable";
import { SsoSecurityAlerts } from "@/components/admin/sso/SsoSecurityAlerts";
import { Button } from "@/components/ui/button";
import { RefreshCw, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SsoMonitor() {
  const { logs, stats, chartData, securityAlerts, isLoading, refetch } = useSsoAnalytics(7);

  // Show toast for critical alerts
  useEffect(() => {
    const criticalAlerts = securityAlerts.filter(a => a.level === "critical");
    if (criticalAlerts.length > 0) {
      toast.error("Alerta de segurança SSO detectado!", {
        description: criticalAlerts[0].message,
      });
    }
  }, [securityAlerts]);

  const handleRefresh = () => {
    refetch();
    toast.success("Dados atualizados");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Monitor SSO</h1>
            <p className="text-muted-foreground">
              Monitoramento de autenticação Single Sign-On
            </p>
          </div>
        </div>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* KPIs */}
      <SsoKpiCards stats={stats} isLoading={isLoading} />

      {/* Chart and Alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SsoChart data={chartData} isLoading={isLoading} />
        </div>
        <div>
          <SsoSecurityAlerts alerts={securityAlerts} isLoading={isLoading} />
        </div>
      </div>

      {/* Logs Table */}
      <SsoLogsTable logs={logs} isLoading={isLoading} />
    </div>
  );
}
