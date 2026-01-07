import { useQuery } from "@tanstack/react-query";
import {
  Newspaper,
  Eye,
  PlaySquare,
  TrendingUp,
  Clock,
  FileText,
  AlertTriangle,
  Calendar,
  Edit3,
  Zap,
  FileSearch,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Dashboard() {
  // Fetch operational stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalNews,
        publishedToday,
        drafts,
        inReview,
        scheduled,
        storiesCount,
        viewsSum,
      ] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "published")
          .gte("published_at", today.toISOString()),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "review"),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "scheduled"),
        supabase.from("web_stories").select("id", { count: "exact", head: true }),
        supabase.from("news").select("view_count"),
      ]);

      const totalViews =
        viewsSum.data?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;

      return {
        totalNews: totalNews.count || 0,
        publishedToday: publishedToday.count || 0,
        drafts: drafts.count || 0,
        inReview: inReview.count || 0,
        scheduled: scheduled.count || 0,
        totalStories: storiesCount.count || 0,
        totalViews,
      };
    },
  });

  // Fetch most read today
  const { data: mostRead } = useQuery({
    queryKey: ["admin-most-read-today"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, slug, view_count")
        .eq("status", "published")
        .order("view_count", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  // Fetch recent news for activity
  const { data: recentNews } = useQuery({
    queryKey: ["admin-recent-news"],
    queryFn: async () => {
      const { data } = await supabase
        .from("news")
        .select("id, title, slug, status, published_at, view_count, updated_at")
        .order("updated_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  // Fetch editorial alerts
  const { data: alerts } = useQuery({
    queryKey: ["admin-alerts"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const [oldDrafts, noImage] = await Promise.all([
        supabase
          .from("news")
          .select("id, title", { count: "exact" })
          .eq("status", "draft")
          .lt("created_at", sevenDaysAgo.toISOString())
          .limit(5),
        supabase
          .from("news")
          .select("id, title", { count: "exact" })
          .eq("status", "published")
          .is("featured_image_url", null)
          .limit(5),
      ]);

      return {
        oldDrafts: oldDrafts.data || [],
        oldDraftsCount: oldDrafts.count || 0,
        noImage: noImage.data || [],
        noImageCount: noImage.count || 0,
      };
    },
  });

  const operationalCards = [
    {
      title: "Publicadas Hoje",
      value: stats?.publishedToday || 0,
      icon: Newspaper,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Rascunhos",
      value: stats?.drafts || 0,
      icon: FileText,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Em Revisão",
      value: stats?.inReview || 0,
      icon: FileSearch,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: "Agendadas",
      value: stats?.scheduled || 0,
      icon: Calendar,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total Views",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-green-100 text-green-700",
      draft: "bg-yellow-100 text-yellow-700",
      scheduled: "bg-blue-100 text-blue-700",
      archived: "bg-gray-100 text-gray-700",
    };
    const labels: Record<string, string> = {
      published: "Publicado",
      draft: "Rascunho",
      scheduled: "Agendado",
      archived: "Arquivado",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const hasAlerts = (alerts?.oldDraftsCount || 0) > 0 || (alerts?.noImageCount || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão operacional do portal</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/admin/quick-notes">
              <Zap className="mr-2 h-4 w-4" />
              Nota Rápida
            </Link>
          </Button>
          <Button asChild>
            <Link to="/admin/news/new">
              <Newspaper className="mr-2 h-4 w-4" />
              Nova Notícia
            </Link>
          </Button>
        </div>
      </div>

      {/* Operational Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {operationalCards.map((stat) => (
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
              <div className="text-2xl font-bold">
                {typeof stat.value === "number"
                  ? stat.value.toLocaleString("pt-BR")
                  : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Últimas Atualizações
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/news">Ver todas</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentNews?.map((news) => (
                <div
                  key={news.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/admin/news/${news.id}/edit`}
                      className="font-medium hover:text-primary line-clamp-1"
                    >
                      {news.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      {getStatusBadge(news.status)}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {news.view_count}
                      </span>
                      <span>
                        {formatDistanceToNow(new Date(news.updated_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" asChild>
                    <Link to={`/admin/news/${news.id}/edit`}>
                      <Edit3 className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sidebar: Most Read + Alerts */}
        <div className="space-y-6">
          {/* Most Read */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" />
                Mais Lidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mostRead?.map((news, index) => (
                  <div key={news.id} className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {index + 1}
                    </span>
                    <Link
                      to={`/admin/news/${news.id}/edit`}
                      className="flex-1 text-sm hover:text-primary line-clamp-1"
                    >
                      {news.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {news.view_count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Editorial Alerts */}
          {hasAlerts && (
            <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-900 dark:bg-yellow-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-yellow-700 dark:text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Editoriais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts?.oldDraftsCount ? (
                  <div className="text-sm">
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      {alerts.oldDraftsCount} rascunhos antigos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Rascunhos com mais de 7 dias
                    </p>
                  </div>
                ) : null}
                {alerts?.noImageCount ? (
                  <div className="text-sm">
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      {alerts.noImageCount} sem imagem
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Notícias publicadas sem imagem destacada
                    </p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PlaySquare className="h-5 w-5" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{stats?.totalNews || 0}</p>
                  <p className="text-xs text-muted-foreground">Notícias</p>
                </div>
                <div className="rounded-lg bg-muted p-3 text-center">
                  <p className="text-2xl font-bold">{stats?.totalStories || 0}</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
