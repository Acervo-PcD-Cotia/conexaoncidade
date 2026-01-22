import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  ChevronRight,
  ImageOff,
  Search,
  Rss,
  Megaphone,
  Link2,
  Shield,
  Bot,
  BarChart3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import logoFull from "@/assets/logo-full.png";

export default function Dashboard() {
  const { openModal } = useNewsCreationModal();
  const navigate = useNavigate();
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Keyboard shortcut: Ctrl+K for global search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search query
  const { data: searchResults } = useQuery({
    queryKey: ["global-search", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return { news: [], stories: [] };
      
      const [newsResult, storiesResult] = await Promise.all([
        supabase
          .from("news")
          .select("id, title, slug, status")
          .ilike("title", `%${searchQuery}%`)
          .limit(5),
        supabase
          .from("web_stories")
          .select("id, title, slug")
          .ilike("title", `%${searchQuery}%`)
          .limit(3),
      ]);

      return {
        news: newsResult.data || [],
        stories: storiesResult.data || [],
      };
    },
    enabled: searchQuery.length >= 2,
  });
  
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

  // Fetch most read
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

  // Fetch recent news
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

  // Fetch alerts
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

  // Stats cards data
  const statsCards = [
    {
      title: "Publicadas Hoje",
      value: stats?.publishedToday || 0,
      icon: Newspaper,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      gradient: "from-emerald-500/20 to-transparent",
    },
    {
      title: "Total de Notícias",
      value: stats?.totalNews || 0,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      gradient: "from-blue-500/20 to-transparent",
    },
    {
      title: "Stories Ativos",
      value: stats?.totalStories || 0,
      icon: PlaySquare,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      gradient: "from-purple-500/20 to-transparent",
    },
    {
      title: "Visualizações",
      value: stats?.totalViews || 0,
      icon: Eye,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      gradient: "from-orange-500/20 to-transparent",
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: "Nova Notícia",
      description: "Criar notícia manual ou IA",
      icon: PenLine,
      color: "text-primary",
      bgColor: "bg-primary/10",
      onClick: () => openModal(),
    },
    {
      title: "Web Story",
      description: "Criar novo story visual",
      icon: PlaySquare,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
      href: "/admin/stories/new",
    },
    {
      title: "Nota Rápida",
      description: "Publicar nota curta",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
      href: "/admin/quick-notes",
    },
    {
      title: "Auto Post PRO",
      description: "Captura automática",
      icon: Bot,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
      href: "/admin/autopost",
    },
    {
      title: "Campanhas",
      description: "Gerenciar banners",
      icon: Megaphone,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
      href: "/admin/banners",
    },
    {
      title: "Analytics",
      description: "Métricas de desempenho",
      icon: BarChart3,
      color: "text-orange-600",
      bgColor: "bg-orange-500/10",
      href: "/admin/analytics",
    },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
      draft: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      review: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    };
    const labels: Record<string, string> = {
      published: "Publicado",
      draft: "Rascunho",
      scheduled: "Agendado",
      review: "Revisão",
    };
    return (
      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[status] || styles.draft}`}>
        {labels[status] || status}
      </span>
    );
  };

  const alertsCount = (alerts?.oldDraftsCount || 0) + (alerts?.noImageCount || 0) + (stats?.inactiveIntegrations || 0);

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-80px)] flex flex-col gap-0 overflow-hidden">
        {/* Header do Dashboard */}
        <header className="h-20 shrink-0 flex items-center justify-between px-6 border-b bg-background rounded-t-lg">
          {/* Left: Logo + Título */}
          <div className="flex items-center gap-4">
            <img src={logoFull} alt="Logo" className="h-12 w-auto hidden lg:block" />
            <div className="hidden lg:block h-10 w-px bg-border" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Centro de Comando</h1>
              <p className="text-sm text-muted-foreground">Dashboard Editorial</p>
            </div>
          </div>
          
          {/* Right: Alertas + Busca + Ações */}
          <div className="flex items-center gap-3">
            {/* Alertas Badge */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "relative h-9 px-3",
                    alertsCount === 0 && "text-muted-foreground"
                  )}
                >
                  <AlertTriangle className={cn(
                    "h-4 w-4",
                    alertsCount > 0 && "text-destructive animate-pulse"
                  )} />
                  {alertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-destructive text-[10px] text-white flex items-center justify-center px-1 font-medium">
                      {alertsCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 bg-popover">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Alertas Editoriais</h4>
                  {alertsCount === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum alerta no momento! 🎉</p>
                  ) : (
                    <div className="space-y-1">
                      {(alerts?.oldDraftsCount ?? 0) > 0 && (
                        <Link 
                          to="/admin/news?status=draft" 
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <FileText className="h-4 w-4 text-yellow-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alerts?.oldDraftsCount} rascunhos antigos</p>
                            <p className="text-xs text-muted-foreground">Há mais de 7 dias</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                      {(alerts?.noImageCount ?? 0) > 0 && (
                        <Link 
                          to="/admin/news?filter=no-image" 
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <ImageOff className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alerts?.noImageCount} sem imagem</p>
                            <p className="text-xs text-muted-foreground">Notícias publicadas</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                      {(stats?.inactiveIntegrations ?? 0) > 0 && (
                        <Link 
                          to="/admin/social/settings" 
                          className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{stats?.inactiveIntegrations} integrações inativas</p>
                            <p className="text-xs text-muted-foreground">Redes sociais</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Busca Global */}
            <Button 
              variant="outline" 
              size="sm"
              className="h-9 gap-2 hidden sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="text-muted-foreground">Buscar...</span>
              <kbd className="ml-2 text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
            </Button>
            
            {/* Nova Notícia */}
            <Button onClick={openModal} className="gap-2 h-9">
              <PenLine className="h-4 w-4" />
              <span className="hidden sm:inline">Nova Notícia</span>
            </Button>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 bg-muted/20">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden border-0 shadow-sm dashboard-card">
              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", stat.gradient)} />
              <CardContent className="relative p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold mt-1 tracking-tight">
                      {typeof stat.value === "number" 
                        ? stat.value >= 1000 
                          ? `${(stat.value / 1000).toFixed(1)}K`
                          : stat.value.toLocaleString('pt-BR')
                        : stat.value
                      }
                    </p>
                  </div>
                  <div className={cn("p-3 rounded-xl", stat.bgColor)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Main Content Grid */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-4 px-6 py-4 min-h-0 overflow-hidden">
          {/* Ações Rápidas - 3 columns */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            <Card className="flex-1 flex flex-col overflow-hidden dashboard-card">
              <div className="p-4 border-b shrink-0">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Ações Rápidas
                </h3>
              </div>
              <div className="flex-1 p-4 grid grid-cols-2 md:grid-cols-3 gap-3 content-start overflow-auto">
                {quickActions.map((action) => (
                  action.href ? (
                    <Link key={action.title} to={action.href}>
                      <Card className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 h-full dashboard-card">
                        <CardContent className="p-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", action.bgColor)}>
                            <action.icon className={cn("h-5 w-5", action.color)} />
                          </div>
                          <h4 className="font-semibold text-sm">{action.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ) : (
                    <Card 
                      key={action.title} 
                      className="group cursor-pointer hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 dashboard-card"
                      onClick={action.onClick}
                    >
                      <CardContent className="p-4">
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", action.bgColor)}>
                          <action.icon className={cn("h-5 w-5", action.color)} />
                        </div>
                        <h4 className="font-semibold text-sm">{action.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar - 2 columns */}
          <div className="lg:col-span-2 flex flex-col gap-4 min-h-0">
            {/* Últimas Atualizações */}
            <Card className="flex-1 flex flex-col overflow-hidden min-h-0 dashboard-card">
              <div className="p-4 border-b shrink-0 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Últimas Atualizações
                </h3>
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link to="/admin/news">Ver todas</Link>
                </Button>
              </div>
              <div className="flex-1 p-3 space-y-2 overflow-auto">
                {recentNews?.map((news) => (
                  <div
                    key={news.id}
                    className="flex items-center justify-between rounded-lg border p-2 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/admin/news/${news.id}/edit`}
                        className="text-sm font-medium hover:text-primary line-clamp-1"
                      >
                        {news.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(news.status)}
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <Eye className="h-3 w-3" />
                          {news.view_count}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(news.updated_at), {
                            addSuffix: true,
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" asChild>
                      <Link to={`/admin/news/${news.id}/edit`}>
                        <Edit3 className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            {/* Mais Lidas */}
            <Card className="flex-1 flex flex-col overflow-hidden min-h-0 dashboard-card">
              <div className="p-4 border-b shrink-0">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  Mais Lidas
                </h3>
              </div>
              <div className="flex-1 p-3 space-y-1 overflow-auto">
                {mostRead?.map((news, index) => (
                  <div key={news.id} className="flex items-center gap-3 py-2 hover:bg-muted/30 rounded-lg px-2 transition-colors">
                    <span className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0",
                      index === 0 && "bg-yellow-500 text-yellow-950",
                      index === 1 && "bg-slate-300 text-slate-700",
                      index === 2 && "bg-amber-600 text-amber-50",
                      index > 2 && "bg-muted text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <Link
                      to={`/admin/news/${news.id}/edit`}
                      className="flex-1 text-sm hover:text-primary line-clamp-1"
                    >
                      {news.title}
                    </Link>
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">
                      {news.view_count?.toLocaleString('pt-BR')}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </main>
      </div>

      {/* Command Dialog - Global Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput 
          placeholder="Buscar notícias, stories, categorias..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          {searchResults?.news && searchResults.news.length > 0 && (
            <CommandGroup heading="Notícias">
              {searchResults.news.map((news) => (
                <CommandItem
                  key={news.id}
                  onSelect={() => {
                    navigate(`/admin/news/${news.id}/edit`);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <Newspaper className="mr-2 h-4 w-4" />
                  <span className="flex-1 truncate">{news.title}</span>
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    {news.status}
                  </Badge>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {searchResults?.stories && searchResults.stories.length > 0 && (
            <CommandGroup heading="Web Stories">
              {searchResults.stories.map((story) => (
                <CommandItem
                  key={story.id}
                  onSelect={() => {
                    navigate(`/admin/stories/${story.id}/edit`);
                    setSearchOpen(false);
                    setSearchQuery("");
                  }}
                >
                  <PlaySquare className="mr-2 h-4 w-4" />
                  <span className="truncate">{story.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Ações Rápidas">
            <CommandItem onSelect={() => { openModal(); setSearchOpen(false); }}>
              <PenLine className="mr-2 h-4 w-4" />
              Nova Notícia
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/admin/stories/new'); setSearchOpen(false); }}>
              <Image className="mr-2 h-4 w-4" />
              Nova Web Story
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/admin/quick-notes'); setSearchOpen(false); }}>
              <Zap className="mr-2 h-4 w-4" />
              Notas Rápidas
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/admin/autopost'); setSearchOpen(false); }}>
              <Rss className="mr-2 h-4 w-4" />
              Auto Post PRO
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/admin/banners'); setSearchOpen(false); }}>
              <Megaphone className="mr-2 h-4 w-4" />
              Campanhas
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/admin/links'); setSearchOpen(false); }}>
              <Link2 className="mr-2 h-4 w-4" />
              Links Rastreáveis
            </CommandItem>
            <CommandItem onSelect={() => { navigate('/admin/community/moderation'); setSearchOpen(false); }}>
              <Shield className="mr-2 h-4 w-4" />
              Moderação
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </TooltipProvider>
  );
}
