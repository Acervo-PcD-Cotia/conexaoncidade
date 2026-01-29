import { Helmet } from "react-helmet-async";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Calendar, Trophy, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamBadge } from "@/components/esportes/TeamBadge";
import { MatchCard } from "@/components/esportes/MatchCard";
import { useTeamBySlug, useTeamMatches } from "@/hooks/useFootball";

export default function TeamDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: team, isLoading: loadingTeam, error } = useTeamBySlug(slug);
  const { data: matches, isLoading: loadingMatches } = useTeamMatches(team?.id, 10);

  if (loadingTeam) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Time não encontrado</h1>
        <Button asChild>
          <Link to="/esportes/brasileirao">Voltar ao Brasileirão</Link>
        </Button>
      </div>
    );
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    "name": team.name,
    "sport": "Soccer",
    "logo": team.logo_url,
    "location": {
      "@type": "Place",
      "name": team.stadium_name,
      "address": team.stadium_city
    }
  };

  return (
    <>
      <Helmet>
        <title>{team.name} | Brasileirão 2025</title>
        <meta name="description" content={`${team.name} no Campeonato Brasileiro. Veja jogos, estatísticas e informações do time.`} />
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
          <h1 className="text-2xl font-bold">Perfil do Time</h1>
        </div>

        {/* Team Card */}
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Logo */}
              <div 
                className="w-32 h-32 rounded-full flex items-center justify-center p-4"
                style={{ 
                  backgroundColor: team.primary_color ? `${team.primary_color}20` : undefined 
                }}
              >
                {team.logo_url ? (
                  <img 
                    src={team.logo_url} 
                    alt={team.name} 
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <Trophy className="h-16 w-16 text-muted-foreground" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
                {team.short_name && (
                  <p className="text-lg text-muted-foreground mb-4">{team.short_name}</p>
                )}
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  {team.stadium_city && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{team.stadium_city}</span>
                    </div>
                  )}
                  {team.stadium_name && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{team.stadium_name}</span>
                    </div>
                  )}
                  {team.founded_year && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fundado em {team.founded_year}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Colors */}
              {(team.primary_color || team.secondary_color) && (
                <div className="flex gap-2">
                  {team.primary_color && (
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: team.primary_color }}
                      title="Cor primária"
                    />
                  )}
                  {team.secondary_color && (
                    <div 
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: team.secondary_color }}
                      title="Cor secundária"
                    />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Últimos Jogos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMatches ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
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
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                <p>Nenhum jogo registrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
