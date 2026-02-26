import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TrendingUp, DollarSign, Eye, MousePointerClick, BarChart3,
  Layers, Target, Settings, RefreshCw, ExternalLink, Image
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// ─── KPIs ───
function AdsKpis() {
  const { data: ads } = useQuery({
    queryKey: ["core-ads-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, name, impression_count, click_count, is_active, slot_type, size");
      return data ?? [];
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["core-ads-campaigns"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banner_campaigns")
        .select("id, name, status, budget_total, budget_spent, billing_type");
      return data ?? [];
    },
  });

  const totalImpressions = ads?.reduce((s, a) => s + (a.impression_count ?? 0), 0) ?? 0;
  const totalClicks = ads?.reduce((s, a) => s + (a.click_count ?? 0), 0) ?? 0;
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";
  const activeAds = ads?.filter(a => a.is_active).length ?? 0;
  const activeCampaigns = campaigns?.filter(c => c.status === "active").length ?? 0;
  const totalBudget = campaigns?.reduce((s, c) => s + (c.budget_total ?? 0), 0) ?? 0;
  const totalSpent = campaigns?.reduce((s, c) => s + (c.budget_spent ?? 0), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <Eye className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xl font-bold">{totalImpressions.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Impressões</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <MousePointerClick className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xl font-bold">{totalClicks.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Cliques</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="text-xl font-bold">{ctr}%</p>
              <p className="text-xs text-muted-foreground">CTR Médio</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-3 flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-xl font-bold">R$ {totalSpent.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Investido</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{activeAds}</p>
              <p className="text-xs text-muted-foreground">Anúncios ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Target className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">{activeCampaigns}</p>
              <p className="text-xs text-muted-foreground">Campanhas ativas</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─── Ad Inventory ───
function AdInventory() {
  const { data: ads, isLoading } = useQuery({
    queryKey: ["core-ads-inventory"],
    queryFn: async () => {
      const { data } = await supabase
        .from("ads")
        .select("id, name, slot_type, size, is_active, impression_count, click_count, advertiser")
        .order("sort_order", { ascending: true });
      return data ?? [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Inventário de Anúncios</CardTitle>
        <CardDescription>Todos os anúncios cadastrados e suas métricas</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : !ads?.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhum anúncio cadastrado</p>
        ) : (
          <div className="max-h-[500px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Formato</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Impressões</TableHead>
                  <TableHead className="text-right">Cliques</TableHead>
                  <TableHead className="text-right">CTR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ads.map((ad) => {
                  const ctr = (ad.impression_count ?? 0) > 0
                    ? (((ad.click_count ?? 0) / (ad.impression_count ?? 1)) * 100).toFixed(2)
                    : "0.00";
                  return (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium text-sm">{ad.name}</TableCell>
                      <TableCell className="text-sm">{ad.slot_type}</TableCell>
                      <TableCell className="text-sm font-mono">{ad.size}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ad.is_active ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}>
                          {ad.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm">{(ad.impression_count ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm">{(ad.click_count ?? 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{ctr}%</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Campaign Overview ───
function CampaignOverview() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ["core-ads-campaigns-list"],
    queryFn: async () => {
      const { data } = await supabase
        .from("banner_campaigns")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Campanhas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Carregando...</p>
        ) : !campaigns?.length ? (
          <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma campanha</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((c) => {
              const pct = c.budget_total > 0 ? Math.round((c.budget_spent / c.budget_total) * 100) : 0;
              return (
                <div key={c.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{c.name}</p>
                    <Badge variant="outline" className={
                      c.status === "active" ? "bg-green-500/10 text-green-600" :
                      c.status === "paused" ? "bg-yellow-500/10 text-yellow-600" :
                      "bg-muted text-muted-foreground"
                    }>
                      {c.status === "active" ? "Ativa" : c.status === "paused" ? "Pausada" : c.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Tipo: {c.billing_type}</span>
                    <span>Budget: R$ {c.budget_total.toLocaleString()}</span>
                    <span>Gasto: R$ {c.budget_spent.toLocaleString()} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Formats Config ───
function FormatsConfig() {
  const formats = [
    { num: "01", name: "Super Banner", size: "970×250", block: "Ads" },
    { num: "02", name: "Leaderboard", size: "728×90", block: "Ads" },
    { num: "03", name: "Retângulo Médio", size: "300×250", block: "Ads" },
    { num: "04", name: "Painel Vertical", size: "300×600", block: "Ads" },
    { num: "05", name: "Arranha-Céu", size: "160×600", block: "Ads" },
    { num: "06", name: "Intersticial", size: "800×550", block: "Ads" },
    { num: "07", name: "Narrativo", size: "1080×1920", block: "Publidoor" },
    { num: "08", name: "Contextual", size: "1080×1920", block: "Publidoor" },
    { num: "09", name: "Geográfico", size: "1080×1920", block: "Publidoor" },
    { num: "10", name: "Editorial", size: "1080×1920", block: "Publidoor" },
    { num: "11", name: "Impacto Total", size: "1080×1920", block: "Publidoor" },
    { num: "12", name: "Story Card", size: "1080×1920", block: "WebStories" },
    { num: "13", name: "Story CTA", size: "1080×1920", block: "WebStories" },
    { num: "14", name: "Login Banner", size: "400×300", block: "Login" },
    { num: "15", name: "Alerta Comercial", size: "800×550", block: "Experiência" },
  ];

  const blockColors: Record<string, string> = {
    Ads: "bg-blue-500/10 text-blue-600",
    Publidoor: "bg-purple-500/10 text-purple-600",
    WebStories: "bg-pink-500/10 text-pink-600",
    Login: "bg-muted text-muted-foreground",
    Experiência: "bg-orange-500/10 text-orange-600",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Image className="h-4 w-4" />
          15 Formatos Comerciais
        </CardTitle>
        <CardDescription>Mapa completo dos formatos padronizados</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {formats.map((f) => (
            <div key={f.num} className="flex items-center gap-3 p-2.5 rounded-lg border bg-muted/20">
              <span className="text-xs font-mono text-muted-foreground w-5">{f.num}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{f.size}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] ${blockColors[f.block] ?? ""}`}>
                {f.block}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main ───
export default function CoreAds() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-green-500/10">
          <TrendingUp className="h-6 w-6 text-green-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Monetização Avançada</h1>
          <p className="text-sm text-muted-foreground">
            15 formatos comerciais, campanhas 360°, métricas e diagnósticos
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="overview" className="text-xs">Visão Geral</TabsTrigger>
          <TabsTrigger value="inventory" className="text-xs">Inventário</TabsTrigger>
          <TabsTrigger value="campaigns" className="text-xs">Campanhas</TabsTrigger>
          <TabsTrigger value="formats" className="text-xs">Formatos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><AdsKpis /></TabsContent>
        <TabsContent value="inventory"><AdInventory /></TabsContent>
        <TabsContent value="campaigns"><CampaignOverview /></TabsContent>
        <TabsContent value="formats"><FormatsConfig /></TabsContent>
      </Tabs>
    </div>
  );
}
