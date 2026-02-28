/**
 * Guia Comercial - Advertiser Dashboard
 * Enhanced panel with real analytics charts
 */

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMyBusinesses, useBusinessLeads, useBusinessClickHistory } from "@/hooks/useGuiaComercial";
import { PLAN_LABELS, PLAN_COLORS, getBusinessUrl, type Business } from "@/types/guia-comercial";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Building2, Eye, MessageCircle, Phone, Globe, Users,
  TrendingUp, TrendingDown, Plus, Settings, BarChart3, Star,
  BadgeCheck, ChevronRight, ArrowUpRight, Calendar, Target,
} from "lucide-react";

export default function GuiaAnuncianteDashboard() {
  const [period, setPeriod] = useState(30);
  const { data: businesses, isLoading: loadingBusinesses } = useMyBusinesses();
  const { data: leads, isLoading: loadingLeads } = useBusinessLeads();

  const businessIds = useMemo(() => businesses?.map(b => b.id) ?? [], [businesses]);
  const { data: clickHistory } = useBusinessClickHistory(businessIds, period);

  const totalStats = useMemo(() => {
    if (!businesses?.length) return { views: 0, whatsapp: 0, phone: 0, website: 0, leads: 0 };
    return businesses.reduce(
      (acc, b) => ({
        views: acc.views + b.views_count,
        whatsapp: acc.whatsapp + b.whatsapp_clicks,
        phone: acc.phone + b.phone_clicks,
        website: acc.website + b.website_clicks,
        leads: acc.leads + b.leads_count,
      }),
      { views: 0, whatsapp: 0, phone: 0, website: 0, leads: 0 }
    );
  }, [businesses]);

  const periodTotals = useMemo(() => {
    if (!clickHistory?.length) return { views: 0, whatsapp: 0, phone: 0, website: 0 };
    return clickHistory.reduce(
      (acc, d) => ({
        views: acc.views + d.views,
        whatsapp: acc.whatsapp + d.whatsapp,
        phone: acc.phone + d.phone,
        website: acc.website + d.website,
      }),
      { views: 0, whatsapp: 0, phone: 0, website: 0 }
    );
  }, [clickHistory]);

  const pieData = useMemo(() => [
    { name: "WhatsApp", value: periodTotals.whatsapp, color: "hsl(var(--chart-1))" },
    { name: "Telefone", value: periodTotals.phone, color: "hsl(var(--chart-2))" },
    { name: "Site", value: periodTotals.website, color: "hsl(var(--chart-3))" },
  ].filter(d => d.value > 0), [periodTotals]);

  const leadsByStatus = useMemo(() => {
    if (!leads?.length) return [];
    const counts: Record<string, number> = {};
    leads.forEach(l => { counts[l.status] = (counts[l.status] || 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      status: STATUS_LABELS[status] || status,
      count,
    }));
  }, [leads]);

  const recentLeads = leads?.slice(0, 5) ?? [];

  const chartData = useMemo(() => {
    return (clickHistory ?? []).map(d => ({
      ...d,
      dateLabel: new Date(d.date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    }));
  }, [clickHistory]);

  if (loadingBusinesses) return <DashboardSkeleton />;
  if (!businesses?.length) return <EmptyState />;

  return (
    <>
      <Helmet>
        <title>Painel do Empresário | Guia Comercial</title>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Painel do Empresário</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie suas empresas e acompanhe resultados em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={String(period)} onValueChange={(v) => setPeriod(Number(v))}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 dias</SelectItem>
                <SelectItem value="15">15 dias</SelectItem>
                <SelectItem value="30">30 dias</SelectItem>
                <SelectItem value="90">90 dias</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild>
              <Link to="/voce-no-google/cadastro">
                <Plus className="h-4 w-4 mr-2" />
                Nova Empresa
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard icon={Eye} label="Visualizações" value={totalStats.views} periodValue={periodTotals.views} />
          <StatCard icon={MessageCircle} label="WhatsApp" value={totalStats.whatsapp} periodValue={periodTotals.whatsapp} color="text-green-600" />
          <StatCard icon={Phone} label="Telefone" value={totalStats.phone} periodValue={periodTotals.phone} color="text-blue-600" />
          <StatCard icon={Globe} label="Site" value={totalStats.website} periodValue={periodTotals.website} color="text-purple-600" />
          <StatCard icon={Users} label="Leads" value={totalStats.leads} periodValue={leads?.length ?? 0} highlight />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-2" />
              Estatísticas
            </TabsTrigger>
            <TabsTrigger value="businesses">
              <Building2 className="h-4 w-4 mr-2" />
              Empresas ({businesses.length})
            </TabsTrigger>
            <TabsTrigger value="leads">
              <Users className="h-4 w-4 mr-2" />
              Leads
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Views Over Time */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Visualizações por Dia</CardTitle>
                  <CardDescription>Acompanhe o tráfego nos últimos {period} dias</CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#viewsGrad)" strokeWidth={2} name="Visualizações" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[280px] text-muted-foreground">
                      Sem dados no período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Clicks Breakdown Pie */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Canais de Contato</CardTitle>
                  <CardDescription>Distribuição de cliques</CardDescription>
                </CardHeader>
                <CardContent>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" nameKey="name">
                          {pieData.map((entry, idx) => (
                            <Cell key={idx} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-[280px] text-muted-foreground text-sm">
                      Sem cliques no período
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Clicks Stacked Bar */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Interações por Dia</CardTitle>
                <CardDescription>WhatsApp, Telefone e Site combinados</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="dateLabel" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                      <Legend />
                      <Bar dataKey="whatsapp" stackId="a" fill="hsl(var(--chart-1))" name="WhatsApp" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="phone" stackId="a" fill="hsl(var(--chart-2))" name="Telefone" />
                      <Bar dataKey="website" stackId="a" fill="hsl(var(--chart-3))" name="Site" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                    Sem dados no período
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leads Funnel */}
            {leadsByStatus.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Funil de Leads</CardTitle>
                  <CardDescription>Status dos seus leads</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={leadsByStatus} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                      <YAxis dataKey="status" type="category" width={100} tick={{ fontSize: 12 }} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} name="Quantidade" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Businesses Tab */}
          <TabsContent value="businesses" className="space-y-4">
            {businesses.map((business) => (
              <BusinessOverviewCard key={business.id} business={business} />
            ))}
          </TabsContent>

          {/* Leads Tab */}
          <TabsContent value="leads">
            <Card>
              <CardHeader>
                <CardTitle>Leads Recentes</CardTitle>
                <CardDescription>Últimas solicitações de contato recebidas</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeads ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : recentLeads.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Nenhum lead recebido ainda</p>
                    <p className="text-xs text-muted-foreground mt-1">Leads aparecerão aqui quando clientes entrarem em contato</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium truncate">{lead.name}</p>
                          <p className="text-sm text-muted-foreground truncate">{lead.service_needed || "Solicitação geral"}</p>
                          {lead.phone && <p className="text-xs text-muted-foreground">{lead.phone}</p>}
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <Badge variant={lead.status === 'new' ? 'default' : lead.status === 'converted' ? 'secondary' : 'outline'}>
                            {STATUS_LABELS[lead.status] || lead.status}
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
        </Tabs>
      </div>
    </>
  );
}

// ========================
// CONSTANTS
// ========================

const STATUS_LABELS: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  negotiating: "Negociando",
  converted: "Convertido",
  lost: "Perdido",
};

// ========================
// SUB-COMPONENTS
// ========================

function StatCard({
  icon: Icon,
  label,
  value,
  periodValue,
  highlight,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  periodValue?: number;
  highlight?: boolean;
  color?: string;
}) {
  return (
    <Card className={highlight ? 'border-primary/50 bg-primary/5 dark:bg-primary/10' : 'hover:shadow-sm transition-shadow'}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-md ${highlight ? 'bg-primary/10' : 'bg-muted'}`}>
            <Icon className={`h-4 w-4 ${color || (highlight ? 'text-primary' : 'text-muted-foreground')}`} />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{value.toLocaleString('pt-BR')}</p>
        {periodValue !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {periodValue.toLocaleString('pt-BR')} no período
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function BusinessOverviewCard({ business }: { business: Business }) {
  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
            {business.logo_url ? (
              <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <Building2 className="h-7 w-7 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-semibold">{business.name}</h3>
              {business.verification_status === 'verified' && (
                <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
              )}
              <Badge className={PLAN_COLORS[business.plan]} variant="outline">
                {PLAN_LABELS[business.plan]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              {business.category_main} • {business.city}
            </p>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                {business.views_count.toLocaleString('pt-BR')}
              </span>
              <span className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-500" />
                {business.avg_rating.toFixed(1)} ({business.review_count})
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                {business.leads_count} leads
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                {business.whatsapp_clicks} WhatsApp
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
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
    <div className="container mx-auto px-4 py-20">
      <div className="max-w-md mx-auto text-center">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Building2 className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Bem-vindo ao Painel!</h1>
        <p className="text-muted-foreground mb-8">
          Cadastre sua primeira empresa e comece a acompanhar visualizações, leads e contatos.
        </p>
        <Button size="lg" asChild>
          <Link to="/voce-no-google/cadastro">
            <Plus className="h-5 w-5 mr-2" />
            Cadastrar Minha Empresa
          </Link>
        </Button>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Skeleton className="h-9 w-56 mb-2" />
      <Skeleton className="h-5 w-80 mb-8" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}
      </div>
      <Skeleton className="h-10 w-96 mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-80 rounded-lg" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    </div>
  );
}
