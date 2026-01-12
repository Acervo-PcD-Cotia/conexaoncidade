import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
  Bell,
  BellRing,
  Plus,
  Settings,
  Trash2,
  Clock,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlertConfigForm {
  banner_id: string;
  alert_type: "expiring" | "low_ctr";
  threshold_days: number;
  threshold_ctr: number;
}

const defaultForm: AlertConfigForm = {
  banner_id: "",
  alert_type: "expiring",
  threshold_days: 3,
  threshold_ctr: 1,
};

export function BannerAlerts() {
  const [configOpen, setConfigOpen] = useState(false);
  const [form, setForm] = useState<AlertConfigForm>(defaultForm);
  const queryClient = useQueryClient();

  // Fetch banners
  const { data: banners } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("super_banners")
        .select("*")
        .eq("is_active", true)
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  // Fetch alert configs
  const { data: configs, isLoading: loadingConfigs } = useQuery({
    queryKey: ["banner-alerts-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_alerts_config")
        .select("*, super_banners(id, title)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch alert logs
  const { data: logs, isLoading: loadingLogs } = useQuery({
    queryKey: ["banner-alerts-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banner_alerts_log")
        .select("*, super_banners(id, title)")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const unreadCount = useMemo(() => {
    return logs?.filter((l) => !l.is_read).length || 0;
  }, [logs]);

  const createConfigMutation = useMutation({
    mutationFn: async (data: AlertConfigForm) => {
      const { error } = await supabase.from("banner_alerts_config").insert({
        banner_id: data.banner_id || null,
        alert_type: data.alert_type,
        threshold_days: data.threshold_days,
        threshold_ctr: data.threshold_ctr,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-alerts-config"] });
      toast.success("Configuração de alerta criada!");
      setConfigOpen(false);
      setForm(defaultForm);
    },
    onError: (error) => {
      toast.error("Erro: " + (error as Error).message);
    },
  });

  const toggleConfigMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("banner_alerts_config")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-alerts-config"] });
    },
  });

  const deleteConfigMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("banner_alerts_config").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-alerts-config"] });
      toast.success("Configuração excluída!");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("banner_alerts_log")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-alerts-log"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("banner_alerts_log")
        .update({ is_read: true })
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["banner-alerts-log"] });
      toast.success("Todos os alertas foram marcados como lidos");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createConfigMutation.mutate(form);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "expiring":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low_ctr":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getAlertTypeBadge = (type: string) => {
    switch (type) {
      case "expiring":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
            Expiração
          </Badge>
        );
      case "low_ctr":
        return (
          <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            CTR Baixo
          </Badge>
        );
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Alertas de Banners</h2>
          <p className="text-sm text-muted-foreground">
            Configure notificações para expiração e CTR baixo
          </p>
        </div>
        <Dialog open={configOpen} onOpenChange={setConfigOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setForm(defaultForm)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Configuração
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurar Alerta
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Tipo de Alerta</Label>
                <Select
                  value={form.alert_type}
                  onValueChange={(v) => setForm({ ...form, alert_type: v as "expiring" | "low_ctr" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expiring">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Expiração próxima
                      </div>
                    </SelectItem>
                    <SelectItem value="low_ctr">
                      <div className="flex items-center gap-2">
                        <TrendingDown className="h-4 w-4" />
                        CTR baixo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Banner (opcional)</Label>
                <Select
                  value={form.banner_id}
                  onValueChange={(v) => setForm({ ...form, banner_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os banners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os banners</SelectItem>
                    {banners?.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title || "Sem título"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Deixe vazio para aplicar a todos os banners
                </p>
              </div>

              {form.alert_type === "expiring" && (
                <div>
                  <Label htmlFor="threshold_days">Dias antes de expirar</Label>
                  <Input
                    id="threshold_days"
                    type="number"
                    min={1}
                    max={30}
                    value={form.threshold_days}
                    onChange={(e) =>
                      setForm({ ...form, threshold_days: parseInt(e.target.value) || 3 })
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Alerta será disparado X dias antes da expiração
                  </p>
                </div>
              )}

              {form.alert_type === "low_ctr" && (
                <div>
                  <Label htmlFor="threshold_ctr">CTR mínimo (%)</Label>
                  <Input
                    id="threshold_ctr"
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={form.threshold_ctr}
                    onChange={(e) =>
                      setForm({ ...form, threshold_ctr: parseFloat(e.target.value) || 1 })
                    }
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Alerta se CTR cair abaixo deste valor
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={createConfigMutation.isPending}>
                {createConfigMutation.isPending ? "Salvando..." : "Salvar Configuração"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configurations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-5 w-5" />
              Configurações Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingConfigs ? (
              <div className="py-4 text-center text-muted-foreground">Carregando...</div>
            ) : configs?.length === 0 ? (
              <div className="py-8 text-center">
                <Settings className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhuma configuração criada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {configs?.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getAlertIcon(config.alert_type)}
                      <div>
                        <p className="text-sm font-medium">
                          {config.super_banners
                            ? (config.super_banners as any).title
                            : "Todos os banners"}
                        </p>
                        <div className="flex items-center gap-2">
                          {getAlertTypeBadge(config.alert_type)}
                          <span className="text-xs text-muted-foreground">
                            {config.alert_type === "expiring"
                              ? `${config.threshold_days} dias antes`
                              : `CTR < ${config.threshold_ctr}%`}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={config.is_active}
                        onCheckedChange={(checked) =>
                          toggleConfigMutation.mutate({ id: config.id, is_active: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          if (confirm("Excluir configuração?")) {
                            deleteConfigMutation.mutate(config.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alert History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BellRing className="h-5 w-5" />
              Histórico de Alertas
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} não lidos
                </Badge>
              )}
            </CardTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMutation.mutate()}
              >
                <CheckCircle2 className="mr-1 h-4 w-4" />
                Marcar todos como lidos
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <div className="py-4 text-center text-muted-foreground">Carregando...</div>
            ) : logs?.length === 0 ? (
              <div className="py-8 text-center">
                <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum alerta registrado</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {logs?.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        !log.is_read ? "bg-yellow-50/50 dark:bg-yellow-900/10" : ""
                      }`}
                    >
                      {getAlertIcon(log.alert_type)}
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {(log.super_banners as any)?.title || "Banner"}
                        </p>
                        <p className="text-sm text-muted-foreground">{log.message}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                      {!log.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => markAsReadMutation.mutate(log.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
