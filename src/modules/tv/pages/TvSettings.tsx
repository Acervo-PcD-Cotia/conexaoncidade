import { Settings, Tv, Video, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTvSettings, useUpdateTvSettings } from "../hooks/useTvSettings";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { TvSettings as TvSettingsType } from "../types";

export default function TvSettings() {
  const { data: settings, isLoading } = useTvSettings();
  const updateSettings = useUpdateTvSettings();

  const [formData, setFormData] = useState<Partial<TvSettingsType>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (key: keyof TvSettingsType, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync(formData);
      toast.success("Configurações salvas com sucesso!");
      setHasChanges(false);
    } catch {
      toast.error("Erro ao salvar configurações");
    }
  };

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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Configurações da TV</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações do seu canal
            </p>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={!hasChanges || updateSettings.isPending}
        >
          {updateSettings.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Channel Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tv className="h-5 w-5" />
              Informações do Canal
            </CardTitle>
            <CardDescription>
              Dados básicos exibidos para os espectadores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channelName">Nome do Canal</Label>
              <Input
                id="channelName"
                value={formData.channelName || ""}
                onChange={(e) => handleChange("channelName", e.target.value)}
                placeholder="Nome do seu canal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelDescription">Descrição</Label>
              <Textarea
                id="channelDescription"
                value={formData.channelDescription || ""}
                onChange={(e) => handleChange("channelDescription", e.target.value)}
                placeholder="Descrição do seu canal"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="channelLogo">URL do Logo</Label>
              <Input
                id="channelLogo"
                type="url"
                value={formData.channelLogo || ""}
                onChange={(e) => handleChange("channelLogo", e.target.value)}
                placeholder="https://seucanal.com.br/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Streaming Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Qualidade e Streaming
            </CardTitle>
            <CardDescription>
              Configurações de transmissão e playback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Qualidade Padrão</Label>
              <Select 
                value={formData.defaultQuality || "720p"}
                onValueChange={(value: any) => handleChange("defaultQuality", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="360p">360p</SelectItem>
                  <SelectItem value="480p">480p</SelectItem>
                  <SelectItem value="720p">720p HD</SelectItem>
                  <SelectItem value="1080p">1080p Full HD</SelectItem>
                  <SelectItem value="auto">Auto (Adaptativo)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo Baixa Latência</Label>
                <p className="text-xs text-muted-foreground">
                  Reduz delay para interações ao vivo
                </p>
              </div>
              <Switch
                checked={formData.lowLatencyMode ?? false}
                onCheckedChange={(checked) => handleChange("lowLatencyMode", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar DVR</Label>
                <p className="text-xs text-muted-foreground">
                  Permite voltar no tempo durante transmissões
                </p>
              </div>
              <Switch
                checked={formData.enableDVR ?? false}
                onCheckedChange={(checked) => handleChange("enableDVR", checked)}
              />
            </div>

            {formData.enableDVR && (
              <div className="space-y-2">
                <Label htmlFor="dvrWindow">Janela DVR (minutos)</Label>
                <Input
                  id="dvrWindow"
                  type="number"
                  min={5}
                  max={120}
                  value={formData.dvrWindowMinutes || 30}
                  onChange={(e) => handleChange("dvrWindowMinutes", Number(e.target.value))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactivity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Interatividade
            </CardTitle>
            <CardDescription>
              Recursos de engajamento com o público
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Habilitar Chat</Label>
                <p className="text-xs text-muted-foreground">
                  Permite chat ao vivo durante transmissões
                </p>
              </div>
              <Switch
                checked={formData.enableChat ?? false}
                onCheckedChange={(checked) => handleChange("enableChat", checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Transcode Profiles */}
        <Card>
          <CardHeader>
            <CardTitle>Perfis de Transcoding</CardTitle>
            <CardDescription>
              Qualidades disponíveis para os espectadores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(formData.transcodeProfiles || ["360p", "480p", "720p", "1080p"]).map((profile) => (
                <Badge key={profile} variant="secondary">
                  {profile}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Os perfis de transcoding são gerenciados automaticamente pelo sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
