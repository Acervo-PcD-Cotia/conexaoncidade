import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rss, CheckCircle, XCircle, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export function ImportLogsPanel() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["dashboard-import-logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("autopost_ingest_jobs")
        .select(`
          id,
          status,
          items_processed,
          items_new,
          started_at,
          ended_at,
          source:autopost_sources(name)
        `)
        .order("started_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-4 border-b border-border flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-sky-100 dark:bg-sky-900/30">
            <Rss className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <h3 className="text-sm font-semibold">Logs de Importação</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
          <Link to="/admin/autopost">
            Ver todos
            <ChevronRight className="h-3 w-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-5 h-5 rounded-full bg-muted" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-2 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : logs?.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma importação recente
          </p>
        ) : (
          <div className="space-y-3">
            {logs?.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3"
              >
                {/* Status Icon */}
                {log.status === "success" ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                ) : log.status === "failed" ? (
                  <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                )}
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">
                      {log.source?.name || "Fonte desconhecida"}
                    </p>
                    {log.status === "success" && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded">
                        Sucesso
                      </span>
                    )}
                    {log.status === "failed" && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 rounded">
                        Erro
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{log.items_new || 0} novos</span>
                    <span>•</span>
                    <span>
                      {log.started_at && formatDistanceToNow(new Date(log.started_at), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
