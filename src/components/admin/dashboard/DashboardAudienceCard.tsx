import { useQuery } from "@tanstack/react-query";
import { Users, Eye, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardPanel } from "./DashboardPanel";

export function DashboardAudienceCard() {
  const { data: audienceStats } = useQuery({
    queryKey: ["dashboard-audience-stats"],
    queryFn: async () => {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const [totalViews, onlineUsers, totalUsers] = await Promise.all([
        supabase.from("news").select("view_count"),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("last_activity_at", twentyFourHoursAgo.toISOString()),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true }),
      ]);

      const views = totalViews.data?.reduce((acc, n) => acc + (n.view_count || 0), 0) || 0;

      return {
        totalViews: views,
        onlineUsers: onlineUsers.count || 0,
        totalUsers: totalUsers.count || 0,
      };
    },
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <DashboardPanel
      title="Audiência"
      icon={Users}
      iconColor="text-brand"
      contentClassName="pt-2"
    >
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="inline-flex p-1.5 rounded-lg bg-muted mb-1">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <p className="text-lg font-bold tabular-nums">
            {formatNumber(audienceStats?.totalViews || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">Views</p>
        </div>
        <div className="text-center">
          <div className="inline-flex p-1.5 rounded-lg bg-muted mb-1">
            <Users className="h-4 w-4 text-money" />
          </div>
          <p className="text-lg font-bold tabular-nums">
            {audienceStats?.onlineUsers || 0}
          </p>
          <p className="text-[10px] text-muted-foreground">Online 24h</p>
        </div>
        <div className="text-center">
          <div className="inline-flex p-1.5 rounded-lg bg-muted mb-1">
            <TrendingUp className="h-4 w-4 text-brand" />
          </div>
          <p className="text-lg font-bold tabular-nums">
            {formatNumber(audienceStats?.totalUsers || 0)}
          </p>
          <p className="text-[10px] text-muted-foreground">Usuários</p>
        </div>
      </div>
    </DashboardPanel>
  );
}
