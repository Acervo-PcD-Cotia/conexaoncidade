import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Gauge, AlertTriangle, CheckCircle, Monitor, Smartphone, Zap, ImageOff, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from "recharts";

// Thresholds Google Web Vitals
const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000, unit: "ms", label: "LCP" },
  fid: { good: 100, poor: 300, unit: "ms", label: "FID" },
  cls: { good: 0.1, poor: 0.25, unit: "", label: "CLS" },
  ttfb: { good: 800, poor: 1800, unit: "ms", label: "TTFB" },
  inp: { good: 200, poor: 500, unit: "ms", label: "INP" },
};

type MetricKey = keyof typeof THRESHOLDS;

function getScoreColor(value: number | null, metric: MetricKey): string {
  if (value == null) return "text-muted-foreground";
  const t = THRESHOLDS[metric];
  if (value <= t.good) return "text-green-500";
  if (value <= t.poor) return "text-amber-500";
  return "text-red-500";
}

function getScoreBadge(value: number | null, metric: MetricKey) {
  if (value == null) return <Badge variant="outline">N/A</Badge>;
  const t = THRESHOLDS[metric];
  if (value <= t.good) return <Badge className="bg-green-500/10 text-green-600 border-green-200">Bom</Badge>;
  if (value <= t.poor) return <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">Precisa Melhorar</Badge>;
  return <Badge className="bg-red-500/10 text-red-600 border-red-200">Ruim</Badge>;
}

export default function CorePerformance() {
  const [period, setPeriod] = useState("7");
  const queryClient = useQueryClient();

  // Métricas agregadas
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["core-performance-metrics", period],
    queryFn: async () => {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number(period));

      const { data, error } = await supabase
        .from("core_performance_metrics")
        .select("*")
        .gte("created_at", daysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(1000);

      if (error) throw error;
      return data || [];
    },
  });

  // Alertas ativos
  const { data: alerts } = useQuery({
    queryKey: ["core-performance-alerts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("core_performance_alerts")
        .select("*")
        .eq("is_resolved", false)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    },
  });

  // Resolver alerta
  const resolveAlert = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("core_performance_alerts")
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Alerta resolvido");
      queryClient.invalidateQueries({ queryKey: ["core-performance-alerts"] });
    },
  });

  // Calcular médias por métrica
  const averages = (() => {
    if (!metrics?.length) return null;
    const sums: Record<MetricKey, { total: number; count: number }> = {
      lcp: { total: 0, count: 0 },
      fid: { total: 0, count: 0 },
      cls: { total: 0, count: 0 },
      ttfb: { total: 0, count: 0 },
      inp: { total: 0, count: 0 },
    };

    metrics.forEach(m => {
      (Object.keys(sums) as MetricKey[]).forEach(key => {
        const v = m[key] as number | null;
        if (v != null) {
          sums[key].total += v;
          sums[key].count++;
        }
      });
    });

    return Object.fromEntries(
      (Object.keys(sums) as MetricKey[]).map(key => [
        key,
        sums[key].count > 0 ? Math.round((sums[key].total / sums[key].count) * 100) / 100 : null,
      ])
    ) as Record<MetricKey, number | null>;
  })();

  // Médias por página
  const pageMetrics = (() => {
    if (!metrics?.length) return [];
    const grouped: Record<string, { lcp: number[]; cls: number[]; ttfb: number[]; count: number }> = {};
    metrics.forEach(m => {
      if (!grouped[m.page_path]) grouped[m.page_path] = { lcp: [], cls: [], ttfb: [], count: 0 };
      grouped[m.page_path].count++;
      if (m.lcp) grouped[m.page_path].lcp.push(m.lcp);
      if (m.cls) grouped[m.page_path].cls.push(m.cls);
      if (m.ttfb) grouped[m.page_path].ttfb.push(m.ttfb);
    });
    return Object.entries(grouped)
      .map(([path, d]) => ({
        path,
        count: d.count,
        avgLCP: d.lcp.length ? Math.round(d.lcp.reduce((a, b) => a + b, 0) / d.lcp.length) : null,
        avgCLS: d.cls.length ? Math.round((d.cls.reduce((a, b) => a + b, 0) / d.cls.length) * 1000) / 1000 : null,
        avgTTFB: d.ttfb.length ? Math.round(d.ttfb.reduce((a, b) => a + b, 0) / d.ttfb.length) : null,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  })();

  // Chart data: LCP distribuição por dia
  const dailyLCP = (() => {
    if (!metrics?.length) return [];
    const grouped: Record<string, number[]> = {};
    metrics.forEach(m => {
      if (m.lcp) {
        const day = m.created_at.split("T")[0];
        if (!grouped[day]) grouped[day] = [];
        grouped[day].push(m.lcp);
      }
    });
    return Object.entries(grouped)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, vals]) => ({
        date: new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        p50: vals.sort((a, b) => a - b)[Math.floor(vals.length * 0.5)] || 0,
        p75: vals.sort((a, b) => a - b)[Math.floor(vals.length * 0.75)] || 0,
      }));
  })();

  // Device breakdown
  const deviceBreakdown = (() => {
    if (!metrics?.length) return [];
    const grouped: Record<string, { lcp: number[]; cls: number[] }> = {};
    metrics.forEach(m => {
      const d = m.device_type || "desktop";
      if (!grouped[d]) grouped[d] = { lcp: [], cls: [] };
      if (m.lcp) grouped[d].lcp.push(m.lcp);
      if (m.cls) grouped[d].cls.push(m.cls);
    });
    return Object.entries(grouped).map(([device, d]) => ({
      device: device.charAt(0).toUpperCase() + device.slice(1),
      avgLCP: d.lcp.length ? Math.round(d.lcp.reduce((a, b) => a + b, 0) / d.lcp.length) : 0,
      avgCLS: d.cls.length ? Math.round((d.cls.reduce((a, b) => a + b, 0) / d.cls.length) * 1000) / 1000 : 0,
    }));
  })();

  // Imagens não otimizadas (news com imagens sem WebP)
  const { data: unoptimizedImages } = useQuery({
    queryKey: ["core-performance-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("id, title, slug, featured_image_url, og_image_url, card_image_url")
        .not("featured_image_url", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return (data || []).filter(n => {
        const urls = [n.featured_image_url, n.og_image_url, n.card_image_url].filter(Boolean);
        return urls.some(u => u && !u.includes(".webp") && !u.includes("webp"));
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NavLink to="/spah/painel/core-engine">
            <Button variant="ghost" size="icon" className="h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
          </NavLink>
          <div className="p-2 rounded-xl bg-emerald-500/10"><Gauge className="h-5 w-5 text-emerald-500" /></div>
          <h1 className="text-xl font-bold">Performance</h1>
          {alerts && alerts.length > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />{alerts.length} alertas
            </Badge>
          )}
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

      <Tabs defaultValue="vitals">
        <TabsList>
          <TabsTrigger value="vitals">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="pages">Por Página</TabsTrigger>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="images">Imagens</TabsTrigger>
        </TabsList>

        {/* ── CORE WEB VITALS ── */}
        <TabsContent value="vitals" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(Object.keys(THRESHOLDS) as MetricKey[]).map(key => {
              const t = THRESHOLDS[key];
              const val = averages?.[key];
              return (
                <Card key={key}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">{t.label}</span>
                      {getScoreBadge(val, key)}
                    </div>
                    <p className={`text-2xl font-bold ${getScoreColor(val, key)}`}>
                      {val != null ? `${val}${t.unit}` : "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Bom: ≤{t.good}{t.unit} | Ruim: &gt;{t.poor}{t.unit}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* LCP P50/P75 por dia */}
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" />LCP por Dia (P50 / P75)</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {dailyLCP.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dailyLCP}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="p50" fill="#10b981" radius={[3, 3, 0, 0]} name="P50 (ms)" />
                    <Bar dataKey="p75" fill="#f59e0b" radius={[3, 3, 0, 0]} name="P75 (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-10">Sem dados de LCP no período</p>
              )}
            </CardContent>
          </Card>

          {/* Device Performance */}
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2"><Monitor className="h-4 w-4" />Performance por Dispositivo</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {deviceBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={deviceBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="device" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="avgLCP" fill="#6366f1" radius={[3, 3, 0, 0]} name="LCP Médio (ms)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">Sem dados</p>
              )}
            </CardContent>
          </Card>

          {/* Total de medições */}
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{metrics?.length || 0} medições no período</p>
                <p className="text-xs text-muted-foreground">As métricas são coletadas automaticamente via Web Vitals API dos visitantes do portal.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── POR PÁGINA ── */}
        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm">Performance por Página</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pageMetrics.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground text-center">Sem dados de performance por página</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 font-medium">Página</th>
                        <th className="text-right p-3 font-medium">Medições</th>
                        <th className="text-right p-3 font-medium">LCP</th>
                        <th className="text-right p-3 font-medium">CLS</th>
                        <th className="text-right p-3 font-medium">TTFB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageMetrics.map(p => (
                        <tr key={p.path} className="border-b hover:bg-muted/30">
                          <td className="p-3 truncate max-w-[300px]">{p.path}</td>
                          <td className="p-3 text-right">{p.count}</td>
                          <td className={`p-3 text-right font-mono ${getScoreColor(p.avgLCP, "lcp")}`}>
                            {p.avgLCP != null ? `${p.avgLCP}ms` : "—"}
                          </td>
                          <td className={`p-3 text-right font-mono ${getScoreColor(p.avgCLS, "cls")}`}>
                            {p.avgCLS != null ? p.avgCLS : "—"}
                          </td>
                          <td className={`p-3 text-right font-mono ${getScoreColor(p.avgTTFB, "ttfb")}`}>
                            {p.avgTTFB != null ? `${p.avgTTFB}ms` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── ALERTAS ── */}
        <TabsContent value="alerts" className="space-y-4">
          {!alerts?.length ? (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">Nenhum alerta ativo</p>
                <p className="text-sm text-muted-foreground">Todas as métricas estão dentro dos limites esperados.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <Card key={alert.id}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <AlertTriangle className={`h-5 w-5 ${alert.severity === "critical" ? "text-red-500" : "text-amber-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {alert.metric.toUpperCase()} = {alert.current_value} ({alert.severity})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Threshold: {alert.threshold} | Página: {alert.page_path || "Global"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{new Date(alert.created_at).toLocaleString("pt-BR")}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => resolveAlert.mutate(alert.id)}>
                      <CheckCircle className="h-3 w-3 mr-1" />Resolver
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-2">Thresholds de Alertas</h4>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                {(Object.keys(THRESHOLDS) as MetricKey[]).map(key => {
                  const t = THRESHOLDS[key];
                  return (
                    <div key={key} className="p-2 rounded-lg bg-muted/50">
                      <p className="font-medium">{t.label}</p>
                      <p className="text-green-600">Bom: ≤{t.good}{t.unit}</p>
                      <p className="text-red-600">Ruim: &gt;{t.poor}{t.unit}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── IMAGENS NÃO OTIMIZADAS ── */}
        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader className="p-4 border-b">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageOff className="h-4 w-4" />
                Imagens sem WebP ({unoptimizedImages?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!unoptimizedImages?.length ? (
                <div className="p-6 text-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Todas as imagens estão otimizadas!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {unoptimizedImages.slice(0, 20).map(n => (
                    <div key={n.id} className="flex items-center gap-3 px-4 py-3">
                      {n.featured_image_url && (
                        <img src={n.featured_image_url} alt="" className="w-12 h-8 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">/noticia/{n.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        {n.featured_image_url && !n.featured_image_url.includes("webp") && (
                          <Badge variant="outline" className="text-[10px]">Hero</Badge>
                        )}
                        {n.og_image_url && !n.og_image_url?.includes("webp") && (
                          <Badge variant="outline" className="text-[10px]">OG</Badge>
                        )}
                        {n.card_image_url && !n.card_image_url?.includes("webp") && (
                          <Badge variant="outline" className="text-[10px]">Card</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold mb-1">💡 Dica de Otimização</h4>
              <p className="text-xs text-muted-foreground">
                Imagens em formato WebP são 25-35% menores que JPEG/PNG com qualidade similar.
                O sistema de upload do portal já converte automaticamente para WebP — as listadas acima
                são imagens importadas externamente que não passaram pela conversão.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
