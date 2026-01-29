import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { Trophy, Calendar, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompetitionHeader } from "@/components/esportes/CompetitionHeader";
import { StandingsTable } from "@/components/esportes/StandingsTable";
import { MatchCard } from "@/components/esportes/MatchCard";
import { RoundSelector } from "@/components/esportes/RoundSelector";
import { useStandings, useRoundMatches, useCurrentRound, useCompetitionByType } from "@/hooks/useFootball";
import { getSerieFromSlug } from "@/types/football";
import { useState, useEffect } from "react";

export default function SerieDetailPage() {
  const { serie = "serie-a" } = useParams<{ serie: string }>();
  const isSerieA = serie === "serie-a";
  const serieName = isSerieA ? "Série A" : "Série B";
  
  const { data: competition } = useCompetitionByType(serieName);
  const { data: standings, isLoading: loadingStandings } = useStandings(competition?.id);
  const { data: initialRound } = useCurrentRound(competition?.id);
  
  const [currentRound, setCurrentRound] = useState(1);
  
  useEffect(() => {
    if (initialRound) {
      setCurrentRound(initialRound);
    }
  }, [initialRound]);
  
  const { data: roundMatches, isLoading: loadingMatches } = useRoundMatches(competition?.id, currentRound);

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `Campeonato Brasileiro ${serieName} 2025`,
    "sport": "Soccer",
    "location": {
      "@type": "Country",
      "name": "Brazil"
    }
  };

  return (
    <>
      <Helmet>
        <title>Brasileirão {serieName} 2025 - Tabela e Jogos</title>
        <meta name="description" content={`Acompanhe o Campeonato Brasileiro ${serieName}. Tabela de classificação, jogos da rodada, resultados e estatísticas.`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <CompetitionHeader 
          title={`Brasileirão ${serieName}`}
          subtitle="Temporada 2025"
          currentSerie={serie as "serie-a" | "serie-b"}
          showBack
          backUrl="/esportes/brasileirao"
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Standings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Classificação
                </CardTitle>
                <CardDescription>Tabela completa do campeonato</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingStandings ? (
                  <div className="space-y-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : standings && standings.length > 0 ? (
                  <StandingsTable standings={standings} isSerieA={isSerieA} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Classificação não disponível</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Round Matches */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Jogos da Rodada
                </CardTitle>
                <div className="mt-2">
                  <RoundSelector 
                    currentRound={currentRound}
                    onRoundChange={setCurrentRound}
                  />
                </div>
              </CardHeader>
              <CardContent>
                {loadingMatches ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 w-full" />
                    ))}
                  </div>
                ) : roundMatches && roundMatches.length > 0 ? (
                  <div className="space-y-3">
                    {roundMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>Nenhum jogo nesta rodada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
