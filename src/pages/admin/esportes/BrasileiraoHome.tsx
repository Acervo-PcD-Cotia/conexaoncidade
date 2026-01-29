import { Trophy, ArrowLeft, Table2, Calendar, TrendingUp } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BrasileiraoHome() {
  const [searchParams] = useSearchParams();
  const serie = searchParams.get("serie") || "a";

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
            <Trophy className="h-6 w-6 text-primary" />
            Campeonato Brasileiro
          </h1>
          <p className="text-muted-foreground mt-1">
            Série {serie.toUpperCase()} • Temporada 2026
          </p>
        </div>
      </header>

      <Tabs defaultValue={serie} className="w-full">
        <TabsList>
          <TabsTrigger value="a" asChild>
            <Link to="/admin/esportes/brasileirao?serie=a">Série A</Link>
          </TabsTrigger>
          <TabsTrigger value="b" asChild>
            <Link to="/admin/esportes/brasileirao?serie=b">Série B</Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={serie} className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tabela de Classificação */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Table2 className="h-5 w-5 text-primary" />
                  Classificação
                </CardTitle>
                <CardDescription>
                  Tabela atualizada do campeonato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="p-4 rounded-full bg-muted mb-4">
                    <Table2 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground">Tabela não disponível</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                    Configure a integração com a API de futebol para exibir a classificação
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Próximos Jogos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próxima Rodada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="p-3 rounded-full bg-muted mb-3">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nenhum jogo agendado
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Estatísticas */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Estatísticas da Série {serie.toUpperCase()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">20</p>
                  <p className="text-sm text-muted-foreground">Times</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">38</p>
                  <p className="text-sm text-muted-foreground">Rodadas</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Jogos</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">0</p>
                  <p className="text-sm text-muted-foreground">Gols</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">--</p>
                  <p className="text-sm text-muted-foreground">Artilheiro</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
