import { BarChart3, ArrowLeft, TrendingUp, Eye, Newspaper } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EsportesEstatisticas() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link to="/admin/esportes">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Estatísticas de Esportes
          </h1>
          <p className="text-muted-foreground mt-1">
            Métricas de desempenho do módulo de esportes
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              Notícias Esportivas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground mt-1">Total publicadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visualizações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">0</p>
            <p className="text-sm text-muted-foreground mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">--</p>
            <p className="text-sm text-muted-foreground mt-1">Taxa média</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Gráfico de Performance</CardTitle>
          <CardDescription>
            Visualizações e engajamento ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground">Dados insuficientes</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Publique mais conteúdo de esportes para gerar estatísticas
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
