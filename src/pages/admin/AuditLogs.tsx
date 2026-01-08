import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { History, User, Clock, FileText, Download, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { supabase } from "@/integrations/supabase/client";
import { format, formatDistanceToNow, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function AuditLogs() {
  const [filters, setFilters] = useState({
    startDate: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    action: "",
    entityType: "",
    userId: "",
  });
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Fetch users for filter
  const { data: users } = useQuery({
    queryKey: ["audit-users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs", filters],
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .gte("created_at", `${filters.startDate}T00:00:00`)
        .lte("created_at", `${filters.endDate}T23:59:59`)
        .limit(200);

      if (filters.action) {
        query = query.ilike("action", `%${filters.action}%`);
      }
      if (filters.entityType) {
        query = query.eq("entity_type", filters.entityType);
      }
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }

      const { data: logsData, error } = await query;
      if (error) throw error;

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
    if (action.includes("create") || action.includes("insert")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (action.includes("update") || action.includes("edit")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    if (action.includes("delete") || action.includes("remove")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
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
      ad: "Anúncio",
    };
    return entities[entityType] || entityType;
  };

  const exportToCSV = () => {
    if (!logs) return;

    const headers = ["Data/Hora", "Usuário", "Ação", "Entidade", "ID Entidade"];
    const rows = logs.map(log => [
      format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss"),
      `"${log.user_name || 'Sistema'}"`,
      getActionLabel(log.action),
      getEntityLabel(log.entity_type),
      log.entity_id || "-",
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Logs exportados!");
  };

  const exportToJSON = () => {
    if (!logs) return;

    const data = logs.map(log => ({
      timestamp: log.created_at,
      user: log.user_name || "Sistema",
      action: log.action,
      entity_type: log.entity_type,
      entity_id: log.entity_id,
      old_data: log.old_data,
      new_data: log.new_data,
    }));

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.json`;
    link.click();
    toast.success("Logs exportados!");
  };

  const renderDataDiff = (log: NonNullable<typeof logs>[number]) => {
    if (!log.old_data && !log.new_data) return null;

    return (
      <div className="mt-3 grid gap-4 md:grid-cols-2 text-xs">
        {log.old_data && (
          <div className="rounded bg-red-50 dark:bg-red-900/20 p-3">
            <p className="font-medium text-red-700 dark:text-red-400 mb-2">Antes:</p>
            <pre className="overflow-auto max-h-48 text-red-600 dark:text-red-300">
              {JSON.stringify(log.old_data, null, 2)}
            </pre>
          </div>
        )}
        {log.new_data && (
          <div className="rounded bg-green-50 dark:bg-green-900/20 p-3">
            <p className="font-medium text-green-700 dark:text-green-400 mb-2">Depois:</p>
            <pre className="overflow-auto max-h-48 text-green-600 dark:text-green-300">
              {JSON.stringify(log.new_data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <History className="h-8 w-8" />
            Logs de Auditoria
          </h1>
          <p className="text-muted-foreground">
            Histórico de ações e alterações no sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportToJSON}>
            <Download className="mr-2 h-4 w-4" />
            JSON
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div>
              <Label className="mb-1 block">Data Início</Label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 block">Data Fim</Label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div>
              <Label className="mb-1 block">Ação</Label>
              <Select 
                value={filters.action} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, action: v }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="create">Criou</SelectItem>
                  <SelectItem value="update">Atualizou</SelectItem>
                  <SelectItem value="delete">Excluiu</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Entidade</Label>
              <Select 
                value={filters.entityType} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, entityType: v }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todas</SelectItem>
                  <SelectItem value="news">Notícia</SelectItem>
                  <SelectItem value="category">Categoria</SelectItem>
                  <SelectItem value="quick_note">Nota Rápida</SelectItem>
                  <SelectItem value="banner">Banner</SelectItem>
                  <SelectItem value="story">Web Story</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Usuário</Label>
              <Select 
                value={filters.userId} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, userId: v }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || user.id.slice(0, 8)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Atividades ({logs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Carregando logs...
            </div>
          ) : logs?.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum log encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="space-y-2">
              {logs?.map((log) => (
                <Collapsible
                  key={log.id}
                  open={expandedLog === log.id}
                  onOpenChange={(open) => setExpandedLog(open ? log.id : null)}
                >
                  <div className="rounded-lg border">
                    <CollapsibleTrigger asChild>
                      <button className="flex w-full items-start gap-3 p-3 hover:bg-muted/50 transition-colors">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted shrink-0">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
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
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                            <span className="mx-1">•</span>
                            {formatDistanceToNow(new Date(log.created_at), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {expandedLog === log.id ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="px-3 pb-3 pt-0">
                        {renderDataDiff(log)}
                        {!log.old_data && !log.new_data && (
                          <p className="text-xs text-muted-foreground">
                            Sem dados detalhados disponíveis
                          </p>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
