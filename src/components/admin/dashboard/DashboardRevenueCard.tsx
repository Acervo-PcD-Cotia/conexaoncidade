import { useQuery } from "@tanstack/react-query";
import { DollarSign, TrendingUp, Eye, MousePointer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { DashboardPanel } from "./DashboardPanel";

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
      iconColor: "text-primary",
    },
    {
      label: "CTR Médio",
      value: `${avgCtr}%`,
      icon: TrendingUp,
      iconColor: "text-money",
    },
  ];

  return (
    <DashboardPanel
      title="Receita & Monetização"
      icon={DollarSign}
      iconColor="text-money"
      contentClassName="space-y-1"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-between py-2 px-2 -mx-2 rounded-md"
        >
          <div className="flex items-center gap-2">
            <stat.icon className={cn("h-3.5 w-3.5", stat.iconColor)} />
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <span className="font-bold tabular-nums text-sm">{stat.value}</span>
        </div>
      ))}
    </DashboardPanel>
  );
}
