import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Eye, MousePointer, BarChart3, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { EmptyAnalyticsState } from "@/components/admin/EmptyAnalyticsState";

export default function CommercialReports() {
  // Fetch Publidoor metrics
  const { data: publidoorMetrics, isLoading: loadingPublidoor } = useQuery({
    queryKey: ["commercial-publidoor-metrics"],
    queryFn: async () => {
      const [items, metrics, advertisers] = await Promise.all([
        supabase
          .from("publidoor_items")
          .select("id, status, created_at")
          .order("created_at", { ascending: false }),
        supabase
          .from("publidoor_metrics")
          .select("publidoor_id, impressions, clicks, date"),
        supabase
          .from("publidoor_advertisers")
          .select("id, company_name, status"),
      ]);

      const totalImpressions = metrics.data?.reduce((acc, m) => acc + (m.impressions || 0), 0) || 0;
      const totalClicks = metrics.data?.reduce((acc, m) => acc + (m.clicks || 0), 0) || 0;
      const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;

      const activeItems = items.data?.filter(i => i.status === "published").length || 0;
      const pendingItems = items.data?.filter(i => i.status === "review").length || 0;

      return {
        totalItems: items.data?.length || 0,
        activeItems,
        pendingItems,
        totalImpressions,
        totalClicks,
        ctr,
        advertisers: advertisers.data?.length || 0,
        activeAdvertisers: advertisers.data?.filter(a => a.status === "active").length || 0,
      };
    },
  });

  // Fetch Banner/Ads metrics
  const { data: adsMetrics, isLoading: loadingAds } = useQuery({
    queryKey: ["commercial-ads-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("id, name, slot_type, impression_count, click_count, is_active");

      if (error) return { total: 0, active: 0, impressions: 0, clicks: 0 };

      const active = data?.filter(ad => ad.is_active).length || 0;
      const impressions = data?.reduce((acc, ad) => acc + (ad.impression_count || 0), 0) || 0;
      const clicks = data?.reduce((acc, ad) => acc + (ad.click_count || 0), 0) || 0;

      return {
        total: data?.length || 0,
        active,
        impressions,
        clicks,
        ctr: impressions > 0 ? ((clicks / impressions) * 100) : 0,
      };
    },
  });

  const isLoading = loadingPublidoor || loadingAds;
  const hasData = (publidoorMetrics?.totalItems || 0) > 0 || (adsMetrics?.total || 0) > 0;

  if (!isLoading && !hasData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8" />
            Relatórios Comerciais
          </h1>
          <p className="text-muted-foreground">
            Métricas de monetização e publicidade
          </p>
        </div>
        <EmptyAnalyticsState 
          title="Nenhuma campanha comercial ainda"
          description="Crie seus primeiros Publidoors ou Anúncios para começar a coletar métricas comerciais."
          action={
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link to="/admin/publidoor">Criar Publidoor</Link>
              </Button>
              <Button asChild>
                <Link to="/admin/ads">Criar Anúncio</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString("pt-BR");
  };

  const totalImpressions = (publidoorMetrics?.totalImpressions || 0) + (adsMetrics?.impressions || 0);
  const totalClicks = (publidoorMetrics?.totalClicks || 0) + (adsMetrics?.clicks || 0);
  const overallCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-500" />
            Relatórios Comerciais
          </h1>
          <p className="text-muted-foreground">
            Métricas consolidadas de monetização
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/publidoor/metricas">
              <BarChart3 className="mr-2 h-4 w-4" />
              Publidoor Detalhado
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="dashboard-card-glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Impressões Totais
            </CardTitle>
            <Eye className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalImpressions)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Publidoor + Anúncios
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card-glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cliques Totais
            </CardTitle>
            <MousePointer className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(totalClicks)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Todas as campanhas
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card-glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              CTR Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{overallCtr}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Taxa de clique
            </p>
          </CardContent>
        </Card>

        <Card className="dashboard-card-glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anunciantes Ativos
            </CardTitle>
            <DollarSign className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{publidoorMetrics?.activeAdvertisers || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              de {publidoorMetrics?.advertisers || 0} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Publidoor Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <DollarSign className="h-4 w-4 text-amber-500" />
              </div>
              Publidoor (Premium)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{publidoorMetrics?.activeItems || 0}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{publidoorMetrics?.pendingItems || 0}</p>
                <p className="text-sm text-muted-foreground">Pendentes</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impressões</span>
                <span className="font-medium">{formatNumber(publidoorMetrics?.totalImpressions || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cliques</span>
                <span className="font-medium">{formatNumber(publidoorMetrics?.totalClicks || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CTR</span>
                <span className="font-medium text-green-600">{publidoorMetrics?.ctr?.toFixed(2) || "0.00"}%</span>
              </div>
            </div>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/admin/publidoor">Gerenciar Publidoor</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Ads/Banners Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10">
                <BarChart3 className="h-4 w-4 text-blue-500" />
              </div>
              Anúncios & Banners
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{adsMetrics?.active || 0}</p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">{adsMetrics?.total || 0}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Impressões</span>
                <span className="font-medium">{formatNumber(adsMetrics?.impressions || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cliques</span>
                <span className="font-medium">{formatNumber(adsMetrics?.clicks || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CTR</span>
                <span className="font-medium text-green-600">{adsMetrics?.ctr?.toFixed(2) || "0.00"}%</span>
              </div>
            </div>
            <Button className="w-full" variant="outline" asChild>
              <Link to="/admin/ads">Gerenciar Anúncios</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
