import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MousePointerClick, Users, Share2 } from 'lucide-react';
import { SOURCE_LABELS, SOURCE_COLORS, type ValidSource } from '@/lib/circulationUtils';
import { useState } from 'react';

export default function NewsAnalytics() {
  const { id } = useParams<{ id: string }>();
  const [days, setDays] = useState(30);

  const { data: news, isLoading: newsLoading } = useQuery({
    queryKey: ['news-detail-admin', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('news')
        .select('id, title, slug, published_at')
        .eq('id', id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: clicks = [], isLoading: clicksLoading } = useQuery({
    queryKey: ['news-clicks-analytics', id, days],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - days);
      
      const { data } = await supabase
        .from('news_clicks' as any)
        .select('ref_code, src, clicked_at')
        .eq('news_id', id!)
        .gte('clicked_at', since.toISOString());
      return (data as any[]) || [];
    },
    enabled: !!id,
  });

  // Aggregate by source
  const srcCounts: Record<string, number> = {};
  const refCounts: Record<string, number> = {};
  const uniqueRefs = new Set<string>();

  clicks.forEach((c: any) => {
    srcCounts[c.src] = (srcCounts[c.src] || 0) + 1;
    if (c.ref_code) {
      uniqueRefs.add(c.ref_code);
      refCounts[c.ref_code] = (refCounts[c.ref_code] || 0) + 1;
    }
  });

  const topRefs = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // Fetch member names for top refs
  const refCodes = topRefs.map(([code]) => code);
  const { data: memberProfiles = [] } = useQuery({
    queryKey: ['member-profiles-by-ref', refCodes],
    queryFn: async () => {
      if (refCodes.length === 0) return [];
      const { data: members } = await supabase
        .from('community_members')
        .select('ref_code, user_id, neighborhood')
        .in('ref_code', refCodes);
      
      if (!members || members.length === 0) return [];
      
      const userIds = members.map((m: any) => m.user_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);
      
      return members.map((m: any) => ({
        ref_code: m.ref_code,
        name: profiles?.find((p: any) => p.id === m.user_id)?.full_name || 'Membro',
        neighborhood: m.neighborhood,
      }));
    },
    enabled: refCodes.length > 0,
  });

  if (newsLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Notícia não encontrada.</p>
        <Link to="/admin/news">
          <Button variant="link">Voltar</Button>
        </Link>
      </div>
    );
  }

  const totalClicks = clicks.length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin/news">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{news.title}</h1>
          <p className="text-sm text-muted-foreground">Circulação da matéria</p>
        </div>
      </div>

      {/* Period Filter */}
      <div className="flex gap-2">
        {[7, 14, 30].map((d) => (
          <Button
            key={d}
            variant={days === d ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDays(d)}
          >
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
              <p className="text-sm text-muted-foreground">Contribuidores únicos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <Share2 className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{Object.keys(srcCounts).length}</p>
              <p className="text-sm text-muted-foreground">Redes ativas</p>
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
                <div
                  key={src}
                  className="text-center p-3 rounded-lg border"
                  style={{ borderColor: SOURCE_COLORS[src] + '40' }}
                >
                  <p className="text-lg font-bold" style={{ color: SOURCE_COLORS[src] }}>
                    {count}
                  </p>
                  <p className="text-xs text-muted-foreground">{SOURCE_LABELS[src]}</p>
                  <p className="text-xs text-muted-foreground">{pct}%</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Contributors */}
      {topRefs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Destaques de contribuição</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topRefs.map(([refCode, count], index) => {
                const profile = memberProfiles.find((p: any) => p.ref_code === refCode);
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
