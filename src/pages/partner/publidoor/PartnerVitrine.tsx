// Home do Partner: Minha Vitrine
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, MousePointerClick, Percent, MapPin, Edit, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PartnerStatusBadge } from '@/components/partner/PartnerStatusBadge';
import { PartnerMetricsCard } from '@/components/partner/PartnerMetricsCard';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { usePartnerPublidoors, usePartnerAggregatedMetrics } from '@/hooks/usePartnerPublidoor';
import { PUBLIDOOR_TYPE_LABELS } from '@/types/publidoor';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PartnerVitrine() {
  const { advertiser } = usePartnerAuth();
  const { data: publidoors = [], isLoading } = usePartnerPublidoors(advertiser?.id);
  
  // Get the first/main publidoor
  const mainPubidoor = publidoors[0];
  const { data: metrics, isLoading: metricsLoading } = usePartnerAggregatedMetrics(mainPubidoor?.id, 7);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!mainPubidoor) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md"
        >
          <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
            <MapPin className="h-10 w-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Nenhuma Vitrine Ativa</h2>
          <p className="text-muted-foreground mb-8">
            Você ainda não possui uma presença digital ativa. Entre em contato conosco para ativar sua vitrine.
          </p>
          <Button asChild>
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
              Falar com Atendimento
            </a>
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Minha Vitrine</h1>
          <p className="text-muted-foreground">
            Acompanhe o desempenho da sua presença digital
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to="/partner/publidoor/plano">
              <RefreshCw className="h-4 w-4 mr-2" />
              Renovar
            </Link>
          </Button>
          <Button asChild>
            <Link to={`/partner/publidoor/editar/${mainPubidoor.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Editar Vitrine
            </Link>
          </Button>
        </div>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-card border border-border"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <PartnerStatusBadge status={mainPubidoor.status} />
              <span className="text-sm text-muted-foreground">
                Atualizado em {format(new Date(mainPubidoor.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            </div>
            <h2 className="text-xl font-bold">{mainPubidoor.internal_name}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                {PUBLIDOOR_TYPE_LABELS[mainPubidoor.type]}
              </span>
              {mainPubidoor.campaign && (
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {mainPubidoor.campaign.name}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <div className="text-sm text-muted-foreground mb-2">Preview</div>
            <div className="w-40 h-24 rounded-xl bg-muted overflow-hidden">
              {mainPubidoor.media_url ? (
                <img
                  src={mainPubidoor.media_url}
                  alt={mainPubidoor.internal_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Sem mídia
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <PartnerMetricsCard
          title="Visualizações"
          value={metricsLoading ? '...' : metrics?.totalImpressions.toLocaleString() || '0'}
          icon={Eye}
          description="Últimos 7 dias"
        />
        <PartnerMetricsCard
          title="Cliques"
          value={metricsLoading ? '...' : metrics?.totalClicks.toLocaleString() || '0'}
          icon={MousePointerClick}
          description="Últimos 7 dias"
        />
        <PartnerMetricsCard
          title="Taxa de Cliques"
          value={metricsLoading ? '...' : `${metrics?.ctr.toFixed(2)}%` || '0%'}
          icon={Percent}
          description="CTR dos últimos 7 dias"
        />
        <PartnerMetricsCard
          title="Tempo Médio"
          value={metricsLoading ? '...' : `${Math.round(metrics?.avgTimeOnScreen || 0)}s`}
          icon={Eye}
          description="Na tela por exibição"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link
          to="/partner/publidoor/metricas"
          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
        >
          <Eye className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold mb-2">Ver Métricas Detalhadas</h3>
          <p className="text-sm text-muted-foreground">
            Analise o desempenho por período
          </p>
        </Link>
        
        <Link
          to="/partner/publidoor/agenda"
          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
        >
          <MapPin className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold mb-2">Agenda de Exibição</h3>
          <p className="text-sm text-muted-foreground">
            Veja quando sua vitrine será exibida
          </p>
        </Link>
        
        <Link
          to="/partner/publidoor/negocio"
          className="p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-colors group"
        >
          <Edit className="h-8 w-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
          <h3 className="font-bold mb-2">Atualizar Dados</h3>
          <p className="text-sm text-muted-foreground">
            Edite as informações do seu negócio
          </p>
        </Link>
      </div>
    </div>
  );
}
