import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Eye, MousePointer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export function DashboardRevenueCard() {
  // Fetch Publidoor metrics
  const { data: publidoorMetrics } = useQuery({
    queryKey: ["dashboard-publidoor-metrics"],
    queryFn: async () => {
      const [items, metrics] = await Promise.all([
        supabase
          .from("publidoor_items")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase
          .from("publidoor_metrics")
          .select("impressions, clicks"),
      ]);

      const totalImpressions = metrics.data?.reduce((acc, m) => acc + (m.impressions || 0), 0) || 0;
      const totalClicks = metrics.data?.reduce((acc, m) => acc + (m.clicks || 0), 0) || 0;
      const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

      return {
        activeItems: items.count || 0,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr: parseFloat(ctr),
      };
    },
  });

  // Fetch banner metrics
  const { data: bannerMetrics } = useQuery({
    queryKey: ["dashboard-banner-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ads")
        .select("impression_count, click_count")
        .eq("is_active", true);

      if (error) return { impressions: 0, clicks: 0 };

      const totalImpressions = data?.reduce((acc, ad) => acc + (ad.impression_count || 0), 0) || 0;
      const totalClicks = data?.reduce((acc, ad) => acc + (ad.click_count || 0), 0) || 0;

      return { impressions: totalImpressions, clicks: totalClicks };
    },
  });

  const totalImpressions = (publidoorMetrics?.impressions || 0) + (bannerMetrics?.impressions || 0);
  const totalClicks = (publidoorMetrics?.clicks || 0) + (bannerMetrics?.clicks || 0);
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  const stats = [
    {
      label: "Publidoors Ativos",
      value: publidoorMetrics?.activeItems || 0,
      icon: DollarSign,
      iconColor: "text-money",
    },
    {
      label: "Impressões Totais",
      value: totalImpressions >= 1000 ? `${(totalImpressions / 1000).toFixed(1)}K` : totalImpressions,
      icon: Eye,
      iconColor: "text-brand",
    },
    {
      label: "Cliques",
      value: totalClicks,
      icon: MousePointer,
      iconColor: "text-brand-secondary",
    },
    {
      label: "CTR Médio",
      value: `${avgCtr}%`,
      icon: TrendingUp,
      iconColor: "text-money",
    },
  ];

  return (
    <Card className="dashboard-card-glass overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-money/10">
            <DollarSign className="h-4 w-4 text-money" />
          </div>
          Receita & Monetização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-muted">
                <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="font-bold tabular-nums">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
