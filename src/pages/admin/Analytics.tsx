import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Eye, Newspaper, FolderTree, Download, Calendar, Filter, AlertCircle } from "lucide-react";
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
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { EmptyAnalyticsState } from "@/components/admin/EmptyAnalyticsState";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Analytics() {
  const [dateRange, setDateRange] = useState({
    start: format(subDays(new Date(), 30), "yyyy-MM-dd"),
    end: format(new Date(), "yyyy-MM-dd"),
  });
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  // Fetch page views data
  const { data: pageViews } = useQuery({
    queryKey: ["analytics-page-views", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("page_views")
        .select("*")
        .gte("created_at", startOfDay(new Date(dateRange.start)).toISOString())
        .lte("created_at", endOfDay(new Date(dateRange.end)).toISOString())
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch most read news
  const { data: mostRead } = useQuery({
    queryKey: ["analytics-most-read", categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from("news")
        .select("id, title, slug, view_count, published_at, categories(name, color)")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(20);

      if (categoryFilter && categoryFilter !== "all") {
        query = query.eq("category_id", categoryFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fetch category stats
  const { data: categoryStats } = useQuery({
    queryKey: ["analytics-categories"],
    queryFn: async () => {
      const { data: news, error } = await supabase
        .from("news")
        .select("category_id, view_count, categories(name, color)")
        .eq("status", "published");
      if (error) throw error;

      const stats: Record<string, { name: string; color: string; views: number; count: number }> = {};
      news?.forEach((n) => {
        if (n.category_id && n.categories) {
          if (!stats[n.category_id]) {
            stats[n.category_id] = {
              name: n.categories.name,
              color: n.categories.color,
              views: 0,
              count: 0,
            };
          }
          stats[n.category_id].views += n.view_count || 0;
          stats[n.category_id].count += 1;
        }
      });

      return Object.values(stats).sort((a, b) => b.views - a.views);
    },
  });

  // Fetch daily publication stats
  const { data: dailyStats } = useQuery({
    queryKey: ["analytics-daily", dateRange],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("published_at, view_count")
        .eq("status", "published")
        .gte("published_at", startOfDay(new Date(dateRange.start)).toISOString())
        .lte("published_at", endOfDay(new Date(dateRange.end)).toISOString());
      if (error) throw error;

      const days: Record<string, { published: number; views: number }> = {};
      data?.forEach((n) => {
        if (n.published_at) {
          const day = format(new Date(n.published_at), "dd/MM");
          if (!days[day]) days[day] = { published: 0, views: 0 };
          days[day].published += 1;
          days[day].views += n.view_count || 0;
        }
      });

      return Object.entries(days).map(([day, stats]) => ({ day, ...stats }));
    },
  });

  // Fetch ad performance
  const { data: adStats } = useQuery({
    queryKey: ["analytics-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("name, slot_type, click_count, impression_count, is_active")
        .order("click_count", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const totalViews = mostRead?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;
  const uniqueSessions = new Set(pageViews?.map(pv => pv.session_id)).size;
  const totalPageViews = pageViews?.length || 0;

  const exportToCSV = () => {
    if (!mostRead) return;

    const headers = ["Posição", "Título", "Categoria", "Views", "Data Publicação"];
    const rows = mostRead.map((news, index) => [
      index + 1,
      `"${news.title.replace(/"/g, '""')}"`,
      news.categories?.name || "-",
      news.view_count,
      news.published_at ? format(new Date(news.published_at), "dd/MM/yyyy") : "-",
    ]);

    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("Relatório exportado!");
  };

  // Check if we have any meaningful data
  const hasData = (mostRead && mostRead.length > 0) || totalViews > 0 || totalPageViews > 0;

  // If no data at all, show empty state
  if (!hasData && !categoryStats?.length) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics
            </h1>
            <p className="text-muted-foreground">
              Métricas de desempenho editorial
            </p>
          </div>
        </div>
        <EmptyAnalyticsState 
          title="Nenhum dado de analytics ainda"
          description="Os dados começarão a aparecer assim que houver notícias publicadas e tráfego no portal. Publique sua primeira notícia para começar a coletar métricas."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-muted-foreground">
            Métricas de desempenho editorial
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV} disabled={!mostRead?.length}>
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Info alert when data is limited */}
      {totalPageViews === 0 && totalViews > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Os dados de page views ainda estão sendo coletados. As métricas completas aparecerão em breve.
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label className="flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" /> Data Início
              </Label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div>
              <Label className="flex items-center gap-1 mb-1">
                <Calendar className="h-3 w-3" /> Data Fim
              </Label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div>
              <Label className="flex items-center gap-1 mb-1">
                <Filter className="h-3 w-3" /> Categoria
              </Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">em todas as notícias</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Page Views (período)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPageViews.toLocaleString("pt-BR")}</div>
            <p className="text-xs text-muted-foreground">{uniqueSessions} sessões únicas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Notícias Publicadas
            </CardTitle>
            <Newspaper className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mostRead?.length || 0}</div>
            <p className="text-xs text-muted-foreground">no período selecionado</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categorias Ativas
            </CardTitle>
            <FolderTree className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryStats?.length || 0}</div>
            <p className="text-xs text-muted-foreground">com notícias publicadas</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="most-read" className="space-y-4">
        <TabsList>
          <TabsTrigger value="most-read">Mais Lidas</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="daily">Publicações</TabsTrigger>
          <TabsTrigger value="ads">Anúncios</TabsTrigger>
        </TabsList>

        <TabsContent value="most-read">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Notícias Mais Lidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mostRead?.slice(0, 15).map((news, index) => (
                  <div
                    key={news.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{news.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {news.categories && (
                          <span
                            className="rounded px-1.5 py-0.5"
                            style={{
                              backgroundColor: `${news.categories.color}20`,
                              color: news.categories.color,
                            }}
                          >
                            {news.categories.name}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {news.view_count?.toLocaleString("pt-BR")}
                        </span>
                        {news.published_at && (
                          <span>
                            {format(new Date(news.published_at), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Desempenho por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryStats?.map((cat, index) => {
                  const maxViews = categoryStats[0]?.views || 1;
                  const percentage = (cat.views / maxViews) * 100;
                  return (
                    <div
                      key={index}
                      className="rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{cat.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {cat.count} notícias
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{cat.views.toLocaleString("pt-BR")}</p>
                          <p className="text-xs text-muted-foreground">views</p>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: cat.color 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Publicações e Views por Dia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {dailyStats?.map((day, index) => {
                  const maxPublished = Math.max(...dailyStats.map(d => d.published));
                  const height = maxPublished > 0 ? (day.published / maxPublished) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary/80 rounded-t transition-all"
                        style={{ height: `${Math.max(10, height)}%` }}
                        title={`${day.published} publicações, ${day.views} views`}
                      />
                      <span className="text-xs text-muted-foreground">{day.day}</span>
                      <span className="text-xs font-medium">{day.published}</span>
                    </div>
                  );
                })}
                {(!dailyStats || dailyStats.length === 0) && (
                  <p className="text-sm text-muted-foreground w-full text-center py-8">
                    Sem dados no período selecionado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Performance de Anúncios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {adStats?.map((ad, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ad.name}</p>
                      <p className="text-xs text-muted-foreground">{ad.slot_type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{ad.click_count} cliques</p>
                      <p className="text-xs text-muted-foreground">
                        {ad.impression_count} impressões
                      </p>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${ad.is_active ? "bg-green-500" : "bg-muted"}`} />
                  </div>
                ))}
                {(!adStats || adStats.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Nenhum anúncio cadastrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
