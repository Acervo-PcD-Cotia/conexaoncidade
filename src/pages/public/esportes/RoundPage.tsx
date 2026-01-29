import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchCard } from "@/components/esportes/MatchCard";
import { RoundSelector } from "@/components/esportes/RoundSelector";
import { useRoundMatches, useCompetitionByType } from "@/hooks/useFootball";
import { getSerieFromSlug } from "@/types/football";
import { useNavigate } from "react-router-dom";

export default function RoundPage() {
  const { serie = "serie-a", round = "1" } = useParams<{ serie: string; round: string }>();
  const navigate = useNavigate();
  const currentRound = parseInt(round) || 1;
  const isSerieA = serie === "serie-a";
  const serieName = isSerieA ? "Série A" : "Série B";
  
  const { data: competition } = useCompetitionByType(serieName);
  const { data: matches, isLoading } = useRoundMatches(competition?.id, currentRound);

  const handleRoundChange = (newRound: number) => {
    navigate(`/esportes/brasileirao/${serie}/rodada/${newRound}`);
  };

  return (
    <>
      <Helmet>
        <title>{currentRound}ª Rodada - Brasileirão {serieName} 2025</title>
        <meta name="description" content={`Jogos da ${currentRound}ª rodada do Campeonato Brasileiro ${serieName} 2025. Veja resultados e próximos jogos.`} />
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to={`/esportes/brasileirao/${serie}`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{currentRound}ª Rodada</h1>
              <p className="text-muted-foreground">Brasileirão {serieName} 2025</p>
            </div>
          </div>
          
          <RoundSelector 
            currentRound={currentRound}
            onRoundChange={handleRoundChange}
          />
        </div>

        {/* Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Jogos da Rodada
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-28" />
                ))}
              </div>
            ) : matches && matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum jogo encontrado nesta rodada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
