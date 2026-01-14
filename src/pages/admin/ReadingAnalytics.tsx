import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Clock, Eye, Headphones, Share2, ScrollText, TrendingUp } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b'];

export default function ReadingAnalytics() {
  const [period, setPeriod] = useState('7');

  const startDate = subDays(new Date(), parseInt(period)).toISOString();

  // Fetch overall metrics
  const { data: metrics, isLoading: loadingMetrics } = useQuery({
    queryKey: ['reading-analytics-metrics', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_reading_analytics')
        .select('*')
        .gte('created_at', startDate);

      if (error) throw error;

      const totalSessions = data.length;
      const avgTimeOnPage = totalSessions > 0 
        ? Math.round(data.reduce((acc, r) => acc + (r.time_on_page_seconds || 0), 0) / totalSessions)
        : 0;
      const avgScrollDepth = totalSessions > 0
        ? Math.round(data.reduce((acc, r) => acc + (r.scroll_depth_max || 0), 0) / totalSessions)
        : 0;
      const completionRate = totalSessions > 0
        ? Math.round((data.filter(r => r.read_completed).length / totalSessions) * 100)
        : 0;
      const audioPlays = data.filter(r => r.audio_played).length;
      const podcastPlays = data.filter(r => r.podcast_played).length;
      const shares = data.filter(r => r.shared).length;

      return {
        totalSessions,
        avgTimeOnPage,
        avgScrollDepth,
        completionRate,
        audioPlays,
        podcastPlays,
        shares,
      };
    },
  });

  // Fetch top articles by engagement
  const { data: topArticles, isLoading: loadingArticles } = useQuery({
    queryKey: ['reading-analytics-top-articles', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_reading_analytics')
        .select(`
          news_id,
          time_on_page_seconds,
          scroll_depth_max,
          read_completed,
          news:news_id (title, slug)
        `)
        .gte('created_at', startDate);

      if (error) throw error;

      // Aggregate by news_id
      const aggregated = data.reduce((acc: Record<string, any>, item) => {
        const newsId = item.news_id;
        if (!acc[newsId]) {
          acc[newsId] = {
            news_id: newsId,
            title: (item.news as any)?.title || 'Sem título',
            slug: (item.news as any)?.slug,
            sessions: 0,
            totalTime: 0,
            totalScroll: 0,
            completions: 0,
          };
        }
        acc[newsId].sessions++;
        acc[newsId].totalTime += item.time_on_page_seconds || 0;
        acc[newsId].totalScroll += item.scroll_depth_max || 0;
        if (item.read_completed) acc[newsId].completions++;
        return acc;
      }, {});

      return Object.values(aggregated)
        .map((item: any) => ({
          ...item,
          avgTime: Math.round(item.totalTime / item.sessions),
          avgScroll: Math.round(item.totalScroll / item.sessions),
          completionRate: Math.round((item.completions / item.sessions) * 100),
        }))
        .sort((a: any, b: any) => b.sessions - a.sessions)
        .slice(0, 10);
    },
  });

  // Fetch daily trend
  const { data: dailyTrend, isLoading: loadingTrend } = useQuery({
    queryKey: ['reading-analytics-daily-trend', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_reading_analytics')
        .select('created_at, time_on_page_seconds, scroll_depth_max, read_completed')
        .gte('created_at', startDate);

      if (error) throw error;

      // Group by date
      const byDate: Record<string, { sessions: number; time: number; scroll: number; completions: number }> = {};
      
      data.forEach(item => {
        const date = format(new Date(item.created_at), 'yyyy-MM-dd');
        if (!byDate[date]) {
          byDate[date] = { sessions: 0, time: 0, scroll: 0, completions: 0 };
        }
        byDate[date].sessions++;
        byDate[date].time += item.time_on_page_seconds || 0;
        byDate[date].scroll += item.scroll_depth_max || 0;
        if (item.read_completed) byDate[date].completions++;
      });

      return Object.entries(byDate)
        .map(([date, stats]) => ({
          date: format(new Date(date), 'dd/MM', { locale: ptBR }),
          sessions: stats.sessions,
          avgTime: Math.round(stats.time / stats.sessions),
          avgScroll: Math.round(stats.scroll / stats.sessions),
          completionRate: Math.round((stats.completions / stats.sessions) * 100),
        }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },
  });

  // Fetch device breakdown
  const { data: deviceStats, isLoading: loadingDevices } = useQuery({
    queryKey: ['reading-analytics-devices', period],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news_reading_analytics')
        .select('device_type')
        .gte('created_at', startDate);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach(item => {
        const device = item.device_type || 'unknown';
        counts[device] = (counts[device] || 0) + 1;
      });

      return Object.entries(counts).map(([name, value]) => ({
        name: name === 'mobile' ? 'Mobile' : name === 'tablet' ? 'Tablet' : name === 'desktop' ? 'Desktop' : 'Outro',
        value,
      }));
    },
  });

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics de Leitura</h1>
          <p className="text-muted-foreground">
            Métricas de engajamento com as notícias
          </p>
        </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Eye className="h-4 w-4" />
                <span className="text-xs">Sessões</span>
              </div>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{metrics?.totalSessions.toLocaleString()}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-xs">Tempo Médio</span>
              </div>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{formatTime(metrics?.avgTimeOnPage || 0)}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <ScrollText className="h-4 w-4" />
                <span className="text-xs">Scroll Médio</span>
              </div>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{metrics?.avgScrollDepth}%</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs">Conclusão</span>
              </div>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{metrics?.completionRate}%</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Headphones className="h-4 w-4" />
                <span className="text-xs">Áudio</span>
              </div>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{metrics?.audioPlays}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Headphones className="h-4 w-4" />
                <span className="text-xs">Podcast</span>
              </div>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{metrics?.podcastPlays}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Share2 className="h-4 w-4" />
                <span className="text-xs">Shares</span>
              </div>
              {loadingMetrics ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{metrics?.shares}</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trend" className="space-y-4">
          <TabsList>
            <TabsTrigger value="trend">Tendência Diária</TabsTrigger>
            <TabsTrigger value="articles">Top Artigos</TabsTrigger>
            <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          </TabsList>

          <TabsContent value="trend">
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Leitura</CardTitle>
                <CardDescription>Métricas de engajamento ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTrend ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="sessions"
                        stroke="hsl(var(--primary))"
                        name="Sessões"
                        strokeWidth={2}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="completionRate"
                        stroke="hsl(var(--accent))"
                        name="Taxa Conclusão %"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="articles">
            <Card>
              <CardHeader>
                <CardTitle>Artigos Mais Engajados</CardTitle>
                <CardDescription>Top 10 por número de sessões</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingArticles ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topArticles?.map((article: any, index) => (
                      <div
                        key={article.news_id}
                        className="flex items-center gap-4 p-3 rounded-lg bg-muted/30"
                      >
                        <span className="font-bold text-lg text-muted-foreground w-6">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{article.title}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{article.sessions} sessões</span>
                            <span>{formatTime(article.avgTime)} médio</span>
                            <span>{article.avgScroll}% scroll</span>
                            <span>{article.completionRate}% conclusão</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
                <CardDescription>Distribuição por tipo de dispositivo</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDevices ? (
                  <Skeleton className="h-80 w-full" />
                ) : (
                  <div className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={deviceStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {deviceStats?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
  );
}
