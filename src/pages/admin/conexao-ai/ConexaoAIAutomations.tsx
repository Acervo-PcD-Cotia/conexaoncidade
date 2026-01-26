import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AIAutomationCard } from "@/components/conexao-ai/AIAutomationCard";
import { useAutomations, useToggleAutomation, useAutomationLogs } from "@/hooks/useConexaoAI";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ConexaoAIAutomations() {
  const navigate = useNavigate();
  const { data: automations, isLoading: loadingAutomations } = useAutomations();
  const { data: logs, isLoading: loadingLogs } = useAutomationLogs(20);
  const toggleAutomation = useToggleAutomation();

  const handleToggle = async (automationId: string, isActive: boolean) => {
    try {
      await toggleAutomation.mutateAsync({ automationId, isActive });
    } catch (error) {
      console.error("Failed to toggle automation:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/conexao-ai")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Automações</h1>
          <p className="text-sm text-muted-foreground">
            Configure ações automáticas baseadas em eventos do portal
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Automations list */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Automações Disponíveis</h2>
          
          {loadingAutomations ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : automations && automations.length > 0 ? (
            <div className="space-y-3">
              {automations.map((automation) => (
                <AIAutomationCard
                  key={automation.id}
                  automation={automation}
                  onToggle={(isActive) => handleToggle(automation.id, isActive)}
                  isToggling={toggleAutomation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Nenhuma automação configurada
              </p>
            </div>
          )}

          {/* Info box */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="font-medium">Como funcionam as automações?</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              As automações são <strong>sugeridas</strong>, não executadas automaticamente.
              Quando um evento ocorre (ex: notícia publicada), você receberá uma sugestão
              de ação que pode aceitar ou ignorar.
            </p>
          </div>
        </div>

        {/* Logs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Histórico Recente</h2>
          
          <div className="rounded-lg border bg-card">
            {loadingLogs ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : logs && logs.length > 0 ? (
              <ScrollArea className="h-[400px]">
                <div className="divide-y">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="text-sm font-medium">
                          {log.conexao_ai_automations?.name || "Automação"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          log.status === "success"
                            ? "default"
                            : log.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {log.status === "success"
                          ? "Sucesso"
                          : log.status === "failed"
                          ? "Falhou"
                          : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Nenhum log de execução ainda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
