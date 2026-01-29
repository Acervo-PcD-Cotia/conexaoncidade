import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function QuickStatsPanel() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-quick-stats"],
    queryFn: async () => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const [articlesThisWeek, feedsActive, viewsData, rssJobs] = await Promise.all([
        supabase
          .from("news")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekAgo.toISOString()),
        supabase
          .from("autopost_sources")
          .select("id", { count: "exact", head: true })
          .eq("status", "active"),
        supabase
          .from("news")
          .select("view_count")
          .eq("status", "published"),
        supabase
          .from("autopost_ingest_jobs")
          .select("status")
          .gte("started_at", weekAgo.toISOString()),
      ]);

      const totalViews = viewsData.data?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;
      const publishedCount = viewsData.data?.length || 1;
      const avgViews = Math.round(totalViews / publishedCount);

      const totalJobs = rssJobs.data?.length || 0;
      const successfulJobs = rssJobs.data?.filter(j => j.status === "success").length || 0;
      const successRate = totalJobs > 0 ? Math.round((successfulJobs / totalJobs) * 100) : 100;

      return {
        articlesThisWeek: articlesThisWeek.count || 0,
        feedsActive: feedsActive.count || 0,
        avgViews,
        successRate,
      };
    },
  });

  const statItems = [
    { label: "Artigos esta semana", value: stats?.articlesThisWeek || 0 },
    { label: "Feeds ativos", value: stats?.feedsActive || 0 },
    { label: "Média views/artigo", value: stats?.avgViews || 0 },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
            <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold">Estatísticas Rápidas</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="h-3 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-12" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {statItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <span className="text-sm font-bold text-primary tabular-nums">
                  {item.value.toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
            
            {/* Success Rate with Progress Bar */}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Taxa sucesso RSS</span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {stats?.successRate || 0}%
                </span>
              </div>
              <Progress 
                value={stats?.successRate || 0} 
                className="h-2"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
