import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Eye, 
  MousePointerClick, 
  TrendingUp, 
  BarChart3,
  Smartphone,
  Monitor,
  Tablet,
  Bell,
  Mail,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCampaignUnified } from '@/hooks/useCampaignsUnified';
import { CHANNEL_LABELS, STATUS_LABELS, STATUS_COLORS } from '@/types/campaigns-unified';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, subDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe', '#00C49F', '#FFBB28'];

export default function CampaignMetrics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data: campaign, isLoading: campaignLoading } = useCampaignUnified(id);

  // Fetch campaign events for metrics
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['campaign-events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_events')
        .select('*')
        .eq('campaign_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!id,
  });

  const isLoading = campaignLoading || eventsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Campanha não encontrada</p>
        <Button variant="link" onClick={() => navigate('/spah/painel/campaigns/unified')}>
          Voltar para campanhas
        </Button>
      </div>
    );
  }

  // Calculate metrics
  const impressions = events?.filter(e => e.event_type === 'impression').length || 0;
  const clicks = events?.filter(e => e.event_type === 'click').length || 0;
  const ctaClicks = events?.filter(e => e.event_type === 'cta_click').length || 0;
  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00';

  // Group by channel
  const byChannel = (events || []).reduce((acc, event) => {
    const channel = event.channel_type;
    if (!acc[channel]) {
      acc[channel] = { impressions: 0, clicks: 0, cta_clicks: 0 };
    }
    if (event.event_type === 'impression') acc[channel].impressions++;
    if (event.event_type === 'click') acc[channel].clicks++;
    if (event.event_type === 'cta_click') acc[channel].cta_clicks++;
    return acc;
  }, {} as Record<string, { impressions: number; clicks: number; cta_clicks: number }>);

  const channelData = Object.entries(byChannel).map(([channel, data]) => ({
    name: CHANNEL_LABELS[channel as keyof typeof CHANNEL_LABELS] || channel,
    channel,
    ...data,
    ctr: data.impressions > 0 ? ((data.clicks / data.impressions) * 100).toFixed(2) : '0.00',
  }));

  // Group by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return format(date, 'yyyy-MM-dd');
  });

  const byDay = last7Days.map(day => {
    const dayEvents = (events || []).filter(e => 
      e.created_at && format(parseISO(e.created_at), 'yyyy-MM-dd') === day
    );
    return {
      date: format(parseISO(day), 'dd/MM', { locale: ptBR }),
      impressions: dayEvents.filter(e => e.event_type === 'impression').length,
      clicks: dayEvents.filter(e => e.event_type === 'click').length,
    };
  });

  // Group by device (from metadata)
  const deviceCounts = (events || []).reduce((acc, event) => {
    const metadata = event.metadata as Record<string, unknown> | null;
    const device = (metadata?.device as string) || 'unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceData = Object.entries(deviceCounts).map(([device, count]) => ({
    name: device === 'desktop' ? 'Desktop' : device === 'mobile' ? 'Mobile' : device === 'tablet' ? 'Tablet' : 'Outros',
    value: count,
  }));

  const DeviceIcon = ({ device }: { device: string }) => {
    if (device === 'Desktop') return <Monitor className="h-4 w-4" />;
    if (device === 'Mobile') return <Smartphone className="h-4 w-4" />;
    if (device === 'Tablet') return <Tablet className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/spah/painel/campaigns/unified')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{campaign.name}</h1>
          <p className="text-muted-foreground">{campaign.advertiser}</p>
        </div>
        <Badge className={STATUS_COLORS[campaign.status]}>
          {STATUS_LABELS[campaign.status]}
        </Badge>
      </div>

      {/* Main KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressões</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{impressions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de visualizações</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cliques</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total de cliques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctr}%</div>
            <p className="text-xs text-muted-foreground">Taxa de cliques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTA Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ctaClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Cliques no botão CTA</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="channels">Por Canal</TabsTrigger>
          <TabsTrigger value="devices">Por Dispositivo</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho nos Últimos 7 Dias</CardTitle>
              <CardDescription>Impressões e cliques por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={byDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="impressions" stroke="#8884d8" name="Impressões" strokeWidth={2} />
                    <Line type="monotone" dataKey="clicks" stroke="#82ca9d" name="Cliques" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Canal</CardTitle>
              <CardDescription>Comparativo entre canais ativos</CardDescription>
            </CardHeader>
            <CardContent>
              {channelData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado de canal disponível ainda
                </div>
              ) : (
                <>
                  <div className="h-[300px] mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={channelData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="impressions" fill="#8884d8" name="Impressões" />
                        <Bar dataKey="clicks" fill="#82ca9d" name="Cliques" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-2">
                    {channelData.map((channel, idx) => (
                      <div key={channel.channel} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                          <span className="font-medium">{channel.name}</span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                          <span className="text-muted-foreground">
                            {channel.impressions.toLocaleString()} imp
                          </span>
                          <span className="text-muted-foreground">
                            {channel.clicks.toLocaleString()} cliques
                          </span>
                          <Badge variant="outline">{channel.ctr}% CTR</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Dispositivo</CardTitle>
              <CardDescription>Eventos agrupados por tipo de dispositivo</CardDescription>
            </CardHeader>
            <CardContent>
              {deviceData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhum dado de dispositivo disponível ainda
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={deviceData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {deviceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="space-y-3">
                    {deviceData.map((device, idx) => (
                      <div key={device.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <DeviceIcon device={device.name} />
                          <span className="font-medium">{device.name}</span>
                        </div>
                        <span className="text-muted-foreground">
                          {device.value.toLocaleString()} eventos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
