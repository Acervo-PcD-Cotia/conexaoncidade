import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Bot, Clock, CheckCircle, AlertTriangle, Rss, Newspaper,
  RefreshCw, Globe, Zap, Settings, Activity
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── AutoPost Stats ───
function AutoPostStats() {
  const { data: sources } = useQuery({
    queryKey: ["core-auto-sources"],
    queryFn: async () => {
      const { data } = await supabase
        .from("autopost_sources")
        .select("id, name, status, health_score, last_run_at, total_items_captured, total_items_published, source_type");
      return data ?? [];
    },
  });

  const { data: recentItems } = useQuery({
    queryKey: ["core-auto-recent-items"],
    queryFn: async () => {
      const { count } = await supabase
        .from("autopost_ingest_items")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(Date.now() - 86400000).toISOString());
      return count ?? 0;
    },
  });

  const { data: publishedToday } = useQuery({
    queryKey: ["core-auto-published-today"],
    queryFn: async () => {
      const { count } = await supabase
        .from("autopost_rewritten_posts")
        .select("id", { count: "exact", head: true })
        .eq("publish_status", "published")
        .gte("published_at", new Date(Date.now() - 86400000).toISOString());
      return count ?? 0;
    },
  });

  const activeSources = sources?.filter(s => s.status === "active").length ?? 0;
  const errorSources = sources?.filter(s => s.status === "error").length ?? 0;
  const totalCaptured = sources?.reduce((s, src) => s + (src.total_items_captured ?? 0), 0) ?? 0;
  const avgHealth = sources?.length
    ? Math.round(sources.reduce((s, src) => s + (src.health_score ?? 100), 0) / sources.length)
    : 100;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Rss className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xl font-bold">{activeSources}</p>
              <p className="text-xs text-muted-foreground">Fontes ativas</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Newspaper className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{recentItems as number}</p>
              <p className="text-xs text-muted-foreground">Capturados (24h)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xl font-bold">{publishedToday as number}</p>
              <p className="text-xs text-muted-foreground">Publicados (24h)</p>
            </div>
          </CardContent>
        </Card>
        <Card className={`${errorSources > 0 ? "bg-red-500/5 border-red-500/20" : "bg-muted/50"}`}>
          <CardContent className="p-3 flex items-center gap-3">
            <Activity className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-xl font-bold">{avgHealth}%</p>
              <p className="text-xs text-muted-foreground">Saúde média</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Sources List ───
function SourcesList() {
  const { data: sources, isLoading } = useQuery({
    queryKey: ["core-auto-sources-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("autopost_sources")
        .select("id, name, site_url, status, health_score, last_run_at, source_type, total_items_captured, total_items_published")
        .order("name", { ascending: true });
      return data ?? [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Fontes de Conteúdo</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : !sources?.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma fonte configurada</p>
        ) : (
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Saúde</TableHead>
                  <TableHead className="text-right">Capturados</TableHead>
                  <TableHead>Última Exec.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sources.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">{s.name}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{s.source_type ?? "rss"}</Badge></TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        s.status === "active" ? "bg-green-500/10 text-green-600" :
                        s.status === "error" ? "bg-red-500/10 text-red-600" :
                        "bg-yellow-500/10 text-yellow-600"
                      }>
                        {s.status === "active" ? "Ativo" : s.status === "error" ? "Erro" : s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-bold ${
                        (s.health_score ?? 100) >= 80 ? "text-green-600" :
                        (s.health_score ?? 100) >= 50 ? "text-yellow-600" : "text-red-600"
                      }`}>
                        {s.health_score ?? 100}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm">{s.total_items_captured ?? 0}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.last_run_at ? format(new Date(s.last_run_at), "dd/MM HH:mm", { locale: ptBR }) : "Nunca"}
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

// ─── Automation Features ───
function AutomationFeatures() {
  const features = [
    { name: "Publicação programada", desc: "Agendar publicação para data/hora específica", icon: Clock, active: true },
    { name: "Sitemap dinâmico", desc: "Atualização automática do sitemap.xml", icon: Globe, active: true },
    { name: "Indexação Google", desc: "Envio automático para Google Indexing API", icon: Zap, active: true },
    { name: "Notificação auto ao publicar", desc: "Push notification disparado automaticamente", icon: Bot, active: true },
    { name: "Auto Post PRO", desc: "Captura, reescrita e publicação automatizada de fontes RSS/Crawler", icon: Rss, active: true },
    { name: "Detecção de duplicatas", desc: "Fingerprint de título + hash de conteúdo + URL", icon: RefreshCw, active: true },
    { name: "Regras de automação", desc: "Regras condicionais por fonte, keyword e categoria", icon: Settings, active: true },
    { name: "Score SEO automático", desc: "Cálculo automático do score SEO na publicação", icon: Activity, active: true },
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Automações Ativas
        </CardTitle>
        <CardDescription>Recursos de automação integrados ao portal</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-green-500/5 border-green-500/20">
              <f.icon className="h-4 w-4 text-green-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{f.name}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-600 text-[10px]">Ativo</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main ───
export default function CoreAutomation() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-emerald-500/10">
          <Bot className="h-6 w-6 text-emerald-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Automação</h1>
          <p className="text-sm text-muted-foreground">
            Auto Post PRO, agendamento, indexação, sitemap e notificações automáticas
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="overview" className="text-xs">Auto Post</TabsTrigger>
          <TabsTrigger value="sources" className="text-xs">Fontes</TabsTrigger>
          <TabsTrigger value="features" className="text-xs">Automações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><AutoPostStats /></TabsContent>
        <TabsContent value="sources"><SourcesList /></TabsContent>
        <TabsContent value="features"><AutomationFeatures /></TabsContent>
      </Tabs>
    </div>
  );
}
