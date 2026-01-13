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
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        .limit(5);
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
      title: "Pub. Hoje",
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
      title: "Revisão",
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
      title: "Ativos",
      value: stats?.activeUsers || 0,
      icon: Eye,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Online",
      value: stats?.onlineUsers || 0,
      icon: Users,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      archived: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    };
    const labels: Record<string, string> = {
      published: "Pub",
      draft: "Rasc",
      scheduled: "Agend",
      archived: "Arq",
    };
    return (
      <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const alertsCount = (alerts?.oldDraftsCount || 0) + (alerts?.noImageCount || 0) + (stats?.inactiveIntegrations || 0);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-[calc(100vh-80px)] gap-3">
        {/* Header - Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold">Dashboard</h1>
            {alertsCount > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="destructive" className="gap-1 cursor-help">
                    <AlertTriangle className="h-3 w-3" />
                    {alertsCount}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-1 text-sm">
                    {alerts?.oldDraftsCount ? (
                      <p>{alerts.oldDraftsCount} rascunhos antigos (&gt;7 dias)</p>
                    ) : null}
                    {alerts?.noImageCount ? (
                      <p>{alerts.noImageCount} notícias sem imagem</p>
                    ) : null}
                    {stats?.inactiveIntegrations ? (
                      <p>{stats.inactiveIntegrations} integrações inativas</p>
                    ) : null}
                  </div>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/quick-notes">
                <Zap className="mr-1.5 h-4 w-4" />
                Nota
              </Link>
            </Button>
            <Button size="sm" onClick={openModal}>
              <Newspaper className="mr-1.5 h-4 w-4" />
              Nova Notícia
            </Button>
          </div>
        </div>

        {/* Stats Row - Ultra Compact */}
        <div className="grid gap-2 grid-cols-3 md:grid-cols-6">
          {operationalCards.map((stat) => (
            <Card key={stat.title} className="py-0">
              <div className="flex items-center justify-between p-2">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                  <p className="text-lg font-bold leading-none mt-0.5">
                    {typeof stat.value === "number" ? stat.value.toLocaleString("pt-BR") : stat.value}
                  </p>
                </div>
                <div className={`rounded p-1 ${stat.bgColor}`}>
                  <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Grid - Flex-1 to fill remaining space */}
        <div className="grid gap-3 lg:grid-cols-3 flex-1 min-h-0">
          {/* Recent Activity - 2 columns */}
          <Card className="lg:col-span-2 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b shrink-0">
              <span className="font-medium flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Últimas Atualizações
              </span>
              <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                <Link to="/admin/news">Ver todas</Link>
              </Button>
            </div>
            <div className="p-2 space-y-1 overflow-auto flex-1">
              {recentNews?.map((news) => (
                <div
                  key={news.id}
                  className="flex items-center justify-between rounded border p-1.5 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/admin/news/${news.id}/edit`}
                      className="text-sm font-medium hover:text-primary line-clamp-1"
                    >
                      {news.title}
                    </Link>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      {getStatusBadge(news.status)}
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" />
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
                  <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" asChild>
                    <Link to={`/admin/news/${news.id}/edit`}>
                      <Edit3 className="h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Sidebar */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* Most Read */}
            <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
              <div className="flex items-center justify-between p-3 border-b shrink-0">
                <span className="font-medium flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4" />
                  Mais Lidas
                </span>
              </div>
              <div className="p-2 space-y-1 overflow-auto flex-1">
                {mostRead?.map((news, index) => (
                  <div key={news.id} className="flex items-center gap-2 py-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                      {index + 1}
                    </span>
                    <Link
                      to={`/admin/news/${news.id}/edit`}
                      className="flex-1 text-xs hover:text-primary line-clamp-1"
                    >
                      {news.title}
                    </Link>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {news.view_count}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Creation - Compact */}
            <Card className="shrink-0">
              <div className="p-2">
                <p className="text-xs font-medium mb-2 flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Criação Rápida
                </p>
                <div className="grid grid-cols-4 gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-full"
                        onClick={openModal}
                      >
                        <PenLine className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Manual</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-full"
                        onClick={openModal}
                      >
                        <Sparkles className="h-4 w-4 text-purple-500" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Com IA</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-full"
                        asChild
                      >
                        <Link to="/admin/quick-notes">
                          <FileText className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Nota Rápida</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="h-8 w-full"
                        asChild
                      >
                        <Link to="/admin/stories/new">
                          <Image className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Web Story</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer Stats Bar */}
        <div className="flex items-center justify-center gap-6 py-2 border-t text-sm shrink-0 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-1.5">
            <Newspaper className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{stats?.totalNews || 0}</span>
            <span className="text-muted-foreground text-xs">notícias</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <PlaySquare className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{stats?.totalStories || 0}</span>
            <span className="text-muted-foreground text-xs">stories</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-1.5">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{stats?.totalViews?.toLocaleString('pt-BR') || 0}</span>
            <span className="text-muted-foreground text-xs">views</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
