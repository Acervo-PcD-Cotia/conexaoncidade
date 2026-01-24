import { Settings, Radio, Music, Volume2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRadioSettings, useUpdateRadioSettings } from "../hooks/useRadioSettings";
import { useRadioPlaylists } from "../hooks/useRadioPlaylists";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { RadioSettings as RadioSettingsType } from "../types";

export default function RadioSettings() {
  const { data: settings, isLoading } = useRadioSettings();
  const { data: playlists } = useRadioPlaylists();
  const updateSettings = useUpdateRadioSettings();

  const [formData, setFormData] = useState<Partial<RadioSettingsType>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setHasChanges(false);
    }
  }, [settings]);

  const handleChange = (key: keyof RadioSettingsType, value: any) => {
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
            <h1 className="text-2xl font-bold">Configurações da Rádio</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações gerais da sua estação
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
        {/* Station Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Informações da Estação
            </CardTitle>
            <CardDescription>
              Dados básicos exibidos para os ouvintes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stationName">Nome da Estação</Label>
              <Input
                id="stationName"
                value={formData.stationName || ""}
                onChange={(e) => handleChange("stationName", e.target.value)}
                placeholder="Nome da sua rádio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stationDescription">Descrição</Label>
              <Textarea
                id="stationDescription"
                value={formData.stationDescription || ""}
                onChange={(e) => handleChange("stationDescription", e.target.value)}
                placeholder="Descrição da sua rádio"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stationGenre">Gênero Musical</Label>
              <Input
                id="stationGenre"
                value={formData.stationGenre || ""}
                onChange={(e) => handleChange("stationGenre", e.target.value)}
                placeholder="Ex: Pop, Rock, MPB"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stationWebsite">Website</Label>
              <Input
                id="stationWebsite"
                type="url"
                value={formData.stationWebsite || ""}
                onChange={(e) => handleChange("stationWebsite", e.target.value)}
                placeholder="https://suaradio.com.br"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stationLogo">URL do Logo</Label>
              <Input
                id="stationLogo"
                type="url"
                value={formData.stationLogo || ""}
                onChange={(e) => handleChange("stationLogo", e.target.value)}
                placeholder="https://suaradio.com.br/logo.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Streaming Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Configurações de Streaming
            </CardTitle>
            <CardDescription>
              Qualidade e comportamento do stream
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Bitrate Máximo</Label>
              <Select 
                value={String(formData.maxBitrate || 128)}
                onValueChange={(value) => handleChange("maxBitrate", Number(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="64">64 kbps</SelectItem>
                  <SelectItem value="96">96 kbps</SelectItem>
                  <SelectItem value="128">128 kbps</SelectItem>
                  <SelectItem value="192">192 kbps</SelectItem>
                  <SelectItem value="256">256 kbps</SelectItem>
                  <SelectItem value="320">320 kbps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Music className="h-4 w-4" />
                AutoDJ
              </h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Habilitar AutoDJ</Label>
                  <p className="text-xs text-muted-foreground">
                    Reprodução automática quando não há locutor
                  </p>
                </div>
                <Switch
                  checked={formData.enableAutoDJ ?? false}
                  onCheckedChange={(checked) => handleChange("enableAutoDJ", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Fallback Habilitado</Label>
                  <p className="text-xs text-muted-foreground">
                    Usar playlist de emergência se o stream cair
                  </p>
                </div>
                <Switch
                  checked={formData.fallbackEnabled ?? false}
                  onCheckedChange={(checked) => handleChange("fallbackEnabled", checked)}
                />
              </div>

              {formData.fallbackEnabled && playlists && (
                <div className="space-y-2">
                  <Label>Playlist de Fallback</Label>
                  <Select 
                    value={formData.fallbackPlaylistId || ""}
                    onValueChange={(value) => handleChange("fallbackPlaylistId", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar playlist" />
                    </SelectTrigger>
                    <SelectContent>
                      {playlists.map((pl) => (
                        <SelectItem key={pl.id} value={pl.id}>
                          {pl.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
