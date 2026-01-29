import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayerStatsTable } from "@/components/esportes/PlayerStatsTable";
import { useTopScorers, useCompetitionByType } from "@/hooks/useFootball";

export default function TopScorersPage() {
  const { serie = "serie-a" } = useParams<{ serie: string }>();
  const isSerieA = serie === "serie-a";
  const serieName = isSerieA ? "Série A" : "Série B";
  
  const { data: competition } = useCompetitionByType(serieName);
  const { data: players, isLoading } = useTopScorers(competition?.id, 30);

  return (
    <>
      <Helmet>
        <title>Artilharia - Brasileirão {serieName} 2025</title>
        <meta name="description" content={`Artilheiros do Campeonato Brasileiro ${serieName} 2025. Ranking de goleadores, assistências e estatísticas.`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to={`/esportes/brasileirao/${serie}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              Artilharia
            </h1>
            <p className="text-muted-foreground">Brasileirão {serieName} 2025</p>
          </div>
        </div>

        {/* Top Scorers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Ranking de Goleadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : players && players.length > 0 ? (
              <PlayerStatsTable 
                players={players} 
                showAssists 
                showCards 
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Estatísticas não disponíveis</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
