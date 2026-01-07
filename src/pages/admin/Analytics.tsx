import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Eye, Newspaper, FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Analytics() {
  // Fetch most read news
  const { data: mostRead } = useQuery({
    queryKey: ["analytics-most-read"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, slug, view_count, published_at, categories(name, color)")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(20);
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

      // Aggregate by category
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
    queryKey: ["analytics-daily"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data, error } = await supabase
        .from("news")
        .select("published_at")
        .eq("status", "published")
        .gte("published_at", sevenDaysAgo.toISOString());
      if (error) throw error;

      // Group by day
      const days: Record<string, number> = {};
      data?.forEach((n) => {
        if (n.published_at) {
          const day = new Date(n.published_at).toLocaleDateString("pt-BR", { weekday: "short" });
          days[day] = (days[day] || 0) + 1;
        }
      });

      return Object.entries(days).map(([day, count]) => ({ day, count }));
    },
  });

  const totalViews = mostRead?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold flex items-center gap-2">
          <BarChart3 className="h-8 w-8" />
          Analytics
        </h1>
        <p className="text-muted-foreground">
          Métricas de desempenho editorial
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Views
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString("pt-BR")}</div>
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
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="most-read" className="space-y-4">
        <TabsList>
          <TabsTrigger value="most-read">Mais Lidas</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="daily">Publicações</TabsTrigger>
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
                {categoryStats?.map((cat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg border p-3"
                  >
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
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                Publicações (últimos 7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-40">
                {dailyStats?.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/80 rounded-t"
                      style={{ height: `${Math.max(10, (day.count / 10) * 100)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                    <span className="text-xs font-medium">{day.count}</span>
                  </div>
                ))}
                {(!dailyStats || dailyStats.length === 0) && (
                  <p className="text-sm text-muted-foreground w-full text-center py-8">
                    Sem dados nos últimos 7 dias
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
