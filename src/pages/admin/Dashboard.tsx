import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper, FileText, PlaySquare, Eye, Plus, Search, Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNewsCreationModal } from "@/contexts/NewsCreationModalContext";
import { GradientKpiCard } from "@/components/admin/dashboard/GradientKpiCard";
import { DashboardAccessibilityPanel } from "@/components/admin/dashboard/DashboardAccessibilityPanel";
import { TrendingPanel } from "@/components/admin/dashboard/TrendingPanel";
import { UserManagementPanel } from "@/components/admin/dashboard/UserManagementPanel";
import { RecentArticlesPanel } from "@/components/admin/dashboard/RecentArticlesPanel";
import { ImportLogsPanel } from "@/components/admin/dashboard/ImportLogsPanel";
import { QuickStatsPanel } from "@/components/admin/dashboard/QuickStatsPanel";
import { StreamingTogglePanel } from "@/components/admin/dashboard/StreamingTogglePanel";
import { MenuTogglePanel } from "@/components/admin/dashboard/MenuTogglePanel";

export default function Dashboard() {
  const { openModal } = useNewsCreationModal();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('pt-BR');

  // Fetch operational stats
  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        totalNews,
        publishedToday,
        categories,
        storiesCount,
        viewsSum,
        feedsActive,
      ] = await Promise.all([
        supabase.from("news").select("id", { count: "exact", head: true }),
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .eq("status", "published")
          .gte("published_at", today.toISOString()),
        supabase.from("categories").select("id", { count: "exact", head: true }),
        supabase.from("web_stories").select("id", { count: "exact", head: true }),
        supabase.from("news").select("view_count"),
        supabase
          .from("autopost_sources")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
      ]);

      const totalViews = viewsSum.data?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;

      return {
        totalNews: totalNews.count || 0,
        publishedToday: publishedToday.count || 0,
        totalCategories: categories.count || 0,
        totalStories: storiesCount.count || 0,
        totalViews,
        feedsActive: feedsActive.count || 0,
      };
    },
  });

  // KPI cards configuration
  const kpiCards = [
    { 
      title: "Artigos Publicados", 
      value: stats?.totalNews || 0, 
      icon: Newspaper, 
      gradient: "blue" as const,
      subtitle: `${stats?.publishedToday || 0} hoje`
    },
    { 
      title: "Categorias", 
      value: stats?.totalCategories || 0, 
      icon: FileText, 
      gradient: "green" as const 
    },
    { 
      title: "Feeds RSS", 
      value: stats?.feedsActive || 0, 
      icon: PlaySquare, 
      gradient: "blue" as const,
      subtitle: "ativos"
    },
    { 
      title: "Visualizações", 
      value: stats?.totalViews || 0, 
      icon: Eye, 
      gradient: "purple" as const 
    },
  ];

  return (
    <div className="p-6 space-y-6 min-h-screen bg-background">
      {/* Header Premium */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral do sistema de notícias Conexão na Cidade
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="capitalize">{dateStr}</span>
            <span className="font-mono font-bold text-foreground">{timeStr}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Buscar... (Ctrl+K)" className="w-64 pl-10 bg-card" />
          </div>
          <Button onClick={openModal} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Notícia
          </Button>
        </div>
      </header>

      {/* KPI Cards Row - 4 columns with premium variant */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <GradientKpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            gradient={kpi.gradient}
            subtitle={kpi.subtitle}
            variant="premium"
          />
        ))}
      </section>

      {/* Main Content - 8+4 columns for premium layout */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column - 8 cols */}
        <div className="lg:col-span-8 space-y-6">
          <RecentArticlesPanel />
          <DashboardAccessibilityPanel />
        </div>

        {/* Sidebar Column - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          <StreamingTogglePanel />
          <MenuTogglePanel />
          <TrendingPanel />
          <UserManagementPanel />
          <QuickStatsPanel />
        </div>
      </section>

      {/* Footer Panel - full width */}
      <section>
        <ImportLogsPanel />
      </section>
    </div>
  );
}
