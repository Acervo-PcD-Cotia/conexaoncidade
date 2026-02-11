import { Link } from "react-router-dom";
import { Tv, Radio, ChevronRight, Users, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveBroadcasts, useChannels } from "@/hooks/useBroadcast";
import { AutoDJPlayer } from "@/components/broadcast/AutoDJPlayer";
import { useModuleEnabled } from "@/hooks/useModuleEnabled";
import { cn } from "@/lib/utils";

export function LiveBroadcastWidget() {
  const isTvEnabled = useModuleEnabled('web_tv');
  const isRadioEnabled = useModuleEnabled('web_radio');
  const { data: liveBroadcasts } = useLiveBroadcasts();
  const { data: channels } = useChannels();
  
  const tvBroadcast = liveBroadcasts?.find(b => b.channel?.type === "tv");
  const radioBroadcast = liveBroadcasts?.find(b => b.channel?.type === "radio");
  const radioChannel = channels?.find(c => c.type === "radio" && c.is_active);
  const tvChannel = channels?.find(c => c.type === "tv" && c.is_active);
  
  // If both modules disabled or no channels configured, don't show
  if ((!isTvEnabled && !isRadioEnabled) || (!radioChannel && !tvChannel)) {
    return null;
  }

  return (
    <section className="container py-6">
      <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card via-card to-primary/5">
        <div className={cn("grid gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border", isTvEnabled && isRadioEnabled ? "lg:grid-cols-2" : "lg:grid-cols-1")}>
          {/* Web TV Section */}
          {isTvEnabled && <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <Tv className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="font-bold text-lg">Web TV</h3>
                {tvBroadcast && (
                  <Badge variant="destructive" className="animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping" />
                    AO VIVO
                  </Badge>
                )}
              </div>
              {tvBroadcast && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {tvBroadcast.viewer_count || 0}
                </span>
              )}
            </div>
            
            {tvBroadcast ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  {tvBroadcast.thumbnail_url ? (
                    <img 
                      src={tvBroadcast.thumbnail_url} 
                      alt={tvBroadcast.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-500/20 to-orange-500/20">
                      <Tv className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-sm font-medium line-clamp-1 drop-shadow-lg">
                      {tvBroadcast.title}
                    </p>
                  </div>
                </div>
                <Button asChild className="w-full gap-2">
                  <Link to="/ao-vivo">
                    <Play className="h-4 w-4" />
                    Assistir Agora
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            ) : tvChannel ? (
              <div className="space-y-3">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <div className="text-center p-4">
                    <Tv className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Nenhuma transmissão ao vivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confira a programação
                    </p>
                  </div>
                </div>
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link to="/ao-vivo">
                    Ver Programação
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>}
          
          {/* Web Rádio Section */}
          {isRadioEnabled && <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Radio className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-bold text-lg">Web Rádio</h3>
                {radioBroadcast ? (
                  <Badge variant="destructive" className="animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5 animate-ping" />
                    AO VIVO
                  </Badge>
                ) : (
                  <Badge variant="secondary">24h</Badge>
                )}
              </div>
              {radioBroadcast && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {radioBroadcast.viewer_count || 0}
                </span>
              )}
            </div>
            
            {radioChannel ? (
              <div className="space-y-3">
                {/* AutoDJ Player - compact mode */}
                <AutoDJPlayer 
                  channelId={radioChannel.id}
                  channelName={radioChannel.name}
                  compact={true}
                  autoPlay={false}
                  className="bg-muted/50 rounded-lg"
                />
                
                <Button variant="outline" asChild className="w-full gap-2">
                  <Link to="/ao-vivo">
                    Abrir Player Completo
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="h-32 rounded-lg bg-muted flex items-center justify-center">
                <div className="text-center">
                  <Radio className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Web Rádio indisponível
                  </p>
                </div>
              </div>
            )}
          </div>}
        </div>
      </Card>
    </section>
  );
}
