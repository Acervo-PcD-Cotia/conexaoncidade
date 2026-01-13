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
  Users,
  PenLine,
  Sparkles,
  Image,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";

export default function Dashboard() {
  const { openModal } = useNewsCreationModal();
  // Fetch operational stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const [
        totalNews,
        publishedToday,
        drafts,
        inReview,
        scheduled,
        storiesCount,
        viewsSum,
        totalUsers,
        activeUsers,
        onlineUsers,
        socialAccounts,
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
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("is_active", true),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("last_activity_at", twentyFourHoursAgo.toISOString()),
        supabase
          .from("social_accounts")
          .select("id, platform, enabled"),
      ]);

      const totalViews =
        viewsSum.data?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;
      
      const inactiveIntegrations = (socialAccounts.data || []).filter(
        (acc) => !acc.enabled
      ).length;

      return {
        totalNews: totalNews.count || 0,
        publishedToday: publishedToday.count || 0,
        drafts: drafts.count || 0,
        inReview: inReview.count || 0,
        scheduled: scheduled.count || 0,
        totalStories: storiesCount.count || 0,
        totalViews,
        totalUsers: totalUsers.count || 0,
        activeUsers: activeUsers.count || 0,
        onlineUsers: onlineUsers.count || 0,
        inactiveIntegrations,
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
      title: "Usuários Ativos",
      value: stats?.activeUsers || 0,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Online (24h)",
      value: stats?.onlineUsers || 0,
      icon: Users,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
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

  const hasAlerts = (alerts?.oldDraftsCount || 0) > 0 || (alerts?.noImageCount || 0) > 0 || (stats?.inactiveIntegrations || 0) > 0;

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
          <Button onClick={openModal}>
            <Newspaper className="mr-2 h-4 w-4" />
            Nova Notícia
          </Button>
        </div>
      </div>

      {/* Operational Stats - Compact */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {operationalCards.map((stat) => (
          <Card key={stat.title} className="py-0">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`rounded-md p-1.5 ${stat.bgColor}`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="text-xl font-bold">
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
          <CardContent className="pt-0">
            <div className="space-y-2">
              {recentNews?.slice(0, 5).map((news) => (
                <div
                  key={news.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/admin/news/${news.id}/edit`}
                      className="text-sm font-medium hover:text-primary line-clamp-1"
                    >
                      {news.title}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
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
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link to={`/admin/news/${news.id}/edit`}>
                      <Edit3 className="h-3.5 w-3.5" />
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
                {stats?.inactiveIntegrations ? (
                  <div className="text-sm">
                    <p className="font-medium text-yellow-700 dark:text-yellow-400">
                      {stats.inactiveIntegrations} integração(ões) inativa(s)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Redes sociais desabilitadas
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

          {/* Quick Creation Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="h-5 w-5" />
                Criação Rápida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  className="h-auto flex-col gap-1 py-3"
                  onClick={openModal}
                >
                  <PenLine className="h-5 w-5" />
                  <span className="text-xs">Notícia Manual</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col gap-1 py-3"
                  onClick={openModal}
                >
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  <span className="text-xs">Com IA</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col gap-1 py-3"
                  asChild
                >
                  <Link to="/admin/quick-notes">
                    <FileText className="h-5 w-5" />
                    <span className="text-xs">Nota Rápida</span>
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto flex-col gap-1 py-3"
                  asChild
                >
                  <Link to="/admin/stories/new">
                    <Image className="h-5 w-5" />
                    <span className="text-xs">Web Story</span>
                  </Link>
                </Button>
              </div>
              <div className="rounded-lg bg-muted/50 p-2 text-center">
                <p className="text-xs text-muted-foreground">
                  💡 Dica: <kbd className="rounded bg-muted px-1 font-mono">Ctrl+N</kbd> para nova notícia
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats - Compact inline */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-around text-center">
                <div>
                  <p className="text-xl font-bold">{stats?.totalNews || 0}</p>
                  <p className="text-xs text-muted-foreground">Notícias</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-xl font-bold">{stats?.totalStories || 0}</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div>
                  <p className="text-xl font-bold">{stats?.totalViews?.toLocaleString('pt-BR') || 0}</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
