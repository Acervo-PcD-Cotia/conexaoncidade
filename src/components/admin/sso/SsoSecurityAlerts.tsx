import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { SsoSecurityAlert } from "@/hooks/useSsoAnalytics";

interface SsoSecurityAlertsProps {
  alerts: SsoSecurityAlert[];
  isLoading?: boolean;
}

export function SsoSecurityAlerts({ alerts, isLoading }: SsoSecurityAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5" />
            Alertas de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2].map(i => (
              <div key={i} className="h-16 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          Alertas de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.length === 0 ? (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800 dark:text-green-200">
              Nenhum alerta
            </AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Nenhuma atividade suspeita detectada nos últimos 7 dias.
            </AlertDescription>
          </Alert>
        ) : (
          alerts.map((alert) => (
            <Alert
              key={alert.id}
              variant={alert.level === "critical" ? "destructive" : "default"}
              className={
                alert.level === "warning"
                  ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
                  : ""
              }
            >
              <AlertTriangle
                className={`h-4 w-4 ${
                  alert.level === "critical"
                    ? "text-destructive"
                    : "text-amber-600"
                }`}
              />
              <AlertTitle
                className={
                  alert.level === "warning"
                    ? "text-amber-800 dark:text-amber-200"
                    : ""
                }
              >
                {alert.level === "critical" ? "Alerta Crítico" : "Aviso"}
              </AlertTitle>
              <AlertDescription
                className={
                  alert.level === "warning"
                    ? "text-amber-700 dark:text-amber-300"
                    : ""
                }
              >
                {alert.message}
                <span className="block text-xs mt-1 opacity-70">
                  {format(parseISO(alert.timestamp), "dd/MM/yyyy HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </AlertDescription>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  );
}
