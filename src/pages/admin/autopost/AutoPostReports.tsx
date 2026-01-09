import { useState } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, XCircle, AlertTriangle, Download, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Breadcrumb } from '@/components/admin/Breadcrumb';
import { useAutoPostStats, useAutoPostJobs, useAutoPostSources } from '@/hooks/useAutoPost';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

export default function AutoPostReports() {
  const [period, setPeriod] = useState('7');
  
  const { data: stats } = useAutoPostStats();
  const { data: jobs } = useAutoPostJobs();
  const { data: sources } = useAutoPostSources();

  // Mock chart data - in production, this would come from aggregated API data
  const captureData = Array.from({ length: parseInt(period) }, (_, i) => ({
    date: format(subDays(new Date(), parseInt(period) - 1 - i), 'dd/MM'),
    capturados: Math.floor(Math.random() * 50) + 10,
    publicados: Math.floor(Math.random() * 30) + 5,
    duplicados: Math.floor(Math.random() * 15),
  }));

  const sourcePerformance = sources?.slice(0, 5).map(source => ({
    name: source.name.length > 15 ? source.name.slice(0, 15) + '...' : source.name,
    capturados: source.total_items_captured || 0,
    publicados: source.total_items_published || 0,
    saude: source.health_score || 100,
  })) || [];

  const statusDistribution = [
    { name: 'Publicados', value: stats?.publishedToday || 0 },
    { name: 'Na Fila', value: stats?.inQueue || 0 },
    { name: 'Duplicados', value: stats?.duplicatesBlocked || 0 },
    { name: 'Rejeitados', value: Math.floor(Math.random() * 10) },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios e Métricas</h1>
          <p className="text-muted-foreground">Análise de performance do sistema de automação</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" /> Taxa de Aproveitamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.capturedToday && stats.publishedToday
                ? `${Math.round((stats.publishedToday / stats.capturedToday) * 100)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">Publicados / Capturados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" /> Tempo Médio Processamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avgProcessingTime || '2.5 min'}
            </div>
            <p className="text-xs text-muted-foreground">Da captura à fila</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" /> Fontes Saudáveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sources?.filter(s => (s.health_score || 100) >= 80).length || 0}
              <span className="text-sm font-normal text-muted-foreground">
                {' / '}{sources?.length || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Saúde &gt; 80%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" /> Duplicados Bloqueados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.duplicatesBlocked || 0}
            </div>
            <p className="text-xs text-muted-foreground">Nos últimos {period} dias</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
          <TabsTrigger value="sources">Por Fonte</TabsTrigger>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Volume de Captura e Publicação</CardTitle>
              <CardDescription>Evolução diária nos últimos {period} dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={captureData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="capturados" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      name="Capturados"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="publicados" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Publicados"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="duplicados" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Duplicados"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Performance por Fonte</CardTitle>
              <CardDescription>Top 5 fontes por volume de captura</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourcePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis dataKey="name" type="category" width={120} className="text-xs" />
                    <Tooltip />
                    <Bar dataKey="capturados" fill="#6366f1" name="Capturados" />
                    <Bar dataKey="publicados" fill="#10b981" name="Publicados" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
                <CardDescription>Proporção de itens por status final</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimos Jobs de Captura</CardTitle>
                <CardDescription>Status das últimas execuções</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {jobs?.slice(0, 6).map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        {job.status === 'success' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : job.status === 'failed' ? (
                          <XCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">{job.source_id}</p>
                          <p className="text-xs text-muted-foreground">
                            {job.items_found || 0} encontrados, {job.items_new || 0} novos
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(job.created_at || ''), "HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}