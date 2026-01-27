// Métricas simplificadas para Partners
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, MousePointerClick, Percent, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PartnerMetricsCard } from '@/components/partner/PartnerMetricsCard';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerPublidoors, usePartnerAggregatedMetrics } from '@/hooks/usePartnerPublidoor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const PERIOD_OPTIONS = [
  { label: '7 dias', value: 7 },
  { label: '15 dias', value: 15 },
  { label: '30 dias', value: 30 },
];

export default function PartnerMetrics() {
  const [period, setPeriod] = useState(7);
  const { advertiser } = usePartnerAuth();
  const { data: publidoors = [], isLoading: loadingPublidoors } = usePartnerPublidoors(advertiser?.id);
  
  const mainPublidoor = publidoors[0];
  const { data: aggregated, isLoading: loadingMetrics, metrics } = usePartnerAggregatedMetrics(mainPublidoor?.id, period);
  
  const isLoading = loadingPublidoors || loadingMetrics;

  // Format chart data
  const chartData = metrics.map((m) => ({
    date: format(parseISO(m.date), 'dd/MM', { locale: ptBR }),
    visualizacoes: m.impressions,
    cliques: m.clicks,
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!mainPublidoor) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Nenhuma métrica disponível</h2>
        <p className="text-muted-foreground">
          Você precisa ter uma vitrine ativa para ver as métricas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Métricas</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho da sua vitrine digital
          </p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {PERIOD_OPTIONS.map((option) => (
            <Button
              key={option.value}
              variant={period === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <PartnerMetricsCard
            title="Visualizações"
            value={aggregated?.totalImpressions.toLocaleString() || '0'}
            icon={Eye}
            description={`Últimos ${period} dias`}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <PartnerMetricsCard
            title="Cliques"
            value={aggregated?.totalClicks.toLocaleString() || '0'}
            icon={MousePointerClick}
            description={`Últimos ${period} dias`}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <PartnerMetricsCard
            title="Taxa de Cliques (CTR)"
            value={`${aggregated?.ctr.toFixed(2)}%` || '0%'}
            icon={Percent}
            description="Cliques / Visualizações"
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <PartnerMetricsCard
            title="Tempo Médio"
            value={`${Math.round(aggregated?.avgTimeOnScreen || 0)}s`}
            icon={TrendingUp}
            description="Na tela por exibição"
          />
        </motion.div>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 rounded-2xl bg-card border border-border"
      >
        <h3 className="text-lg font-bold mb-6">Evolução no Período</h3>
        
        {chartData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="visualizacoes"
                  name="Visualizações"
                  stroke="hsl(25, 95%, 53%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(25, 95%, 53%)' }}
                />
                <Line
                  type="monotone"
                  dataKey="cliques"
                  name="Cliques"
                  stroke="hsl(210, 100%, 50%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(210, 100%, 50%)' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <p className="text-muted-foreground">
              Sem dados suficientes para exibir o gráfico
            </p>
          </div>
        )}
      </motion.div>

      {/* Info */}
      <div className="p-4 rounded-xl bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          As métricas são atualizadas diariamente. Os dados mostrados são exclusivos da sua vitrine.
        </p>
      </div>
    </div>
  );
}
