import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, FileText, CheckCircle, Wand2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { subDays, startOfDay, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Period = 'today' | 'week' | 'month';

interface Stats {
  total: number;
  success: number;
  successRate: number;
  corrected: number;
  correctedRate: number;
  avgDaily: number;
  bySource: { name: string; count: number; color: string }[];
  byDay: { date: string; success: number; error: number }[];
  byType: { type: string; count: number; icon: string }[];
}

const SOURCE_COLORS: Record<string, string> = {
  'AB': '#22C55E',
  'G1': '#EF4444',
  'FSP': '#1E3A8A',
  'UOL': '#F97316',
  'EST': '#3B82F6',
  'CNN': '#991B1B',
  'BBC': '#1F2937',
  'R7': '#DC2626',
  'TRR': '#16A34A',
  'iG': '#7C3AED',
  'EXT': '#6B7280',
};

export function NoticiasAIStatsTab() {
  const [period, setPeriod] = useState<Period>('week');
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const daysBack = period === 'today' ? 1 : period === 'week' ? 7 : 30;
        const startDate = startOfDay(subDays(new Date(), daysBack));

        const { data, error } = await supabase
          .from('noticias_ai_imports')
          .select('*')
          .gte('created_at', startDate.toISOString());

        if (error) throw error;

        const imports = data || [];
        const total = imports.length;
        const success = imports.filter(i => i.status === 'success').length;
        const corrected = imports.filter(i => i.format_corrected).length;

        // Group by source
        const sourceGroups: Record<string, number> = {};
        imports.forEach(i => {
          const badge = i.source_badge || 'EXT';
          sourceGroups[badge] = (sourceGroups[badge] || 0) + 1;
        });
        const bySource = Object.entries(sourceGroups)
          .map(([name, count]) => ({ name, count, color: SOURCE_COLORS[name] || SOURCE_COLORS.EXT }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 6);

        // Group by day
        const dayGroups: Record<string, { success: number; error: number }> = {};
        for (let i = 0; i < daysBack; i++) {
          const date = format(subDays(new Date(), i), 'dd/MM');
          dayGroups[date] = { success: 0, error: 0 };
        }
        imports.forEach(i => {
          const date = format(new Date(i.created_at), 'dd/MM');
          if (dayGroups[date]) {
            if (i.status === 'success') {
              dayGroups[date].success++;
            } else {
              dayGroups[date].error++;
            }
          }
        });
        const byDay = Object.entries(dayGroups)
          .map(([date, data]) => ({ date, ...data }))
          .reverse();

        // Group by type
        const typeGroups: Record<string, number> = {};
        imports.forEach(i => {
          const type = i.import_type || 'individual';
          typeGroups[type] = (typeGroups[type] || 0) + 1;
        });
        const byType = Object.entries(typeGroups).map(([type, count]) => ({
          type,
          count,
          icon: type === 'batch' ? '📦' : type === 'json' ? '📄' : '🔗',
        }));

        setStats({
          total,
          success,
          successRate: total > 0 ? Math.round((success / total) * 100) : 0,
          corrected,
          correctedRate: total > 0 ? Math.round((corrected / total) * 100) : 0,
          avgDaily: Math.round(total / daysBack),
          bySource,
          byDay,
          byType,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [period]);

  if (loading || !stats) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando estatísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-tour="stats-tab">
      {/* Period Selector */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Hoje</SelectItem>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Importado</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.successRate}%</p>
                {stats.successRate >= 90 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-amber-100 p-3">
              <Wand2 className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auto-Corrigidos</p>
              <p className="text-2xl font-bold">
                {stats.correctedRate}% <span className="text-sm font-normal text-muted-foreground">({stats.corrected})</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="rounded-lg bg-purple-100 p-3">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Média Diária</p>
              <p className="text-2xl font-bold">{stats.avgDaily}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart - By Source */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.bySource.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={stats.bySource}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.bySource.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - By Day */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.byDay.some(d => d.success > 0 || d.error > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.byDay}>
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="success" fill="#22C55E" name="Sucesso" stackId="a" />
                  <Bar dataKey="error" fill="#EF4444" name="Erro" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Sources */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Fontes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.bySource.slice(0, 5).map((source, index) => (
                <div key={source.name} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{index + 1}.</span>
                    <Badge style={{ backgroundColor: source.color }} className="text-white">
                      {source.name}
                    </Badge>
                  </div>
                  <span className="font-medium">{source.count}</span>
                </div>
              ))}
              {stats.bySource.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Nenhuma fonte registrada</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* By Type */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Por Tipo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.byType.map((type) => (
                <div key={type.type} className="flex items-center justify-between rounded-lg border p-2">
                  <div className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span className="capitalize">{type.type}</span>
                  </div>
                  <span className="font-medium">{type.count}</span>
                </div>
              ))}
              {stats.byType.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">Nenhum tipo registrado</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
