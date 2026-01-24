import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CheckCircle, XCircle, Key, Loader2 } from "lucide-react";
import type { SsoLog } from "@/hooks/useSsoAnalytics";

interface SsoLogsTableProps {
  logs: SsoLog[];
  isLoading?: boolean;
}

function getActionInfo(action: string) {
  switch (action) {
    case "sso_code_generated":
      return {
        label: "Gerado",
        variant: "secondary" as const,
        icon: Key,
      };
    case "sso_code_exchanged":
      return {
        label: "Sucesso",
        variant: "default" as const,
        icon: CheckCircle,
      };
    case "sso_exchange_failed":
      return {
        label: "Falha",
        variant: "destructive" as const,
        icon: XCircle,
      };
    default:
      return {
        label: action,
        variant: "outline" as const,
        icon: Key,
      };
  }
}

function getFailureReason(newData: Record<string, unknown> | null): string {
  if (!newData?.reason) return "-";
  
  const reasons: Record<string, string> = {
    code_not_found: "Código não encontrado",
    code_expired: "Código expirado",
    code_already_used: "Código já usado",
    rate_limited: "Rate limit",
    invalid_request: "Requisição inválida",
  };
  
  return reasons[newData.reason as string] || String(newData.reason);
}

export function SsoLogsTable({ logs, isLoading }: SsoLogsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Logs Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const recentLogs = logs.slice(0, 20);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs Recentes ({logs.length} total)</CardTitle>
      </CardHeader>
      <CardContent>
        {recentLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum log SSO encontrado
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Data/Hora</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentLogs.map((log) => {
                const actionInfo = getActionInfo(log.action);
                const Icon = actionInfo.icon;
                const newData = log.new_data as Record<string, unknown> | null;
                
                return (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(parseISO(log.created_at), "dd/MM HH:mm:ss", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionInfo.variant} className="gap-1">
                        <Icon className="h-3 w-3" />
                        {actionInfo.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {newData?.email 
                        ? String(newData.email).substring(0, 20) + "..."
                        : log.user_id 
                          ? log.user_id.substring(0, 8) + "..."
                          : "-"
                      }
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.action === "sso_exchange_failed"
                        ? getFailureReason(newData)
                        : newData?.target_app 
                          ? `App: ${newData.target_app}`
                          : "-"
                      }
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
