import { useQuery } from "@tanstack/react-query";
import { Users, Eye, TrendingUp, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

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
    <Card className="dashboard-card-glass overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <Activity className="h-4 w-4 text-blue-500" />
          </div>
          Audiência
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="inline-flex p-2 rounded-full bg-orange-500/10 mb-2">
              <Eye className="h-5 w-5 text-orange-500" />
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {formatNumber(audienceStats?.totalViews || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Views Totais</p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-2 rounded-full bg-green-500/10 mb-2">
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {audienceStats?.onlineUsers || 0}
            </p>
            <p className="text-xs text-muted-foreground">Online (24h)</p>
          </div>
          <div className="text-center">
            <div className="inline-flex p-2 rounded-full bg-purple-500/10 mb-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {formatNumber(audienceStats?.totalUsers || 0)}
            </p>
            <p className="text-xs text-muted-foreground">Usuários</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
