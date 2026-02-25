import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BarChart3, Eye, Clock, Monitor, Smartphone, Globe, TrendingUp } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function CoreAnalytics() {
  const [period, setPeriod] = useState("7");

  const { data: stats } = useQuery({
    queryKey: ["core-analytics-stats", period],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(period));

      const { data: pageviews, error } = await supabase
        .from("core_analytics_pageviews")
        .select("page_path, device_type, referrer, duration_ms, created_at")
        .gte("created_at", daysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;

      const totalViews = pageviews?.length || 0;
      const avgDuration = pageviews?.length 
        ? Math.round(pageviews.reduce((sum, p) => sum + (p.duration_ms || 0), 0) / pageviews.length / 1000)
        : 0;
      
      // Device breakdown
      const devices = { desktop: 0, mobile: 0, tablet: 0 };
      pageviews?.forEach(p => {
        const d = (p.device_type || "desktop") as keyof typeof devices;
        if (d in devices) devices[d]++;
      });

      // Top pages
      const pageCounts: Record<string, number> = {};
      pageviews?.forEach(p => {
        pageCounts[p.page_path] = (pageCounts[p.page_path] || 0) + 1;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      // Top referrers
      const refCounts: Record<string, number> = {};
      pageviews?.forEach(p => {
        if (p.referrer) {
          try {
            const host = new URL(p.referrer).hostname;
            refCounts[host] = (refCounts[host] || 0) + 1;
          } catch {
            refCounts[p.referrer] = (refCounts[p.referrer] || 0) + 1;
          }
        }
      });
      const topReferrers = Object.entries(refCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      // Daily views
      const dailyCounts: Record<string, number> = {};
      pageviews?.forEach(p => {
        const day = p.created_at.split("T")[0];
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
      });

      return { totalViews, avgDuration, devices, topPages, topReferrers, dailyCounts };
    },
  });

  const statCards = [
    { label: "Total de Visitas", value: stats?.totalViews || 0, icon: Eye, color: "text-blue-500" },
    { label: "Tempo Médio", value: `${stats?.avgDuration || 0}s`, icon: Clock, color: "text-green-500" },
    { label: "Desktop", value: stats?.devices.desktop || 0, icon: Monitor, color: "text-purple-500" },
    { label: "Mobile", value: stats?.devices.mobile || 0, icon: Smartphone, color: "text-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/spah/painel/core-engine">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </NavLink>
          <div className="p-2 rounded-xl bg-purple-500/10"><BarChart3 className="h-5 w-5 text-purple-500" /></div>
          <h1 className="text-xl font-bold">Analytics Interno</h1>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Hoje</SelectItem>
            <SelectItem value="7">7 dias</SelectItem>
            <SelectItem value="30">30 dias</SelectItem>
            <SelectItem value="90">90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon className={cn("h-5 w-5", s.color)} />
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Pages */}
        <Card>
          <CardHeader className="p-4 border-b"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Páginas mais visitadas</CardTitle></CardHeader>
          <CardContent className="p-0">
            {stats?.topPages.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Sem dados</p>
            ) : (
              <div className="divide-y divide-border">
                {stats?.topPages.map(([path, count], i) => (
                  <div key={path} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-sm truncate flex-1">{path}</span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader className="p-4 border-b"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Origem do tráfego</CardTitle></CardHeader>
          <CardContent className="p-0">
            {stats?.topReferrers.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">Sem dados de referrer</p>
            ) : (
              <div className="divide-y divide-border">
                {stats?.topReferrers.map(([ref, count], i) => (
                  <div key={ref} className="flex items-center gap-3 px-4 py-2.5">
                    <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-sm truncate flex-1">{ref}</span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Device breakdown */}
      {stats && stats.totalViews > 0 && (
        <Card>
          <CardHeader className="p-4 border-b"><CardTitle className="text-sm">Dispositivos</CardTitle></CardHeader>
          <CardContent className="p-4">
            <div className="flex gap-4">
              {Object.entries(stats.devices).map(([device, count]) => {
                const pct = Math.round((count / stats.totalViews) * 100);
                return (
                  <div key={device} className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize">{device}</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
