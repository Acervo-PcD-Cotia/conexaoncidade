import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, MapPin, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamBadge } from "@/components/esportes/TeamBadge";
import { MatchStats } from "@/components/esportes/MatchStats";
import { WhereToWatchCard } from "@/components/esportes/WhereToWatchCard";
import { useMatchBySlug } from "@/hooks/useFootball";
import { useBrBroadcastByMatch } from "@/hooks/useBrasileiraoNews";
import { getMatchStatusLabel, getStatusColor, isMatchLive, isMatchFinished } from "@/types/football";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function MatchDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: match, isLoading, error } = useMatchBySlug(slug);
  const { data: broadcast } = useBrBroadcastByMatch(match?.id || '');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Partida não encontrada</h1>
        <Button asChild>
          <Link to="/esportes/brasileirao">Voltar ao Brasileirão</Link>
        </Button>
      </div>
    );
  }

  const live = isMatchLive(match.status);
  const finished = isMatchFinished(match.status);
  const statusColors = getStatusColor(match.status);
  const matchDate = new Date(match.match_date);

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": `${match.home_team?.name} vs ${match.away_team?.name}`,
    "startDate": match.match_date,
    "location": {
      "@type": "Place",
      "name": match.venue || "Estádio"
    },
    "homeTeam": {
      "@type": "SportsTeam",
      "name": match.home_team?.name
    },
    "awayTeam": {
      "@type": "SportsTeam",
      "name": match.away_team?.name
    }
  };

  return (
    <>
      <Helmet>
        <title>{match.home_team?.name} x {match.away_team?.name} | Brasileirão</title>
        <meta name="description" content={`${match.home_team?.name} x ${match.away_team?.name} - ${match.round_name || 'Brasileirão'}. Acompanhe o resultado e estatísticas.`} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/esportes/brasileirao">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm text-muted-foreground">{match.round_name}</p>
            <div className="flex items-center gap-2">
              <Badge className={cn(statusColors.bg, statusColors.text)}>
                {live && <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
                {getMatchStatusLabel(match.status)}
              </Badge>
            </div>
          </div>
        </div>

        {/* Match Card */}
        <Card className={cn(live && "border-red-500/50")}>
          <CardContent className="py-8">
            <div className="flex items-center justify-between gap-4">
              {/* Home Team */}
              <div className="flex-1 text-center">
                <Link to={`/esportes/brasileirao/serie-a/time/${match.home_team?.slug}`}>
                  <TeamBadge 
                    name={match.home_team?.name || "Casa"} 
                    logoUrl={match.home_team?.logo_url}
                    size="lg"
                    className="justify-center mb-3"
                  />
                  <h2 className="font-bold text-lg">{match.home_team?.name}</h2>
                </Link>
              </div>

              {/* Score */}
              <div className="text-center px-8">
                {finished || live ? (
                  <div className="text-5xl font-bold tabular-nums">
                    {match.home_score ?? 0} - {match.away_score ?? 0}
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-muted-foreground">
                    vs
                  </div>
                )}
                {live && match.elapsed_time && (
                  <div className="text-red-500 font-medium mt-2 animate-pulse">
                    {match.elapsed_time}'
                  </div>
                )}
                {match.home_score_halftime != null && finished && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Intervalo: {match.home_score_halftime} - {match.away_score_halftime}
                  </div>
                )}
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                <Link to={`/esportes/brasileirao/serie-a/time/${match.away_team?.slug}`}>
                  <TeamBadge 
                    name={match.away_team?.name || "Fora"} 
                    logoUrl={match.away_team?.logo_url}
                    size="lg"
                    className="justify-center mb-3"
                  />
                  <h2 className="font-bold text-lg">{match.away_team?.name}</h2>
                </Link>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(matchDate, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}</span>
              </div>
              {match.venue && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{match.venue}{match.city && `, ${match.city}`}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Where to Watch */}
        {broadcast && (
          <WhereToWatchCard broadcast={broadcast} />
        )}

        {/* Stats - Placeholder for now */}
        <MatchStats 
          homeStats={{}} 
          awayStats={{}} 
        />
      </div>
    </>
  );
}
