import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, Share2, Users, Clock, Calendar, Radio, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBroadcastBySlug, useTrackViewer, useUpcomingBroadcasts } from "@/hooks/useBroadcast";
import BroadcastChat from "@/components/broadcast/BroadcastChat";
import BroadcastPlayer from "@/components/broadcast/BroadcastPlayer";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function BroadcastWatch() {
  const { slug } = useParams();
  const { data: broadcast, isLoading, error } = useBroadcastBySlug(slug);
  const { data: upcomingBroadcasts } = useUpcomingBroadcasts(5);
  const trackViewer = useTrackViewer();
  const [analyticsId, setAnalyticsId] = useState<string | null>(null);

  // Track viewer when joining
  useEffect(() => {
    if (broadcast?.status === "live" && broadcast.id) {
      const sessionId = `viewer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      trackViewer.mutateAsync({
        broadcastId: broadcast.id,
        sessionId,
        deviceType: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop",
        platform: navigator.platform,
      }).then((result) => {
        if (result?.id) {
          setAnalyticsId(result.id);
        }
      });
    }
  }, [broadcast?.id, broadcast?.status]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({
        title: broadcast?.title,
        text: `Assista ao vivo: ${broadcast?.title}`,
        url,
      });
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="aspect-video w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !broadcast) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Transmissão não encontrada</h1>
        <p className="text-muted-foreground mb-6">
          A transmissão que você procura não existe ou foi removida.
        </p>
        <Button asChild>
          <Link to="/ao-vivo">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Hub
          </Link>
        </Button>
      </div>
    );
  }

  const isLive = broadcast.status === "live";
  const isRadio = broadcast.channel?.type === "radio";

  return (
    <>
      <Helmet>
        <title>{broadcast.title} | Ao Vivo</title>
        <meta name="description" content={broadcast.description || `Assista ${broadcast.title} ao vivo`} />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b">
          <div className="container max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" asChild>
                <Link to="/ao-vivo">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar
                </Link>
              </Button>

              <div className="flex items-center gap-2">
                {isLive && (
                  <Badge variant="destructive" className="animate-pulse">
                    🔴 AO VIVO
                  </Badge>
                )}
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Video/Audio Player */}
            <div className="lg:col-span-2 space-y-4">
              {/* Player with real LiveKit integration */}
              <BroadcastPlayer
                broadcast={broadcast}
                autoConnect={isLive}
                isAudioOnly={isRadio}
                showCaptions={true}
              />

              {/* Broadcast Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold">{broadcast.title}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      {broadcast.channel && (
                        <span className="flex items-center gap-1">
                          {broadcast.channel.type === "radio" ? (
                            <Radio className="w-4 h-4" />
                          ) : (
                            <Tv className="w-4 h-4" />
                          )}
                          {broadcast.channel.name}
                        </span>
                      )}
                      {broadcast.program && (
                        <span>• {broadcast.program.name}</span>
                      )}
                    </div>
                  </div>

                  {isLive && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{broadcast.viewer_count} assistindo</span>
                    </div>
                  )}
                </div>

                {broadcast.description && (
                  <p className="text-muted-foreground">{broadcast.description}</p>
                )}

                {/* Metadata */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {broadcast.actual_start && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Iniciou{" "}
                      {formatDistanceToNow(new Date(broadcast.actual_start), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  )}
                  {broadcast.scheduled_start && broadcast.status === "scheduled" && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {format(new Date(broadcast.scheduled_start), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </span>
                  )}
                </div>
              </div>

              {/* Upcoming Broadcasts */}
              {upcomingBroadcasts && upcomingBroadcasts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Próximas Transmissões</h3>
                  <div className="space-y-2">
                    {upcomingBroadcasts.map((b) => (
                      <Link
                        key={b.id}
                        to={`/ao-vivo/${b.slug}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                      >
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                          {b.channel?.type === "radio" ? (
                            <Radio className="w-5 h-5" />
                          ) : (
                            <Tv className="w-5 h-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{b.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {b.scheduled_start &&
                              format(new Date(b.scheduled_start), "dd/MM HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Sidebar */}
            <div className="lg:col-span-1">
              {broadcast.allow_chat && (
                <BroadcastChat
                  broadcastId={broadcast.id}
                  isLive={isLive}
                  className="h-[600px] lg:h-[calc(100vh-200px)] sticky top-4"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
