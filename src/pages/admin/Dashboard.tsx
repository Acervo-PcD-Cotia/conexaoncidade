import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Newspaper,
  Eye,
  PlaySquare,
  Clock,
  FileText,
  AlertTriangle,
  Edit3,
  Zap,
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
  PanelLeft,
  PanelLeftClose,
  Medal,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
import { useFocusMode } from "@/components/admin/AdminLayout";
import { useSsoNavigation } from "@/hooks/useSsoNavigation";
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

// Import new dashboard components
import { DashboardRevenueCard } from "@/components/admin/dashboard/DashboardRevenueCard";
import { DashboardProductionCard } from "@/components/admin/dashboard/DashboardProductionCard";
import { DashboardAudienceCard } from "@/components/admin/dashboard/DashboardAudienceCard";
import { KpiCard } from "@/components/admin/dashboard/KpiCard";
import { DashboardPanel } from "@/components/admin/dashboard/DashboardPanel";
import { QuickActionsGrid } from "@/components/admin/dashboard/QuickActionsGrid";

export default function Dashboard() {
  const { openModal } = useNewsCreationModal();
  const { focusMode, toggleFocusMode } = useFocusMode();
  const { navigateToGcotia, isLoading: isSsoLoading } = useSsoNavigation();
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

  // Stats cards data - Compact KPI format
  const statsCards = [
    { title: "Publicadas Hoje", value: stats?.publishedToday || 0, icon: Newspaper },
    { title: "Total de Notícias", value: stats?.totalNews || 0, icon: FileText },
    { title: "Stories Ativos", value: stats?.totalStories || 0, icon: PlaySquare },
    { title: "Visualizações", value: stats?.totalViews || 0, icon: Eye },
  ];

  // Quick actions - Compact format
  const quickActions = [
    { title: "Nova Notícia", description: "Criar notícia manual ou IA", icon: PenLine, onClick: () => openModal() },
    { title: "Web Story", description: "Criar novo story visual", icon: PlaySquare, href: "/admin/stories/new" },
    { title: "Nota Rápida", description: "Publicar nota curta", icon: Zap, href: "/admin/quick-notes" },
    { title: "Auto Post", description: "Captura automática", icon: Bot, href: "/admin/autopost" },
    { title: "Campanhas", description: "Gerenciar banners", icon: Megaphone, href: "/admin/banners" },
    { title: "Analytics", description: "Métricas de desempenho", icon: BarChart3, href: "/admin/analytics" },
    { title: "Academy", description: "Plataforma educacional", icon: GraduationCap, onClick: () => navigateToGcotia({ openInNewTab: true }), isLoading: isSsoLoading },
    { title: "Links", description: "Links rastreáveis", icon: Link2, href: "/admin/links" },
  ];

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      published: "bg-money/10 text-money",
      draft: "bg-muted text-muted-foreground",
      scheduled: "bg-brand/10 text-brand",
      review: "bg-primary/10 text-primary",
    };
    const labels: Record<string, string> = {
      published: "Publicado",
      draft: "Rascunho",
      scheduled: "Agendado",
      review: "Revisão",
    };
    return (
      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", styles[status] || styles.draft)}>
        {labels[status] || status}
      </span>
    );
  };

  const alertsCount = (alerts?.oldDraftsCount || 0) + (alerts?.noImageCount || 0) + (stats?.inactiveIntegrations || 0);

  return (
    <TooltipProvider>
      <div className="h-[calc(100vh-80px)] flex flex-col gap-0 overflow-hidden">
        {/* Header - Compact h-14 */}
        <header className="h-14 shrink-0 flex items-center justify-between px-6 border-b border-border bg-card">
          {/* Left: Logo + Título */}
          <div className="flex items-center gap-3">
            <img src={logoFull} alt="Logo" className="h-8 w-auto hidden lg:block" />
            <div className="hidden lg:block h-8 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">Centro de Comando</h1>
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Modo Foco */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={toggleFocusMode}
                  className={cn("h-8 w-8 p-0", focusMode && "bg-primary/10 text-primary")}
                >
                  {focusMode ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>{focusMode ? "Mostrar menu" : "Modo foco"}</p>
              </TooltipContent>
            </Tooltip>

            {/* Alertas Badge */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("relative h-8 w-8 p-0", alertsCount === 0 && "text-muted-foreground")}
                >
                  <AlertTriangle className={cn("h-4 w-4", alertsCount > 0 && "text-destructive")} />
                  {alertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-[16px] rounded-full bg-destructive text-[9px] text-white flex items-center justify-center px-1 font-medium">
                      {alertsCount}
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72 bg-popover">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Alertas Editoriais</h4>
                  {alertsCount === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum alerta! 🎉</p>
                  ) : (
                    <div className="space-y-1">
                      {(alerts?.oldDraftsCount ?? 0) > 0 && (
                        <Link 
                          to="/admin/news?status=draft" 
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <FileText className="h-4 w-4 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alerts?.oldDraftsCount} rascunhos antigos</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                      {(alerts?.noImageCount ?? 0) > 0 && (
                        <Link 
                          to="/admin/news?filter=no-image" 
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <ImageOff className="h-4 w-4 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alerts?.noImageCount} sem imagem</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      )}
                      {(stats?.inactiveIntegrations ?? 0) > 0 && (
                        <Link 
                          to="/admin/social/settings" 
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors"
                        >
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{stats?.inactiveIntegrations} integrações inativas</p>
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
              className="h-8 gap-2 hidden sm:flex"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-muted-foreground text-xs">Buscar...</span>
              <kbd className="ml-1 text-[9px] bg-muted px-1 py-0.5 rounded font-mono">⌘K</kbd>
            </Button>
            
            {/* Nova Notícia */}
            <Button onClick={openModal} size="sm" className="gap-1.5 h-8">
              <PenLine className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Nova Notícia</span>
            </Button>
          </div>
        </header>

        {/* KPI Cards Row - Compact */}
        <section className="shrink-0 grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4 bg-muted/20">
          {statsCards.map((stat) => (
            <KpiCard key={stat.title} title={stat.title} value={stat.value} icon={stat.icon} />
          ))}
        </section>

        {/* Main Content Grid - 8+4 cols */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 px-6 py-4 min-h-0 overflow-hidden">
          {/* Left Column - 8 cols */}
          <div className="lg:col-span-8 flex flex-col gap-4 min-h-0">
            {/* Recent Articles */}
            <DashboardPanel
              title="Artigos Recentes"
              icon={Clock}
              action={
                <Button variant="ghost" size="sm" className="h-7 text-xs" asChild>
                  <Link to="/admin/news">Ver todas</Link>
                </Button>
              }
              className="flex-1 flex flex-col overflow-hidden"
              contentClassName="flex-1 overflow-auto space-y-1"
            >
              {recentNews?.map((news) => (
                <div
                  key={news.id}
                  className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/admin/news/${news.id}/edit`}
                      className="text-sm font-medium hover:text-primary line-clamp-1"
                    >
                      {news.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getStatusBadge(news.status)}
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <Eye className="h-3 w-3" />
                        {news.view_count}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(news.updated_at), { addSuffix: true, locale: ptBR })}
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
            </DashboardPanel>

            {/* Most Read */}
            <DashboardPanel
              title="Mais Lidas"
              icon={TrendingUp}
              iconColor="text-primary"
              className="flex-1 flex flex-col overflow-hidden"
              contentClassName="flex-1 overflow-auto space-y-1"
            >
              {mostRead?.map((news, index) => (
                <div key={news.id} className="flex items-center gap-3 py-2 px-2 -mx-2 hover:bg-muted/30 rounded-md transition-colors">
                  {index < 3 ? (
                    <Medal className={cn(
                      "h-4 w-4 shrink-0",
                      index === 0 && "medal-gold",
                      index === 1 && "medal-silver",
                      index === 2 && "medal-bronze"
                    )} />
                  ) : (
                    <span className="flex h-4 w-4 items-center justify-center text-xs text-muted-foreground font-medium">
                      {index + 1}
                    </span>
                  )}
                  <Link
                    to={`/admin/news/${news.id}/edit`}
                    className="flex-1 text-sm hover:text-primary line-clamp-1"
                  >
                    {news.title}
                  </Link>
                  <span className="text-xs text-muted-foreground shrink-0 font-semibold tabular-nums">
                    {news.view_count?.toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </DashboardPanel>

            {/* Quick Actions - Compact grid */}
            <DashboardPanel
              title="Ações Rápidas"
              icon={Sparkles}
              className="shrink-0"
              contentClassName="pt-2"
            >
              <QuickActionsGrid actions={quickActions} />
            </DashboardPanel>
          </div>

          {/* Right Column - 4 cols */}
          <div className="lg:col-span-4 flex flex-col gap-4 min-h-0 overflow-auto">
            <DashboardProductionCard />
            <DashboardAudienceCard />
            <DashboardRevenueCard />
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
