import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MousePointerClick, Users, Newspaper, Copy, TrendingUp } from 'lucide-react';
import { SOURCE_LABELS, SOURCE_COLORS, type ValidSource } from '@/lib/circulationUtils';
import { toast } from 'sonner';

interface ClickRow {
  news_id: string;
  ref_code: string | null;
  src: string;
  clicked_at: string;
}

export default function WeeklyReport() {
  const [days, setDays] = useState(7);

  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceISO = since.toISOString();

  const { data: clicks = [] } = useQuery({
    queryKey: ['weekly-clicks', days],
    queryFn: async () => {
      const { data } = await supabase
        .from('news_clicks' as any)
        .select('news_id, ref_code, src, clicked_at')
        .gte('clicked_at', sinceISO);
      return (data as unknown as ClickRow[]) || [];
    },
  });

  const { data: publishedCount = 0 } = useQuery({
    queryKey: ['weekly-published', days],
    queryFn: async () => {
      const { count } = await supabase
        .from('news')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('published_at', sinceISO);
      return count || 0;
    },
  });

  // Aggregations
  const totalClicks = clicks.length;
  const uniqueRefs = new Set(clicks.filter((c) => c.ref_code).map((c) => c.ref_code));

  const srcCounts: Record<string, number> = {};
  const newsCounts: Record<string, number> = {};
  const refCounts: Record<string, number> = {};

  clicks.forEach((c) => {
    srcCounts[c.src] = (srcCounts[c.src] || 0) + 1;
    newsCounts[c.news_id] = (newsCounts[c.news_id] || 0) + 1;
    if (c.ref_code) {
      refCounts[c.ref_code] = (refCounts[c.ref_code] || 0) + 1;
    }
  });

  const topNewsIds = Object.entries(newsCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const topRefs = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Fetch news titles
  const newsIds = topNewsIds.map(([id]) => id);
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
    const top3News = topNewsIds.slice(0, 3).map(([id, count], i) => {
      const title = newsTitles.find((n) => n.id === id)?.title || 'Sem título';
      return `${i + 1}. ${title} (${count} acessos)`;
    });
    const top5Refs = topRefs.slice(0, 5).map(([code, count], i) => {
      const profile = memberProfiles.find((p) => p.ref_code === code);
      return `${i + 1}. ${profile?.name || code} — ${count} acessos`;
    });

    const text = `📊 Resumo ${periodLabel} — Conexão na Cidade

📅 Período: últimos ${days} dias
📈 Total de acessos: ${totalClicks}
🌐 Rede que mais circulou: ${topSrc ? SOURCE_LABELS[topSrc[0] as ValidSource] || topSrc[0] : 'N/A'}

📰 Top matérias:
${top3News.join('\n')}

⭐ Destaques de contribuição:
${top5Refs.join('\n')}`;

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
              <p className="text-sm text-muted-foreground">Total de acessos</p>
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
      {topNewsIds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top matérias por acessos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topNewsIds.map(([newsId, count], index) => {
                const title = newsTitles.find((n) => n.id === newsId)?.title || 'Carregando...';
                return (
                  <div key={newsId} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground w-6">{index + 1}.</span>
                      <p className="text-sm truncate">{title}</p>
                    </div>
                    <span className="text-sm font-bold text-primary ml-2">{count}</span>
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
