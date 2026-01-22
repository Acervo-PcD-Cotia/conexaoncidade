import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Radio, Tv, Calendar, Archive, Headphones, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import BroadcastPlayer from "@/components/broadcast/BroadcastPlayer";
import BroadcastChat from "@/components/broadcast/BroadcastChat";
import { AutoDJPlayer } from "@/components/broadcast/AutoDJPlayer";
import { useLiveBroadcasts, useUpcomingBroadcasts, useChannels, Broadcast } from "@/hooks/useBroadcast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function BroadcastHub() {
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  const [activeTab, setActiveTab] = useState("tv");
  
  const { data: liveBroadcasts, isLoading: loadingLive } = useLiveBroadcasts();
  const { data: upcomingBroadcasts, isLoading: loadingUpcoming } = useUpcomingBroadcasts(5);
  const { data: channels } = useChannels();

  const tvLive = liveBroadcasts?.find((b) => b.channel?.type === "tv");
  const radioLive = liveBroadcasts?.find((b) => b.channel?.type === "radio");
  const radioChannel = channels?.find((c) => c.type === "radio" && c.is_active);
  const currentLive = activeTab === "tv" ? tvLive : radioLive;

  // Set initial selected broadcast
  if (!selectedBroadcast && currentLive) {
    setSelectedBroadcast(currentLive);
  }

  return (
    <>
      <Helmet>
        <title>Conexão Ao Vivo | Web Rádio e Web TV</title>
        <meta
          name="description"
          content="Assista às transmissões ao vivo do Portal Conexão na Cidade. Web TV e Web Rádio comunitária com programação diversificada."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Conexão Ao Vivo</h1>
          <p className="text-muted-foreground">
            Transmissões ao vivo, podcasts e programação da sua cidade
          </p>
        </div>

        {/* Main tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="tv" className="gap-2">
              <Tv className="w-4 h-4" />
              Web TV
              {tvLive && <Badge variant="destructive" className="ml-1 text-xs">LIVE</Badge>}
            </TabsTrigger>
            <TabsTrigger value="radio" className="gap-2">
              <Radio className="w-4 h-4" />
              Web Rádio
              {radioLive && <Badge variant="destructive" className="ml-1 text-xs">LIVE</Badge>}
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Programação
            </TabsTrigger>
            <TabsTrigger value="archive" className="gap-2">
              <Archive className="w-4 h-4" />
              Reprises
            </TabsTrigger>
            <TabsTrigger value="podcasts" className="gap-2">
              <Headphones className="w-4 h-4" />
              Podcasts
            </TabsTrigger>
          </TabsList>

          {/* TV Content */}
          <TabsContent value="tv" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main player */}
              <div className="lg:col-span-2 space-y-4">
                {loadingLive ? (
                  <Skeleton className="aspect-video rounded-lg" />
                ) : tvLive ? (
                  <>
                    <BroadcastPlayer broadcast={tvLive} />
                    <div>
                      <h2 className="text-xl font-semibold">{tvLive.title}</h2>
                      <p className="text-muted-foreground">
                        {tvLive.program?.name} • {tvLive.viewer_count} assistindo
                      </p>
                      {tvLive.description && (
                        <p className="mt-2 text-sm">{tvLive.description}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Tv className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Nenhuma transmissão ao vivo</h3>
                      <p className="text-muted-foreground text-center mt-2">
                        Confira a programação para saber quando teremos novidades!
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setActiveTab("schedule")}
                      >
                        Ver Programação
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Chat */}
                {tvLive && (
                  <BroadcastChat
                    broadcastId={tvLive.id}
                    isLive={true}
                    className="h-[400px]"
                  />
                )}

                {/* Upcoming */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Próximas Transmissões</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {loadingUpcoming ? (
                      [...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-16" />
                      ))
                    ) : upcomingBroadcasts?.length ? (
                      upcomingBroadcasts.map((broadcast) => (
                        <div
                          key={broadcast.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                            {broadcast.channel?.type === "radio" ? (
                              <Radio className="w-5 h-5 text-primary" />
                            ) : (
                              <Tv className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {broadcast.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {broadcast.scheduled_start &&
                                format(new Date(broadcast.scheduled_start), "dd/MM 'às' HH:mm", {
                                  locale: ptBR,
                                })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Nenhuma transmissão agendada
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Radio Content */}
          <TabsContent value="radio" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {loadingLive ? (
                  <Skeleton className="h-48 rounded-lg" />
                ) : radioLive ? (
                  <>
                    <BroadcastPlayer broadcast={radioLive} isAudioOnly />
                    <div>
                      <h2 className="text-xl font-semibold">{radioLive.title}</h2>
                      <p className="text-muted-foreground">
                        {radioLive.program?.name} • {radioLive.viewer_count} ouvindo
                      </p>
                    </div>
                  </>
                ) : radioChannel ? (
                  <AutoDJPlayer
                    channelId={radioChannel.id}
                    channelName={radioChannel.name}
                    autoPlay={false}
                  />
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                      <Radio className="w-16 h-16 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">Rádio Offline</h3>
                      <p className="text-muted-foreground text-center mt-2">
                        A programação ao vivo retorna em breve!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="space-y-6">
                {radioLive && (
                  <BroadcastChat
                    broadcastId={radioLive.id}
                    isLive={true}
                    className="h-[300px]"
                  />
                )}
              </div>
            </div>
          </TabsContent>

          {/* Schedule Content */}
          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Grade de Programação</CardTitle>
                <CardDescription>
                  Confira a programação semanal da Conexão Rádio e Conexão TV
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>A grade de programação será exibida aqui</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/ao-vivo/programacao">
                      Ver grade completa <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Archive Content */}
          <TabsContent value="archive">
            <Card>
              <CardHeader>
                <CardTitle>Reprises e Arquivo</CardTitle>
                <CardDescription>
                  Assista às transmissões anteriores quando quiser
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>O arquivo de transmissões será exibido aqui</p>
                  <Button variant="link" asChild className="mt-2">
                    <Link to="/ao-vivo/arquivo">
                      Ver arquivo completo <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Podcasts Content */}
          <TabsContent value="podcasts">
            <Card>
              <CardHeader>
                <CardTitle>Podcasts</CardTitle>
                <CardDescription>
                  Ouça os melhores momentos das nossas transmissões em formato podcast
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Os podcasts serão exibidos aqui</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
