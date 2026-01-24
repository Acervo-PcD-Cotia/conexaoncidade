import { Tv, Users, Activity, Wifi, Radio, RefreshCw, Copy, Server, MonitorPlay, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useTvLiveStatus, useTvIngest, useRevealTvStreamKey, useRegenerateTvCredentials } from "../hooks";
import { StatusBadge, KpiCard, CopyButton, PasswordReveal } from "../components";

export default function TvLive() {
  const { data: status, isLoading: statusLoading, error: statusError, refetch: refetchStatus } = useTvLiveStatus();
  const { data: ingest, isLoading: ingestLoading } = useTvIngest();
  const streamKeyReveal = useRevealTvStreamKey();
  const regenerateCredentials = useRegenerateTvCredentials();

  const handleRegenerate = () => {
    regenerateCredentials.mutate(undefined, {
      onSuccess: () => {
        toast.success("Credenciais regeneradas com sucesso");
        streamKeyReveal.hide();
      },
      onError: () => {
        toast.error("Erro ao regenerar credenciais");
      },
    });
  };

  if (statusError) {
    return (
      <div className="p-6 space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            Erro ao carregar status do live
            <Button variant="outline" size="sm" onClick={() => refetchStatus()}>
              Tentar novamente
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Radio className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Live (RTMP/SRT)</h1>
          <p className="text-muted-foreground">Status da transmissão e credenciais de ingest</p>
        </div>
      </div>

      {/* Status Section */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Status da Transmissão</h2>
        
        {statusLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
        ) : status ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <div className="mt-2">
                      <StatusBadge state={status.state} />
                    </div>
                  </div>
                  <Wifi className={`h-8 w-8 ${status.state === "online" ? "text-green-500" : "text-muted-foreground"}`} />
                </div>
              </CardContent>
            </Card>

            <KpiCard
              title="Espectadores Agora"
              value={status.viewersNow.toLocaleString()}
              icon={Users}
              description="Assistindo ao vivo"
            />

            <KpiCard
              title="Pico Hoje"
              value={status.peakToday.toLocaleString()}
              icon={Activity}
              description="Máximo simultâneo"
            />

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Qualidade</p>
                    <p className="text-lg font-bold mt-1">{status.quality.resolution}</p>
                    <p className="text-xs text-muted-foreground">
                      {status.quality.bitrate} kbps • {status.quality.fps} fps
                    </p>
                  </div>
                  <MonitorPlay className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>

      <Separator />

      {/* Ingest Credentials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Credenciais de Ingest</h2>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={regenerateCredentials.isPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${regenerateCredentials.isPending ? "animate-spin" : ""}`} />
                Regenerar Credenciais
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Regenerar credenciais?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso irá invalidar as credenciais atuais. Você precisará atualizar as configurações 
                  do seu software de transmissão (OBS, BUTT, etc.).
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleRegenerate}>
                  Regenerar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {ingestLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        ) : ingest ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* RTMP */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="h-4 w-4" />
                  RTMP (Principal)
                </CardTitle>
                <CardDescription>Protocolo padrão para transmissões</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Servidor</label>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                      {ingest.rtmpUrl}
                    </code>
                    <CopyButton value={ingest.rtmpUrl} size="icon" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stream Key</label>
                  <PasswordReveal
                    maskedValue="••••••••••••••••"
                    revealedValue={streamKeyReveal.streamKey}
                    expiresAt={streamKeyReveal.expiresAt}
                    isLoading={streamKeyReveal.isLoading}
                    onReveal={streamKeyReveal.reveal}
                    onHide={streamKeyReveal.hide}
                  />
                  <p className="text-xs text-muted-foreground">
                    A chave será ocultada automaticamente após 15 segundos
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SRT */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tv className="h-4 w-4" />
                  SRT (Alternativo)
                </CardTitle>
                <CardDescription>Menor latência, ideal para redes instáveis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {ingest.srtUrl ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL SRT</label>
                      <div className="flex gap-2">
                        <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                          {ingest.srtUrl}
                        </code>
                        <CopyButton value={ingest.srtUrl} size="icon" />
                      </div>
                    </div>

                    {ingest.srtStreamId && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Stream ID</label>
                        <div className="flex gap-2">
                          <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                            {ingest.srtStreamId}
                          </code>
                          <CopyButton value={ingest.srtStreamId} size="icon" />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-muted-foreground text-sm">SRT não disponível neste plano</p>
                )}

                {ingest.backupRtmpUrl && (
                  <div className="space-y-2 pt-2 border-t">
                    <label className="text-sm font-medium">RTMP Backup</label>
                    <div className="flex gap-2">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono truncate">
                        {ingest.backupRtmpUrl}
                      </code>
                      <CopyButton value={ingest.backupRtmpUrl} size="icon" />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </section>

      <Separator />

      {/* Recommended Software */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Software Recomendado</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: "OBS Studio", desc: "Software gratuito e profissional", url: "https://obsproject.com" },
            { name: "Streamlabs", desc: "Fácil de usar com overlays", url: "https://streamlabs.com" },
            { name: "XSplit", desc: "Solução premium para broadcast", url: "https://xsplit.com" },
          ].map((software) => (
            <Card key={software.name} className="hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <h3 className="font-medium">{software.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{software.desc}</p>
                <Button variant="link" size="sm" className="px-0 mt-2" asChild>
                  <a href={software.url} target="_blank" rel="noopener noreferrer">
                    Baixar →
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
