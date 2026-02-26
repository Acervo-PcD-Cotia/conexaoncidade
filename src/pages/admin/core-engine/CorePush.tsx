import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Bell, Send, Users, BarChart3, Clock, CheckCircle, 
  XCircle, Smartphone, Globe, Tag
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── KPIs ───
function PushKpis() {
  const { data: notifications } = useQuery({
    queryKey: ["core-push-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("push_notifications")
        .select("id, sent_count, failed_count, target_type, created_at, sent_at")
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

  const { data: subs } = useQuery({
    queryKey: ["core-push-subs"],
    queryFn: async () => {
      const { count } = await supabase
        .from("push_subscriptions")
        .select("id", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const totalSent = notifications?.reduce((s, n) => s + (n.sent_count ?? 0), 0) ?? 0;
  const totalFailed = notifications?.reduce((s, n) => s + (n.failed_count ?? 0), 0) ?? 0;
  const deliveryRate = totalSent > 0 ? (((totalSent - totalFailed) / totalSent) * 100).toFixed(1) : "100.0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardContent className="p-3 flex items-center gap-3">
          <Users className="h-5 w-5 text-blue-500" />
          <div>
            <p className="text-xl font-bold">{(subs as number).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Assinantes</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-green-500/5 border-green-500/20">
        <CardContent className="p-3 flex items-center gap-3">
          <Send className="h-5 w-5 text-green-500" />
          <div>
            <p className="text-xl font-bold">{totalSent.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Enviados</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-3 flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-yellow-500" />
          <div>
            <p className="text-xl font-bold">{deliveryRate}%</p>
            <p className="text-xs text-muted-foreground">Entrega</p>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-red-500/5 border-red-500/20">
        <CardContent className="p-3 flex items-center gap-3">
          <XCircle className="h-5 w-5 text-red-500" />
          <div>
            <p className="text-xl font-bold">{totalFailed.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Falhas</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Notification History ───
function NotificationHistory() {
  const { data: notifications, isLoading } = useQuery({
    queryKey: ["core-push-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("push_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      return data ?? [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Histórico de Envios</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : !notifications?.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma notificação enviada</p>
        ) : (
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Alvo</TableHead>
                  <TableHead className="text-right">Enviados</TableHead>
                  <TableHead className="text-right">Falhas</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{n.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">
                        {n.target_type === "all" ? "Todos" : n.target_type === "community" ? "Comunidade" : n.target_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">{n.sent_count ?? 0}</TableCell>
                    <TableCell className="text-right text-sm">{n.failed_count ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(n.created_at), "dd/MM HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Subscriber Insights ───
function SubscriberInsights() {
  const { data: subs, isLoading } = useQuery({
    queryKey: ["core-push-subscribers-insights"],
    queryFn: async () => {
      const { data } = await supabase
        .from("push_subscriptions")
        .select("id, city, categories, created_at")
        .order("created_at", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  const cityMap = new Map<string, number>();
  const catMap = new Map<string, number>();
  subs?.forEach((s) => {
    const city = (s.city as string) || "Não informada";
    cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
    const cats = s.categories as string[] | null;
    cats?.forEach((c) => catMap.set(c, (catMap.get(c) ?? 0) + 1));
  });

  const topCities = [...cityMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const topCats = [...catMap.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Globe className="h-4 w-4" /> Por Cidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
            <div className="space-y-2">
              {topCities.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
              {topCities.map(([city, count]) => (
                <div key={city} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">{city}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Tag className="h-4 w-4" /> Por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : (
            <div className="space-y-2">
              {topCats.length === 0 && <p className="text-sm text-muted-foreground">Sem dados</p>}
              {topCats.map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between p-2 rounded bg-muted/50">
                  <span className="text-sm">{cat}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Main ───
export default function CorePush() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-orange-500/10">
          <Bell className="h-6 w-6 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Push Notifications</h1>
          <p className="text-sm text-muted-foreground">
            Web push, segmentação por cidade/categoria, histórico e métricas
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="history" className="text-xs">Histórico</TabsTrigger>
          <TabsTrigger value="subscribers" className="text-xs">Assinantes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><PushKpis /></TabsContent>
        <TabsContent value="history"><NotificationHistory /></TabsContent>
        <TabsContent value="subscribers"><SubscriberInsights /></TabsContent>
      </Tabs>
    </div>
  );
}
