import { useEffect, useState } from "react";
import { Radio, Volume2, Users, Music2, Loader2, Settings, ExternalLink, AlertCircle } from "lucide-react";
import { sanitizeEmbed } from "@/hooks/useSanitizedHtml";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenantContext } from "@/contexts/TenantContext";
import { sanitizeEmbedCode } from "@/lib/sanitizeEmbed";

interface StreamingConfig {
  id: string;
  embed_mode: string;
  embed_code: string | null;
  player_url: string | null;
}

export default function RadioPage() {
  const { currentTenantId } = useTenantContext();
  const [nowPlaying, setNowPlaying] = useState<{
    isOnline: boolean;
    listeners: number;
    track: string | null;
    artist: string | null;
  } | null>(null);

  // Fetch config
  const { data: config, isLoading } = useQuery({
    queryKey: ["public-radio-config", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return null;

      const { data, error } = await supabase
        .from("external_streaming_configs")
        .select("id, embed_mode, embed_code, player_url")
        .eq("tenant_id", currentTenantId)
        .eq("kind", "radio")
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as StreamingConfig | null;
    },
    enabled: !!currentTenantId,
  });

  // Fetch status
  useEffect(() => {
    if (!currentTenantId) return;

    const fetchStatus = async () => {
      try {
        const { data } = await supabase.functions.invoke("streaming-gateway/radio/status", {
          headers: { "x-tenant-id": currentTenantId },
        });

        if (data && data.kind === "radio") {
          setNowPlaying({
            isOnline: data.isOnline,
            listeners: data.listeners || 0,
            track: data.nowPlaying?.song || null,
            artist: data.nowPlaying?.artist || null,
          });
        }
      } catch (error) {
        console.error("Error fetching radio status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [currentTenantId]);

  const getPlayerHtml = () => {
    if (!config) return "";

    if (config.embed_mode === "url" && config.player_url) {
      return `<iframe src="${config.player_url}" width="100%" height="200" frameborder="0" style="border-radius: 8px;" allowfullscreen></iframe>`;
    }

    if (config.embed_code) {
      return sanitizeEmbedCode(config.embed_code);
    }

    return "";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-6 px-6 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Radio className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">Rádio não configurada</h1>
              <p className="text-muted-foreground text-sm">
                A rádio web ainda não foi configurada para este site.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/">Voltar ao Portal</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container max-w-4xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Radio className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">Rádio Web</h1>
          <p className="text-muted-foreground">
            Ouça nossa programação ao vivo
          </p>
        </div>

        {/* Now Playing Card */}
        {nowPlaying && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <Badge variant={nowPlaying.isOnline ? "default" : "secondary"} className="h-8">
                    {nowPlaying.isOnline ? (
                      <>
                        <Volume2 className="h-3 w-3 mr-1" />
                        Ao Vivo
                      </>
                    ) : (
                      "Offline"
                    )}
                  </Badge>
                  {nowPlaying.isOnline && nowPlaying.track && (
                    <div className="flex items-center gap-2 text-sm">
                      <Music2 className="h-4 w-4 text-primary" />
                      <span>
                        <span className="font-medium">{nowPlaying.track}</span>
                        {nowPlaying.artist && (
                          <span className="text-muted-foreground"> - {nowPlaying.artist}</span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
                {nowPlaying.isOnline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{nowPlaying.listeners} ouvintes</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player */}
        <Card>
          <CardContent className="p-6">
            <div
              className="w-full"
              dangerouslySetInnerHTML={{ __html: sanitizeEmbed(getPlayerHtml()) }}
            />
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Button variant="ghost" size="sm" asChild>
            <a href="/">Voltar ao Portal</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
