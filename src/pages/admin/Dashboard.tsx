import { useQuery } from "@tanstack/react-query";
import { Newspaper, Eye, PlaySquare, Users, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [newsCount, storiesCount, viewsSum] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase.from("web_stories").select("id", { count: "exact", head: true }),
        supabase.from("news").select("view_count"),
      ]);

      const totalViews = viewsSum.data?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;

      return {
        totalNews: newsCount.count || 0,
        totalStories: storiesCount.count || 0,
        totalViews,
      };
    },
  });

  const { data: recentNews } = useQuery({
    queryKey: ["admin-recent-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("id, title, slug, status, published_at, view_count")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statCards = [
    {
      title: "Total de Notícias",
      value: stats?.totalNews || 0,
      icon: Newspaper,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Visualizações",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Web Stories",
      value: stats?.totalStories || 0,
      icon: PlaySquare,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Crescimento",
      value: "+12%",
      icon: TrendingUp,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral do portal de notícias</p>
        </div>
        <Button asChild>
          <Link to="/admin/news/new">
            <Newspaper className="mr-2 h-4 w-4" />
            Nova Notícia
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString("pt-BR")}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent News */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notícias Recentes</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/news">Ver todas</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNews?.map((news) => (
              <div
                key={news.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1">
                  <Link
                    to={`/admin/news/${news.id}/edit`}
                    className="font-medium hover:text-primary"
                  >
                    {news.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        news.status === "published"
                          ? "bg-green-100 text-green-700"
                          : news.status === "draft"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {news.status === "published"
                        ? "Publicado"
                        : news.status === "draft"
                        ? "Rascunho"
                        : news.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {news.view_count}
                    </span>
                    {news.published_at && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(news.published_at).toLocaleDateString("pt-BR")}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={`/admin/news/${news.id}/edit`}>Editar</Link>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
