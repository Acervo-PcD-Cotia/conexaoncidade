import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Trophy, Calendar, TrendingUp, Radio, Tv, Newspaper } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompetitionHeader } from "@/components/esportes/CompetitionHeader";
import { LiveMatchCard } from "@/components/esportes/LiveMatchCard";
import { MatchCard } from "@/components/esportes/MatchCard";
import { StandingsTable } from "@/components/esportes/StandingsTable";
import { BrasileiraoNewsSection } from "@/components/esportes/BrasileiraoNewsSection";
import { WhereToWatchSection } from "@/components/esportes/WhereToWatchSection";
import { useLiveMatches, useTodayMatches, useStandings, useCompetitionByType } from "@/hooks/useFootball";

export default function BrasileiraoPage() {
  const { data: serieACompetition } = useCompetitionByType("Série A");
  const { data: liveMatches, isLoading: loadingLive } = useLiveMatches(serieACompetition?.id);
  const { data: todayMatches, isLoading: loadingToday } = useTodayMatches(serieACompetition?.id);
  const { data: standings, isLoading: loadingStandings } = useStandings(serieACompetition?.id);

  // SEO Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    "name": "Campeonato Brasileiro",
    "sport": "Soccer",
    "description": "Acompanhe o Campeonato Brasileiro Série A e B - Tabela, jogos ao vivo, estatísticas e muito mais.",
  };

  const currentSeason = serieACompetition?.season || new Date().getFullYear();

  return (
    <>
      <Helmet>
        <title>Brasileirão {currentSeason} - Série A e B | Tabela, Jogos Ao Vivo</title>
        <meta name="description" content="Acompanhe o Campeonato Brasileiro Série A e B. Tabela atualizada, jogos ao vivo, resultados, estatísticas e artilharia." />
        <meta property="og:title" content={`Brasileirão ${currentSeason} - Série A e B`} />
        <meta property="og:description" content="Tabela, jogos ao vivo e estatísticas do Campeonato Brasileiro." />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <CompetitionHeader 
          title="Campeonato Brasileiro" 
          subtitle={`Temporada ${currentSeason} • Série A e B`}
          currentSerie="serie-a"
        />

        {/* Live Matches */}
        {loadingLive ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : liveMatches && liveMatches.length > 0 ? (
          <section>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-500 animate-pulse" />
              Jogos Ao Vivo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((match) => (
                <LiveMatchCard key={match.id} match={match} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Tabbed Content */}
        <Tabs defaultValue="tabela" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="tabela" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Tabela</span>
            </TabsTrigger>
            <TabsTrigger value="jogos" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Jogos</span>
            </TabsTrigger>
            <TabsTrigger value="noticias" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span className="hidden sm:inline">Notícias</span>
            </TabsTrigger>
            <TabsTrigger value="tv" className="flex items-center gap-2">
              <Tv className="h-4 w-4" />
              <span className="hidden sm:inline">Onde Assistir</span>
            </TabsTrigger>
          </TabsList>

          {/* Tabela Tab */}
          <TabsContent value="tabela">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Standings */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Classificação - Série A
                    </CardTitle>
                    <CardDescription>Tabela atualizada do campeonato</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loadingStandings ? (
                      <div className="space-y-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <Skeleton key={i} className="h-12 w-full" />
                        ))}
                      </div>
                    ) : standings && standings.length > 0 ? (
                      <>
                        <StandingsTable standings={standings.slice(0, 10)} isSerieA={true} compact />
                        <div className="mt-4 text-center">
                          <Button asChild variant="outline">
                            <Link to="/esportes/brasileirao/serie-a">
                              Ver Tabela Completa
                            </Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Classificação não disponível</p>
                        <p className="text-sm mt-1">Sincronize os dados para ver a tabela</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Today's Matches */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Jogos de Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingToday ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <Skeleton key={i} className="h-24 w-full" />
                        ))}
                      </div>
                    ) : todayMatches && todayMatches.length > 0 ? (
                      <div className="space-y-3">
                        {todayMatches.slice(0, 5).map((match) => (
                          <MatchCard key={match.id} match={match} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p>Nenhum jogo hoje</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Jogos Tab */}
          <TabsContent value="jogos">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Jogos de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingToday ? (
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : todayMatches && todayMatches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {todayMatches.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum jogo programado para hoje</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notícias Tab */}
          <TabsContent value="noticias">
            <BrasileiraoNewsSection />
          </TabsContent>

          {/* Onde Assistir Tab */}
          <TabsContent value="tv">
            <WhereToWatchSection />
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/esportes/brasileirao/serie-a">
              <Trophy className="h-6 w-6" />
              <span>Série A</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/esportes/brasileirao/serie-b">
              <Trophy className="h-6 w-6" />
              <span>Série B</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/esportes/brasileirao/serie-a/estatisticas/artilharia">
              <TrendingUp className="h-6 w-6" />
              <span>Artilharia</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2">
            <Link to="/esportes/brasileirao/serie-a/rodada/1">
              <Calendar className="h-6 w-6" />
              <span>Rodadas</span>
            </Link>
          </Button>
        </section>
      </div>
    </>
  );
}
