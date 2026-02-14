import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCensoPcd, TIPOS_DEFICIENCIA, PRIORIDADES } from "@/hooks/useCensoPcd";
import { downloadCensoPcdExecutiveReport } from "@/lib/censoPcdReport";
import { 
  Users, 
  MapPin, 
  HeartPulse, 
  Download, 
  FileSpreadsheet,
  Brain,
  TrendingUp,
  Calendar
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart,
  Line,
  CartesianGrid
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

const getDeficienciaLabel = (value: string) => {
  return TIPOS_DEFICIENCIA.find(t => t.value === value)?.label || value;
};

const getPrioridadeLabel = (value: string) => {
  return PRIORIDADES.find(p => p.value === value)?.label || value;
};

export default function CensoPcdDashboard() {
  const { responses, stats, isLoadingResponses, isLoadingStats } = useCensoPcd();

  const handleExportCSV = () => {
    if (!responses) return;
    
    const headers = ['Nome', 'Data Nascimento', 'Bairro', 'Tipo Deficiência', 'Maior Necessidade', 'Data Resposta'];
    const rows = responses.map(r => [
      r.nome_completo || 'Anônimo',
      r.data_nascimento || '',
      r.bairro || '',
      r.tipos_deficiencia?.map(getDeficienciaLabel).join(', ') || '',
      getPrioridadeLabel(r.maior_necessidade),
      r.created_at ? format(new Date(r.created_at), 'dd/MM/yyyy HH:mm') : ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `censo-pcd-cotia-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPDF = () => {
    if (stats) {
      downloadCensoPcdExecutiveReport(stats);
    }
  };

  // Calculate KPIs
  const totalResponses = responses?.length || 0;
  const today = startOfDay(new Date());
  const todayResponses = responses?.filter(r => r.created_at && isSameDay(new Date(r.created_at), today)).length || 0;
  const last7Days = responses?.filter(r => r.created_at && new Date(r.created_at) >= subDays(today, 7)).length || 0;
  const uniqueBairros = new Set(responses?.map(r => r.bairro).filter(Boolean)).size;
  const teaCount = responses?.filter(r => r.tipos_deficiencia?.includes('tea')).length || 0;
  const ebookDownloads = responses?.filter(r => r.ebook_downloaded).length || 0;

  // Prepare chart data
  const deficiencyData = stats?.deficiencias?.map(item => ({
    name: getDeficienciaLabel(item.tipo).length > 15 ? getDeficienciaLabel(item.tipo).substring(0, 15) + '...' : getDeficienciaLabel(item.tipo),
    value: item.count,
    fullName: getDeficienciaLabel(item.tipo)
  })) || [];

  const bairroData = stats?.bairros?.slice(0, 10).map(item => ({
    name: item.bairro.length > 12 ? item.bairro.substring(0, 12) + '...' : item.bairro,
    respostas: item.count,
    fullName: item.bairro
  })) || [];

  const prioridadeData = stats?.prioridades?.map(item => ({
    name: getPrioridadeLabel(item.prioridade).length > 20 ? getPrioridadeLabel(item.prioridade).substring(0, 20) + '...' : getPrioridadeLabel(item.prioridade),
    votos: item.count,
    fullName: getPrioridadeLabel(item.prioridade)
  })) || [];

  // Timeline data (last 30 days)
  const timelineData = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(today, i);
    const count = responses?.filter(r => r.created_at && isSameDay(new Date(r.created_at), date)).length || 0;
    timelineData.push({
      date: format(date, 'dd/MM'),
      respostas: count
    });
  }

  if (isLoadingResponses || isLoadingStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Censo PcD Cotia</h1>
          <p className="text-muted-foreground">Dashboard de acompanhamento do censo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="mr-2 h-4 w-4" />
            Relatório PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Respostas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">
              +{todayResponses} hoje · +{last7Days} última semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bairros Mapeados</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueBairros}</div>
            <p className="text-xs text-muted-foreground">
              de ~50 bairros em Cotia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">TEA Identificados</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teaCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalResponses > 0 ? ((teaCount / totalResponses) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Downloads eBook</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ebookDownloads}</div>
            <p className="text-xs text-muted-foreground">
              {totalResponses > 0 ? ((ebookDownloads / totalResponses) * 100).toFixed(1) : 0}% taxa de download
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pie Chart - Tipos de Deficiência */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Tipo de Deficiência</CardTitle>
          </CardHeader>
          <CardContent>
            {deficiencyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deficiencyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deficiencyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, _, props) => [value, props.payload.fullName]} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Top Bairros */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Top 10 Bairros por Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            {bairroData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bairroData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip formatter={(value, _, props) => [value, props.payload.fullName]} />
                  <Bar dataKey="respostas" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Bar Chart - Prioridades */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Prioridades Declaradas</CardTitle>
          </CardHeader>
          <CardContent>
            {prioridadeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={prioridadeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value, _, props) => [value, props.payload.fullName]} />
                  <Bar dataKey="votos" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Chart - Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Respostas nos Últimos 30 Dias</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="respostas" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link to="/spah/painel/censo-pcd/respostas">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Ver Todas as Respostas
            </Button>
          </Link>
          <Link to="/censo-pcd">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Página Pública
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
