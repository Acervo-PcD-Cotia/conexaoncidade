import { useEffect, useState } from "react";
import { Tv, Users, Loader2, Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export default function TvPage() {
  const { currentTenantId } = useTenantContext();
  const [status, setStatus] = useState<{
    isOnline: boolean;
    viewers: number;
  } | null>(null);

  // Fetch config
  const { data: config, isLoading } = useQuery({
    queryKey: ["public-tv-config", currentTenantId],
    queryFn: async () => {
      if (!currentTenantId) return null;

      const { data, error } = await supabase
        .from("external_streaming_configs")
        .select("id, embed_mode, embed_code, player_url")
        .eq("tenant_id", currentTenantId)
        .eq("kind", "tv")
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
        const { data } = await supabase.functions.invoke("streaming-gateway/tv/status", {
          headers: { "x-tenant-id": currentTenantId },
        });

        if (data && data.kind === "tv") {
          setStatus({
            isOnline: data.isOnline,
            viewers: data.viewers || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching TV status:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [currentTenantId]);

  const getPlayerHtml = () => {
    if (!config) return "";

    if (config.embed_mode === "url" && config.player_url) {
      return `<iframe src="${config.player_url}" width="100%" style="aspect-ratio: 16/9; border-radius: 8px;" frameborder="0" allowfullscreen></iframe>`;
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
              <Tv className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">TV não configurada</h1>
              <p className="text-muted-foreground text-sm">
                A TV web ainda não foi configurada para este site.
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
              <Tv className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold">TV Web</h1>
          <p className="text-muted-foreground">
            Assista nossa programação ao vivo
          </p>
        </div>

        {/* Status Bar */}
        {status && (
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <Badge variant={status.isOnline ? "default" : "secondary"} className="h-8">
                  {status.isOnline ? (
                    <>
                      <Volume2 className="h-3 w-3 mr-1" />
                      Ao Vivo
                    </>
                  ) : (
                    "Offline"
                  )}
                </Badge>
                {status.isOnline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{status.viewers} espectadores</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Player */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div
              className="w-full aspect-video bg-black"
              dangerouslySetInnerHTML={{ __html: getPlayerHtml() }}
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
