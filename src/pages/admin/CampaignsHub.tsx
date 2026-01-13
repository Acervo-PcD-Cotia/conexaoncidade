import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Users,
  TrendingUp,
  DollarSign,
  Plus,
  ArrowRight,
  Calendar,
  Target,
} from 'lucide-react';
import { AdminLoadingState } from '@/components/admin/AdminLoadingState';

export default function CampaignsHub() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['campaigns-stats'],
    queryFn: async () => {
      const [googleMapsLeads, bannerCampaigns] = await Promise.all([
        supabase.from('campaign_leads').select('id', { count: 'exact', head: true }),
        supabase.from('banner_campaigns').select('id, status, budget_total, budget_spent'),
      ]);

      const activeBannerCampaigns = bannerCampaigns.data?.filter(c => c.status === 'active') || [];
      const totalBudget = bannerCampaigns.data?.reduce((acc, c) => acc + (c.budget_total || 0), 0) || 0;
      const totalSpent = bannerCampaigns.data?.reduce((acc, c) => acc + (c.budget_spent || 0), 0) || 0;

      return {
        googleMapsLeads: googleMapsLeads.count || 0,
        bannerCampaignsTotal: bannerCampaigns.data?.length || 0,
        bannerCampaignsActive: activeBannerCampaigns.length,
        totalBudget,
        totalSpent,
      };
    },
  });

  const campaigns = [
    {
      id: 'google-maps',
      title: 'Google Maps para Negócios',
      description: 'Ajude empresas locais a aparecer no Google Maps com avaliações 5 estrelas',
      icon: MapPin,
      color: 'text-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      href: '/admin/campaigns/google-maps',
      stats: [
        { label: 'Leads', value: stats?.googleMapsLeads || 0 },
      ],
      status: 'active',
    },
    {
      id: 'banners',
      title: 'Campanhas de Banners',
      description: 'Gerencie campanhas publicitárias com banners no portal',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      href: '/admin/banners',
      stats: [
        { label: 'Ativas', value: stats?.bannerCampaignsActive || 0 },
        { label: 'Total', value: stats?.bannerCampaignsTotal || 0 },
      ],
      status: 'active',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Hub de Campanhas</h1>
          <p className="text-muted-foreground">
            Gerencie todas as campanhas de marketing e publicidade
          </p>
        </div>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Nova Campanha
        </Button>
      </div>

      {/* Summary Stats */}
      <AdminLoadingState isLoading={isLoading}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.googleMapsLeads || 0}</div>
              <p className="text-xs text-muted-foreground">Todas as campanhas</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Campanhas Ativas</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.bannerCampaignsActive || 0) + 1}
              </div>
              <p className="text-xs text-muted-foreground">Em execução</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalBudget || 0)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Gasto Total</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats?.totalSpent || 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLoadingState>

      {/* Campaign Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => {
          const Icon = campaign.icon;
          return (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${campaign.bgColor}`}>
                    <Icon className={`h-6 w-6 ${campaign.color}`} />
                  </div>
                  <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                    {campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                  </Badge>
                </div>
                <CardTitle className="mt-4">{campaign.title}</CardTitle>
                <CardDescription>{campaign.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    {campaign.stats.map((stat, idx) => (
                      <div key={idx} className="text-center">
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                  <Button asChild>
                    <Link to={campaign.href}>
                      Gerenciar
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/campanha/google-maps">
                <MapPin className="mr-2 h-4 w-4" />
                Ver Página Pública Google Maps
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/banners">
                <Target className="mr-2 h-4 w-4" />
                Gerenciar Banners
              </Link>
            </Button>
            <Button variant="outline" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Exportar Leads
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
