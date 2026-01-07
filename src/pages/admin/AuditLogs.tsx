import { useQuery } from "@tanstack/react-query";
import { History, User, Clock, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function AuditLogs() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data: logsData, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      // Fetch user profiles separately
      const userIds = [...new Set(logsData?.map(l => l.user_id).filter(Boolean))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]));

      return logsData?.map(log => ({
        ...log,
        user_name: log.user_id ? profilesMap.get(log.user_id) : null
      }));
    },
  });

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("insert")) return "bg-green-100 text-green-700";
    if (action.includes("update") || action.includes("edit")) return "bg-blue-100 text-blue-700";
    if (action.includes("delete") || action.includes("remove")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const getActionLabel = (action: string) => {
    const actions: Record<string, string> = {
      create: "Criou",
      insert: "Inseriu",
      update: "Atualizou",
      edit: "Editou",
      delete: "Excluiu",
      remove: "Removeu",
      publish: "Publicou",
      archive: "Arquivou",
    };
    
    for (const [key, label] of Object.entries(actions)) {
      if (action.toLowerCase().includes(key)) return label;
    }
    return action;
  };

  const getEntityLabel = (entityType: string) => {
    const entities: Record<string, string> = {
      news: "Notícia",
      category: "Categoria",
      quick_note: "Nota Rápida",
      user_role: "Papel de Usuário",
      banner: "Banner",
      story: "Web Story",
    };
    return entities[entityType] || entityType;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
          <History className="h-8 w-8" />
          Logs de Auditoria
        </h1>
        <p className="text-muted-foreground">
          Histórico de ações e alterações no sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Carregando logs...
            </div>
          ) : logs?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum log registrado ainda.
            </div>
          ) : (
            <div className="space-y-3">
              {logs?.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        {log.user_name || "Sistema"}
                      </span>
                      <Badge variant="secondary" className={getActionColor(log.action)}>
                        {getActionLabel(log.action)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {getEntityLabel(log.entity_type)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(log.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
