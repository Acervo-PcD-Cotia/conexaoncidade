import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Play, Radio, Tv, Clock, Calendar, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useArchivedBroadcasts } from "@/hooks/useBroadcast";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BroadcastArchive() {
  const [channelType, setChannelType] = useState<"all" | "tv" | "radio">("all");
  
  const { data: broadcasts, isLoading } = useArchivedBroadcasts(
    channelType === "all" ? undefined : channelType,
    50
  );

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return null;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h${remainingMinutes > 0 ? ` ${remainingMinutes}min` : ""}`;
  };

  return (
    <>
      <Helmet>
        <title>Arquivo | Conexão Ao Vivo</title>
        <meta name="description" content="Reveja transmissões anteriores da nossa Web TV e Web Rádio" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="container max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/ao-vivo">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Arquivo de Transmissões</h1>
                <p className="text-muted-foreground">Reveja transmissões anteriores</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <Tabs value={channelType} onValueChange={(v) => setChannelType(v as typeof channelType)}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="tv">
                <Tv className="w-4 h-4 mr-2" />
                Web TV
              </TabsTrigger>
              <TabsTrigger value="radio">
                <Radio className="w-4 h-4 mr-2" />
                Web Rádio
              </TabsTrigger>
            </TabsList>

            <TabsContent value={channelType}>
              {isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : broadcasts?.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-muted-foreground mb-4">
                    Nenhuma transmissão arquivada encontrada
                  </p>
                  <Button asChild>
                    <Link to="/ao-vivo">Ver Transmissões ao Vivo</Link>
                  </Button>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {broadcasts?.map((broadcast) => (
                    <Card key={broadcast.id} className="overflow-hidden group">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-muted">
                        {broadcast.thumbnail_url ? (
                          <img
                            src={broadcast.thumbnail_url}
                            alt={broadcast.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            {broadcast.channel?.type === "radio" ? (
                              <Radio className="w-12 h-12 text-primary/50" />
                            ) : (
                              <Tv className="w-12 h-12 text-primary/50" />
                            )}
                          </div>
                        )}

                        {/* Play Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="w-6 h-6 text-primary ml-1" />
                          </div>
                        </div>

                        {/* Duration Badge */}
                        {broadcast.actual_start && broadcast.actual_end && (
                          <Badge
                            variant="secondary"
                            className="absolute bottom-2 right-2 bg-black/70 text-white"
                          >
                            {formatDuration(broadcast.actual_start, broadcast.actual_end)}
                          </Badge>
                        )}

                        {/* Type Badge */}
                        <Badge
                          variant="outline"
                          className="absolute top-2 left-2 bg-black/50 text-white border-0"
                        >
                          {broadcast.channel?.type === "radio" ? (
                            <>
                              <Radio className="w-3 h-3 mr-1" />
                              Rádio
                            </>
                          ) : (
                            <>
                              <Tv className="w-3 h-3 mr-1" />
                              TV
                            </>
                          )}
                        </Badge>
                      </div>

                      <CardContent className="p-4">
                        <h3 className="font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          <Link to={`/ao-vivo/${broadcast.slug}`}>{broadcast.title}</Link>
                        </h3>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          {broadcast.channel && (
                            <span>{broadcast.channel.name}</span>
                          )}
                          {broadcast.actual_end && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(broadcast.actual_end), "dd/MM/yyyy", {
                                locale: ptBR,
                              })}
                            </span>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="flex-1" asChild>
                            <Link to={`/ao-vivo/${broadcast.slug}`}>
                              <Play className="w-4 h-4 mr-1" />
                              Assistir
                            </Link>
                          </Button>
                          {broadcast.podcast_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={broadcast.podcast_url} target="_blank" rel="noreferrer">
                                <Headphones className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
