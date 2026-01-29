import { useQuery } from "@tanstack/react-query";
import {
  Newspaper,
  FileText,
  PlaySquare,
  Eye,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Import new dashboard components
import { GradientKpiCard } from "@/components/admin/dashboard/GradientKpiCard";
import { DashboardAccessibilityPanel } from "@/components/admin/dashboard/DashboardAccessibilityPanel";
import { TrendingPanel } from "@/components/admin/dashboard/TrendingPanel";
import { UserManagementPanel } from "@/components/admin/dashboard/UserManagementPanel";
import { RecentArticlesPanel } from "@/components/admin/dashboard/RecentArticlesPanel";
import { ImportLogsPanel } from "@/components/admin/dashboard/ImportLogsPanel";
import { QuickStatsPanel } from "@/components/admin/dashboard/QuickStatsPanel";

export default function Dashboard() {
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
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do sistema de notícias Conexão na Cidade
        </p>
      </header>

      {/* KPI Cards Row - 4 columns */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <GradientKpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            gradient={kpi.gradient}
            subtitle={kpi.subtitle}
          />
        ))}
      </section>

      {/* Main Content - 5+7 columns */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <DashboardAccessibilityPanel />
          <TrendingPanel />
          <UserManagementPanel />
        </div>

        {/* Right Column - 7 cols */}
        <div className="lg:col-span-7">
          <RecentArticlesPanel />
        </div>
      </section>

      {/* Footer Panels - 2 columns */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImportLogsPanel />
        <QuickStatsPanel />
      </section>
    </div>
  );
}
