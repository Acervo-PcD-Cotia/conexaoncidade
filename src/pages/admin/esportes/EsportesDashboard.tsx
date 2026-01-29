import { Trophy, Calendar, Users, Award, Settings, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GradientKpiCard } from "@/components/admin/dashboard/GradientKpiCard";

export default function EsportesDashboard() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Esportes
          </h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe resultados, jogos e estatísticas esportivas
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/admin/esportes/configurar">
            <Settings className="h-4 w-4 mr-2" />
            Configurar Módulo
          </Link>
        </Button>
      </header>

      {/* KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GradientKpiCard 
          title="Jogos Hoje" 
          value={0} 
          icon={Calendar} 
          gradient="blue"
          subtitle="Nenhum agendado"
        />
        <GradientKpiCard 
          title="Partidas Semana" 
          value={0} 
          icon={Trophy} 
          gradient="green"
          subtitle="Últimos 7 dias"
        />
        <GradientKpiCard 
          title="Times Cadastrados" 
          value={0} 
          icon={Users} 
          gradient="orange"
        />
        <GradientKpiCard 
          title="Competições" 
          value={2} 
          icon={Award} 
          gradient="purple"
          subtitle="Série A e B"
        />
      </section>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              Brasileirão
            </CardTitle>
            <CardDescription>
              Campeonato Brasileiro Série A e B
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Série A</p>
                <p className="text-sm text-muted-foreground">20 times • Temporada 2026</p>
              </div>
              <Button asChild size="sm">
                <Link to="/admin/esportes/brasileirao?serie=a">
                  Ver <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">Série B</p>
                <p className="text-sm text-muted-foreground">20 times • Temporada 2026</p>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/admin/esportes/brasileirao?serie=b">
                  Ver <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximas Partidas
            </CardTitle>
            <CardDescription>
              Jogos agendados para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground">Nenhuma partida agendada</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                Configure o módulo para sincronizar partidas automaticamente
              </p>
              <Button asChild className="mt-4">
                <Link to="/admin/esportes/configurar">
                  Configurar Agora
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Estatísticas do Módulo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Notícias Esportivas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Visualizações</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">0</p>
              <p className="text-sm text-muted-foreground">Partidas Cobertas</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">--</p>
              <p className="text-sm text-muted-foreground">API Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
