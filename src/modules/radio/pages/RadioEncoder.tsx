import { Settings, Server, Key, Download, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CopyButton, PasswordReveal } from "../components";
import { useRadioEncoder, useRevealRadioPassword } from "../hooks/useRadioEncoder";

const softwareList = [
  {
    name: "BUTT",
    description: "Broadcast Using This Tool - Simples e eficiente",
    url: "https://danielnoethen.de/butt/",
  },
  {
    name: "Mixxx",
    description: "DJ software profissional com streaming integrado",
    url: "https://mixxx.org/",
  },
  {
    name: "OBS Studio",
    description: "Com plugin de streaming de áudio",
    url: "https://obsproject.com/",
  },
  {
    name: "RadioBOSS",
    description: "Automação profissional para rádios",
    url: "https://www.djsoft.net/",
  },
];

export default function RadioEncoder() {
  const { data: config, isLoading, error, refetch } = useRadioEncoder();
  const { password, expiresAt, isLoading: revealLoading, reveal, hide } = useRevealRadioPassword();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive mb-4">Erro ao carregar configuração do encoder</p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Settings className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Encoder / Chaves</h1>
          <p className="text-muted-foreground">
            Credenciais para conectar seu software de transmissão
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Server Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5" />
              Credenciais do Servidor
            </CardTitle>
            <CardDescription>
              Use estas informações no seu encoder
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Servidor</Label>
              <div className="flex items-center gap-2">
                <Input value={config?.server || ""} readOnly className="font-mono" />
                <CopyButton value={config?.server || ""} size="icon" label="" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Porta</Label>
              <div className="flex items-center gap-2">
                <Input value={String(config?.port || "")} readOnly className="font-mono w-32" />
                <CopyButton value={String(config?.port || "")} size="icon" label="" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Protocolo</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-sm">
                  {config?.protocol?.toUpperCase() || "ICECAST"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mount Point</Label>
              <div className="flex items-center gap-2">
                <Input value={config?.mount || ""} readOnly className="font-mono" />
                <CopyButton value={config?.mount || ""} size="icon" label="" />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Senha
              </Label>
              <PasswordReveal
                maskedValue={config?.passwordMasked || "••••••••"}
                revealedValue={password}
                expiresAt={expiresAt}
                isLoading={revealLoading}
                onReveal={reveal}
                onHide={hide}
              />
              <p className="text-xs text-muted-foreground">
                A senha será ocultada automaticamente após 15 segundos
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Stream Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Configurações de Stream</CardTitle>
            <CardDescription>
              Parâmetros técnicos da transmissão
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Bitrate</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm">
                    {config?.bitrate || 128} kbps
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Formato</Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-sm uppercase">
                    {config?.format || "MP3"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>URL de Streaming Completa</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={`http://${config?.server || "stream.example.com"}:${config?.port || 8000}${config?.mount || "/live"}`}
                  readOnly
                  className="font-mono text-xs"
                />
                <CopyButton
                  value={`http://${config?.server || "stream.example.com"}:${config?.port || 8000}${config?.mount || "/live"}`}
                  size="icon"
                  label=""
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Software Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5" />
            Software Recomendado
          </CardTitle>
          <CardDescription>
            Ferramentas compatíveis para transmitir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {softwareList.map((software) => (
              <div
                key={software.name}
                className="flex flex-col p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-medium">{software.name}</h4>
                <p className="text-sm text-muted-foreground flex-1 mt-1">
                  {software.description}
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto mt-2 justify-start"
                  asChild
                >
                  <a href={software.url} target="_blank" rel="noopener noreferrer">
                    Download
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
