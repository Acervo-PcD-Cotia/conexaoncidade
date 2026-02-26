import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, BarChart3, Eye, Clock, Monitor, Smartphone, Tablet, Globe, TrendingUp, Users, Zap, Settings, Activity } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";

const CHART_COLORS = ["hsl(var(--primary))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];
const DEVICE_COLORS = { desktop: "#6366f1", mobile: "#f59e0b", tablet: "#10b981" };

export default function CoreAnalytics() {
  const [period, setPeriod] = useState("7");
  const [onlineCount, setOnlineCount] = useState(0);

  // Realtime: contagem de sessões ativas (últimos 5 min)
  useEffect(() => {
    const fetchOnline = async () => {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("core_analytics_sessions")
        .select("*", { count: "exact", head: true })
        .gte("last_seen_at", fiveMinAgo);
      setOnlineCount(count || 0);
    };

    fetchOnline();
    const interval = setInterval(fetchOnline, 15000);

    const channel = supabase
      .channel("analytics-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "core_analytics_sessions" }, () => {
        fetchOnline();
      })
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  // Dados principais
  const { data: stats } = useQuery({
    queryKey: ["core-analytics-full", period],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(period));

      const { data: pageviews, error } = await supabase
        .from("core_analytics_pageviews")
        .select("page_path, page_title, device_type, referrer, duration_ms, news_id, created_at, country, city")
        .gte("created_at", daysAgo.toISOString())
        .order("created_at", { ascending: true })
        .limit(1000);

      if (error) throw error;

      const totalViews = pageviews?.length || 0;
      const withDuration = pageviews?.filter(p => p.duration_ms && p.duration_ms > 0) || [];
      const avgDuration = withDuration.length
        ? Math.round(withDuration.reduce((sum, p) => sum + (p.duration_ms || 0), 0) / withDuration.length / 1000)
        : 0;

      // Device breakdown
      const devices = { desktop: 0, mobile: 0, tablet: 0 };
      pageviews?.forEach(p => {
        const d = (p.device_type || "desktop") as keyof typeof devices;
        if (d in devices) devices[d]++;
      });

      // Top pages
      const pageCounts: Record<string, { count: number; title: string }> = {};
      pageviews?.forEach(p => {
        if (!pageCounts[p.page_path]) pageCounts[p.page_path] = { count: 0, title: p.page_title || p.page_path };
        pageCounts[p.page_path].count++;
      });
      const topPages = Object.entries(pageCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10)
        .map(([path, d]) => ({ path, count: d.count, title: d.title }));

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

      // Daily views chart data
      const dailyCounts: Record<string, { views: number; avgDuration: number; durations: number[] }> = {};
      pageviews?.forEach(p => {
        const day = p.created_at.split("T")[0];
        if (!dailyCounts[day]) dailyCounts[day] = { views: 0, avgDuration: 0, durations: [] };
        dailyCounts[day].views++;
        if (p.duration_ms && p.duration_ms > 0) dailyCounts[day].durations.push(p.duration_ms);
      });
      const dailyChart = Object.entries(dailyCounts)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, d]) => ({
          date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
          views: d.views,
          avgDuration: d.durations.length ? Math.round(d.durations.reduce((a, b) => a + b, 0) / d.durations.length / 1000) : 0,
        }));

      // Device pie data
      const devicePie = Object.entries(devices)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }));

      // Hourly heatmap (0-23h)
      const hourlyData: Record<number, number> = {};
      for (let i = 0; i < 24; i++) hourlyData[i] = 0;
      pageviews?.forEach(p => {
        const h = new Date(p.created_at).getHours();
        hourlyData[h]++;
      });
      const hourlyChart = Object.entries(hourlyData).map(([hour, count]) => ({
        hour: `${hour}h`,
        views: count,
      }));

      // Country breakdown
      const countryCounts: Record<string, number> = {};
      pageviews?.forEach(p => {
        const c = p.country || "BR";
        countryCounts[c] = (countryCounts[c] || 0) + 1;
      });
      const topCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Unique sessions
      const sessionSet = new Set(pageviews?.map(p => p.page_path + (p.created_at?.split("T")[0] || "")));
      const uniquePages = sessionSet.size;

      return {
        totalViews,
        avgDuration,
        devices,
        topPages,
        topReferrers,
        dailyChart,
        devicePie,
        hourlyChart,
        topCountries,
        uniquePages,
      };
    },
  });

  // Integrações
  const { data: integrations, refetch: refetchIntegrations } = useQuery({
    queryKey: ["core-analytics-integrations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_analytics_integrations")
        .select("*")
        .order("integration_key");
      if (error) throw error;
      return data || [];
    },
  });

  const toggleIntegration = async (id: string, enabled: boolean) => {
    const { error } = await supabase
      .from("core_analytics_integrations")
      .update({ is_enabled: enabled })
      .eq("id", id);
    if (error) toast.error("Erro ao atualizar");
    else {
      toast.success(enabled ? "Integração ativada" : "Integração desativada");
      refetchIntegrations();
    }
  };

  const updateIntegrationConfig = async (id: string, config: Record<string, unknown>) => {
    const { error } = await supabase
      .from("core_analytics_integrations")
      .update({ config: config as unknown as Record<string, never> })
      .eq("id", id);
    if (error) toast.error("Erro ao salvar");
    else {
      toast.success("Configuração salva");
      refetchIntegrations();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/spah/painel/core-engine">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </NavLink>
          <div className="p-2 rounded-xl bg-purple-500/10"><BarChart3 className="h-5 w-5 text-purple-500" /></div>
          <h1 className="text-xl font-bold">Analytics Interno</h1>
          <Badge variant="secondary" className="gap-1 animate-pulse">
            <Activity className="h-3 w-3" />
            {onlineCount} online
          </Badge>
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

      <Tabs defaultValue="dashboard">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="traffic">Tráfego</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
        </TabsList>

        {/* ── DASHBOARD ── */}
        <TabsContent value="dashboard" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: "Usuários Online", value: onlineCount, icon: Users, color: "text-green-500" },
              { label: "Total de Visitas", value: stats?.totalViews || 0, icon: Eye, color: "text-blue-500" },
              { label: "Tempo Médio", value: `${stats?.avgDuration || 0}s`, icon: Clock, color: "text-amber-500" },
              { label: "Desktop", value: stats?.devices.desktop || 0, icon: Monitor, color: "text-indigo-500" },
              { label: "Mobile", value: stats?.devices.mobile || 0, icon: Smartphone, color: "text-orange-500" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-4 flex items-center gap-3">
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico temporal de visitas */}
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Visitas por Dia</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {stats?.dailyChart && stats.dailyChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={stats.dailyChart}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 11 }} />
                    <YAxis className="text-xs" tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="views" stroke="#6366f1" fill="url(#colorViews)" name="Visitas" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-10">Sem dados no período</p>
              )}
            </CardContent>
          </Card>

          {/* Tempo médio por dia + Dispositivos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" />Tempo Médio por Dia (s)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {stats?.dailyChart && stats.dailyChart.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.dailyChart}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                      <Bar dataKey="avgDuration" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Tempo (s)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm flex items-center gap-2"><Smartphone className="h-4 w-4" />Dispositivos</CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex items-center justify-center">
                {stats?.devicePie && stats.devicePie.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={stats.devicePie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {stats.devicePie.map((_, i) => (
                          <Cell key={i} fill={Object.values(DEVICE_COLORS)[i] || CHART_COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-8">Sem dados</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Horários de pico */}
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4" />Horários de Pico</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {stats?.hourlyChart ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={stats.hourlyChart}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="views" fill="#10b981" radius={[3, 3, 0, 0]} name="Visitas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PAGES ── */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />Top 10 Páginas</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!stats?.topPages?.length ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Sem dados</p>
              ) : (
                <div className="divide-y divide-border">
                  {stats.topPages.map((p, i) => (
                    <div key={p.path} className="flex items-center gap-3 px-4 py-3">
                      <span className="text-xs text-muted-foreground w-5 font-mono">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{p.path}</p>
                      </div>
                      <Badge variant="secondary">{p.count} views</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TRAFFIC ── */}
        <TabsContent value="traffic" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Origem do Tráfego</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!stats?.topReferrers?.length ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">Sem dados de referrer</p>
                ) : (
                  <div className="divide-y divide-border">
                    {stats.topReferrers.map(([ref, count], i) => (
                      <div key={ref} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                        <span className="text-sm truncate flex-1">{ref}</span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4" />Top Países</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {!stats?.topCountries?.length ? (
                  <p className="p-4 text-sm text-muted-foreground text-center">Sem dados</p>
                ) : (
                  <div className="divide-y divide-border">
                    {stats.topCountries.map(([country, count]) => (
                      <div key={country} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="text-sm font-medium">{country}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(count / (stats.totalViews || 1)) * 100}%` }}
                          />
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── INTEGRATIONS ── */}
        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrations?.map(integration => {
              const config = (integration.config || {}) as Record<string, string>;
              const icon = integration.integration_key === "ga4" ? BarChart3 
                : integration.integration_key === "search_console" ? Globe 
                : Zap;
              const Icon = icon;
              
              return (
                <Card key={integration.id}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-muted"><Icon className="h-5 w-5" /></div>
                        <div>
                          <h3 className="font-semibold text-sm">{integration.display_name}</h3>
                          <p className="text-xs text-muted-foreground">{integration.integration_key}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={integration.is_enabled ? "default" : "outline"}>
                          {integration.is_enabled ? "Ativo" : "Inativo"}
                        </Badge>
                        <Switch
                          checked={integration.is_enabled || false}
                          onCheckedChange={(v) => toggleIntegration(integration.id, v)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {Object.entries(config).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <Label className="text-xs">{key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</Label>
                          <Input
                            value={value || ""}
                            placeholder={`Insira ${key}`}
                            onChange={(e) => {
                              const newConfig = { ...config, [key]: e.target.value };
                              // debounced save on blur
                              e.target.dataset.pending = JSON.stringify(newConfig);
                            }}
                            onBlur={(e) => {
                              if (e.target.dataset.pending) {
                                updateIntegrationConfig(integration.id, JSON.parse(e.target.dataset.pending));
                              }
                            }}
                            className="text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Settings className="h-4 w-4" />Como configurar</h4>
              <div className="text-xs text-muted-foreground space-y-2">
                <p><strong>GA4:</strong> Insira o Measurement ID (G-XXXXX) e API Secret do Google Analytics 4. Os eventos serão enviados via Measurement Protocol.</p>
                <p><strong>Search Console:</strong> Insira a URL do site verificado e a API Key para consultar dados de indexação e CTR.</p>
                <p><strong>Meta Pixel:</strong> Insira o Pixel ID do Facebook/Meta para rastrear eventos de conversão e engajamento.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
