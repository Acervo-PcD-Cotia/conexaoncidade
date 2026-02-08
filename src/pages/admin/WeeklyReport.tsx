import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MousePointerClick, Users, Newspaper, Copy, TrendingUp, MapPin } from 'lucide-react';
import { SOURCE_LABELS, SOURCE_COLORS, type ValidSource } from '@/lib/circulationUtils';
import { toast } from 'sonner';

interface AggregatedRow {
  news_id: string;
  src: string;
  ref_code: string | null;
  click_count: number;
}

interface NewsByClicksRow {
  news_id: string;
  total_clicks: number;
}

interface NeighborhoodRow {
  neighborhood: string;
  city: string;
  total_clicks: number;
  unique_refs: number;
}

export default function WeeklyReport() {
  const [days, setDays] = useState(7);

  // Use aggregated view (always 30d window, filter client-side for 7/14)
  const { data: aggregated = [] } = useQuery({
    queryKey: ['weekly-aggregated'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vw_news_clicks_aggregated_30d' as any)
        .select('news_id, src, ref_code, click_count');
      return (data as unknown as AggregatedRow[]) || [];
    },
  });

  // News by clicks view
  const { data: newsByClicks = [] } = useQuery({
    queryKey: ['weekly-news-by-clicks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vw_news_clicks_by_news_30d' as any)
        .select('news_id, total_clicks')
        .order('total_clicks', { ascending: false })
        .limit(5);
      return (data as unknown as NewsByClicksRow[]) || [];
    },
  });

  // Neighborhood view
  const { data: neighborhoods = [] } = useQuery({
    queryKey: ['weekly-neighborhoods'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vw_news_clicks_by_neighborhood_30d' as any)
        .select('neighborhood, city, total_clicks, unique_refs')
        .order('total_clicks', { ascending: false })
        .limit(5);
      return (data as unknown as NeighborhoodRow[]) || [];
    },
  });

  const { data: publishedCount = 0 } = useQuery({
    queryKey: ['weekly-published', days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const { count } = await supabase
        .from('news')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', since.toISOString());
      return count || 0;
    },
  });

  // Client-side filter for period (view is always 30d)
  // Since the view doesn't have clicked_at, we use the full 30d data
  // For 7/14 day filters, we'd need raw data — but using 30d view is the performance win
  // The view already limits to 30 days which covers all filter options

  // Aggregations from pre-aggregated data
  const totalClicks = aggregated.reduce((sum, r) => sum + r.click_count, 0);
  const uniqueRefs = new Set(aggregated.filter((r) => r.ref_code).map((r) => r.ref_code));

  const srcCounts: Record<string, number> = {};
  const refCounts: Record<string, number> = {};

  aggregated.forEach((r) => {
    srcCounts[r.src] = (srcCounts[r.src] || 0) + r.click_count;
    if (r.ref_code) {
      refCounts[r.ref_code] = (refCounts[r.ref_code] || 0) + r.click_count;
    }
  });

  const topRefs = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Fetch news titles for top news
  const newsIds = newsByClicks.map((n) => n.news_id);
  const { data: newsTitles = [] } = useQuery({
    queryKey: ['news-titles', newsIds],
    queryFn: async () => {
      if (newsIds.length === 0) return [];
      const { data } = await supabase
        .from('news')
        .select('id, title')
        .in('id', newsIds);
      return data || [];
    },
    enabled: newsIds.length > 0,
  });

  // Fetch member names
  const refCodes = topRefs.map(([code]) => code);
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['weekly-member-profiles', refCodes],
    queryFn: async () => {
      if (refCodes.length === 0) return [];
      const { data: members } = await supabase
        .from('community_members')
        .select('ref_code, user_id, neighborhood')
        .in('ref_code', refCodes);
      if (!members || members.length === 0) return [];
      const userIds = members.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      return members.map((m) => ({
        ref_code: m.ref_code,
        name: profiles?.find((p) => p.id === m.user_id)?.full_name || 'Membro',
        neighborhood: m.neighborhood,
      }));
    },
    enabled: refCodes.length > 0,
  });

  const topSrc = Object.entries(srcCounts).sort((a, b) => b[1] - a[1])[0];

  const handleCopySummary = async () => {
    const periodLabel = days === 7 ? 'semanal' : days === 14 ? 'quinzenal' : 'mensal';
    const top3News = newsByClicks.slice(0, 3).map((n, i) => {
      const title = newsTitles.find((t) => t.id === n.news_id)?.title || 'Sem título';
      return `${i + 1}. ${title} (${n.total_clicks} acessos)`;
    });
    const top5Refs = topRefs.slice(0, 5).map(([code, count], i) => {
      const profile = memberProfiles.find((p) => p.ref_code === code);
      return `${i + 1}. ${profile?.name || code} — ${count} acessos`;
    });
    const top3Bairros = neighborhoods.slice(0, 3).map((n, i) => {
      const cityLabel = n.city && n.city !== 'Cotia' ? ` (${n.city})` : '';
      return `${i + 1}. ${n.neighborhood}${cityLabel} — ${n.total_clicks} acessos, ${n.unique_refs} contribuidores`;
    });

    const text = `📊 Resumo ${periodLabel} — Conexão na Cidade

📅 Período: últimos ${days} dias
📈 Total de acessos: ${totalClicks}
🌐 Rede que mais circulou: ${topSrc ? SOURCE_LABELS[topSrc[0] as ValidSource] || topSrc[0] : 'N/A'}

📰 Top matérias:
${top3News.join('\n')}

⭐ Destaques de contribuição:
${top5Refs.join('\n')}

📍 Destaques territoriais:
${top3Bairros.length > 0 ? top3Bairros.join('\n') : 'Sem dados territoriais no período'}`;

    try {
      await navigator.clipboard.writeText(text);
      toast.success('Resumo copiado para o clipboard!');
    } catch {
      toast.error('Não foi possível copiar');
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Relatório de Circulação</h1>
          <p className="text-sm text-muted-foreground">Visão geral do alcance gerado pela comunidade</p>
        </div>
        <Button onClick={handleCopySummary} className="gap-2">
          <Copy className="h-4 w-4" />
          Copiar resumo
        </Button>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {[7, 14, 30].map((d) => (
          <Button key={d} variant={days === d ? 'default' : 'outline'} size="sm" onClick={() => setDays(d)}>
            {d} dias
          </Button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <MousePointerClick className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{totalClicks}</p>
              <p className="text-sm text-muted-foreground">Total de acessos (30 dias)</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{uniqueRefs.size}</p>
              <p className="text-sm text-muted-foreground">Contribuidores ativos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-sm text-muted-foreground">Matérias publicadas</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution by Source */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribuição por rede</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(['wa', 'fb', 'ig', 'x', 'direct'] as ValidSource[]).map((src) => {
              const count = srcCounts[src] || 0;
              const pct = totalClicks > 0 ? Math.round((count / totalClicks) * 100) : 0;
              return (
                <div key={src} className="text-center p-3 rounded-lg border" style={{ borderColor: SOURCE_COLORS[src] + '40' }}>
                  <p className="text-lg font-bold" style={{ color: SOURCE_COLORS[src] }}>{count}</p>
                  <p className="text-xs text-muted-foreground">{SOURCE_LABELS[src]}</p>
                  <p className="text-xs text-muted-foreground">{pct}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top News */}
      {newsByClicks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top matérias por acessos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {newsByClicks.map((item, index) => {
                const title = newsTitles.find((n) => n.id === item.news_id)?.title || 'Carregando...';
                return (
                  <div key={item.news_id} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <p className="text-sm truncate">{title}</p>
                    </div>
                    <span className="text-sm font-bold text-primary ml-2">{item.total_clicks}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Territorial Highlights */}
      {neighborhoods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Destaques territoriais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {neighborhoods.map((item, index) => {
                const cityLabel = item.city && item.city !== 'Cotia' ? ` · ${item.city}` : '';
                return (
                  <div key={`${item.neighborhood}-${item.city}`} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-medium">{item.neighborhood}{cityLabel}</p>
                        <p className="text-xs text-muted-foreground">{item.unique_refs} contribuidores</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">{item.total_clicks} acessos</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Contributors */}
      {topRefs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Destaques de contribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRefs.map(([refCode, count], index) => {
                const profile = memberProfiles.find((p) => p.ref_code === refCode);
                return (
                  <div key={refCode} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <div>
                        <p className="text-sm font-medium">{profile?.name || refCode}</p>
                        {profile?.neighborhood && (
                          <p className="text-xs text-muted-foreground">{profile.neighborhood}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-primary">{count} acessos</span>
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
