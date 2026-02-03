/**
 * Guia Comercial - Advertiser Dashboard
 * Main panel for business owners to manage their listings
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useMyBusinesses, useBusinessLeads } from "@/hooks/useGuiaComercial";
import { PLAN_LABELS, PLAN_COLORS, getBusinessUrl, type Business } from "@/types/guia-comercial";
import {
  Building2,
  Eye,
  MessageCircle,
  Phone,
  Globe,
  Users,
  TrendingUp,
  Plus,
  Settings,
  BarChart3,
  Star,
  BadgeCheck,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function GuiaAnuncianteDashboard() {
  const { data: businesses, isLoading: loadingBusinesses } = useMyBusinesses();
  const { data: leads, isLoading: loadingLeads } = useBusinessLeads();

  const totalStats = businesses?.reduce(
    (acc, b) => ({
      views: acc.views + b.views_count,
      whatsapp: acc.whatsapp + b.whatsapp_clicks,
      phone: acc.phone + b.phone_clicks,
      website: acc.website + b.website_clicks,
      leads: acc.leads + b.leads_count,
    }),
    { views: 0, whatsapp: 0, phone: 0, website: 0, leads: 0 }
  ) ?? { views: 0, whatsapp: 0, phone: 0, website: 0, leads: 0 };

  const recentLeads = leads?.slice(0, 5) ?? [];

  if (loadingBusinesses) {
    return <DashboardSkeleton />;
  }

  if (!businesses?.length) {
    return <EmptyState />;
  }

  return (
    <>
      <Helmet>
        <title>Painel do Anunciante | Guia Comercial</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Painel do Anunciante</h1>
            <p className="text-muted-foreground">Gerencie suas empresas e acompanhe os resultados</p>
          </div>
          <Button asChild>
            <Link to="/guia/cadastrar">
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Link>
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={Eye}
            label="Visualizações"
            value={totalStats.views}
            trend="+12%"
          />
          <StatCard
            icon={MessageCircle}
            label="Cliques WhatsApp"
            value={totalStats.whatsapp}
            trend="+8%"
          />
          <StatCard
            icon={Phone}
            label="Cliques Telefone"
            value={totalStats.phone}
            trend="+5%"
          />
          <StatCard
            icon={Globe}
            label="Cliques Site"
            value={totalStats.website}
            trend="+3%"
          />
          <StatCard
            icon={Users}
            label="Total de Leads"
            value={totalStats.leads}
            trend="+15%"
            highlight
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="businesses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="businesses">
              <Building2 className="h-4 w-4 mr-2" />
              Minhas Empresas ({businesses.length})
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Users className="h-4 w-4 mr-2" />
              Leads Recentes
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="space-y-4">
            {businesses.map((business) => (
              <BusinessOverviewCard key={business.id} business={business} />
            ))}
          </TabsContent>

          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Leads Recentes</CardTitle>
                <CardDescription>
                  Últimas solicitações de contato recebidas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeads ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : recentLeads.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">
                    Nenhum lead recebido ainda
                  </p>
                ) : (
                  <div className="space-y-4">
                    {recentLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{lead.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.service_needed || "Solicitação geral"}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={lead.status === 'new' ? 'default' : 'secondary'}>
                            {lead.status === 'new' ? 'Novo' : lead.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    ))}

                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/guia/anunciante/leads">
                        Ver todos os leads
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Performance</CardTitle>
                <CardDescription>
                  Acompanhe o desempenho das suas empresas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Gráficos detalhados em breve!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

// ========================
// COMPONENTS
// ========================

function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  trend?: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? 'border-primary bg-primary/5' : ''}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={`h-4 w-4 ${highlight ? 'text-primary' : 'text-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground">{label}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{value.toLocaleString('pt-BR')}</span>
          {trend && (
            <span className="text-xs text-green-600 flex items-center">
              <TrendingUp className="h-3 w-3 mr-0.5" />
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BusinessOverviewCard({ business }: { business: Business }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Logo */}
          <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {business.logo_url ? (
              <img
                src={business.logo_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">{business.name}</h3>
              {business.verification_status === 'verified' && (
                <BadgeCheck className="h-4 w-4 text-primary" />
              )}
              <Badge className={PLAN_COLORS[business.plan]}>
                {PLAN_LABELS[business.plan]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              {business.category_main} • {business.city}
            </p>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4 text-muted-foreground" />
                {business.views_count} views
              </span>
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-400" />
                {business.avg_rating.toFixed(1)} ({business.review_count})
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                {business.leads_count} leads
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to={`/guia/anunciante/editar/${business.id}`}>
                <Settings className="h-4 w-4 mr-1" />
                Editar
              </Link>
            </Button>
            <Button size="sm" variant="ghost" asChild>
              <a href={getBusinessUrl(business)} target="_blank" rel="noopener noreferrer">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Ver Perfil
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Guia Comercial!</h1>
        <p className="text-muted-foreground mb-8">
          Você ainda não tem nenhuma empresa cadastrada. 
          Comece agora e aumente sua visibilidade online!
        </p>
        <Button size="lg" asChild>
          <Link to="/guia/cadastrar">
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Minha Empresa
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Skeleton className="h-8 w-48 mb-2" />
      <Skeleton className="h-4 w-72 mb-8" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>

      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
