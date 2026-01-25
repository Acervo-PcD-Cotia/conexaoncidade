import { useState, useEffect } from "react";
import { Radio, Settings, ExternalLink, Play, TestTube, Save, Loader2, AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useStreamingConfig, StreamingConfigInput } from "@/hooks/useStreamingConfig";
import { sanitizeEmbedCode, isEmbedCodeSafe } from "@/lib/sanitizeEmbed";
import { RadioStatus } from "@/hooks/useStreamingStatus";

export default function StreamingRadioConfig() {
  const { config, isLoading, save, isSaving, testConnection, isTestingConnection, testResult, testError } = useStreamingConfig("radio");
  
  const [formData, setFormData] = useState<StreamingConfigInput>({
    api_json_url: "",
    embed_mode: "iframe",
    embed_code: "",
    player_url: "",
    external_panel_url: "",
    notes: "",
    is_active: true,
  });
  
  const [embedWarning, setEmbedWarning] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load config into form
  useEffect(() => {
    if (config) {
      setFormData({
        api_json_url: config.api_json_url || "",
        embed_mode: config.embed_mode || "iframe",
        embed_code: config.embed_code || "",
        player_url: config.player_url || "",
        external_panel_url: config.external_panel_url || "",
        notes: config.notes || "",
        is_active: config.is_active,
      });
    }
  }, [config]);

  // Check embed code safety
  useEffect(() => {
    if (formData.embed_code && !isEmbedCodeSafe(formData.embed_code)) {
      setEmbedWarning("O código contém elementos potencialmente inseguros. Scripts e eventos JavaScript serão removidos.");
    } else {
      setEmbedWarning(null);
    }
  }, [formData.embed_code]);

  const handleSave = () => {
    // Sanitize embed code before saving
    const sanitizedData = {
      ...formData,
      embed_code: formData.embed_code ? sanitizeEmbedCode(formData.embed_code) : null,
    };
    save(sanitizedData);
  };

  const handleTestConnection = async () => {
    try {
      await testConnection();
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const getPreviewHtml = () => {
    if (formData.embed_mode === "url" && formData.player_url) {
      return `<iframe src="${formData.player_url}" width="100%" height="200" frameborder="0" allowfullscreen></iframe>`;
    }
    if (formData.embed_code) {
      return sanitizeEmbedCode(formData.embed_code);
    }
    return "";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const radioStatus = testResult as RadioStatus | undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Radio className="h-6 w-6 text-primary" />
            Configuração Rádio Web
          </h1>
          <p className="text-muted-foreground">
            Configure a integração com sua rádio externa (VoxHD, AzuraCast, etc)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="is-active">Ativo</Label>
            <Switch
              id="is-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList>
          <TabsTrigger value="api">API Externa</TabsTrigger>
          <TabsTrigger value="embed">Player Embed</TabsTrigger>
          <TabsTrigger value="panel">Painel Externo</TabsTrigger>
        </TabsList>

        {/* API Configuration */}
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuração da API
              </CardTitle>
              <CardDescription>
                Configure a URL da API JSON do seu provedor de streaming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">API JSON URL</Label>
                <Input
                  id="api-url"
                  placeholder="http://voxhd.com.br/api-json/SEU_TOKEN"
                  value={formData.api_json_url || ""}
                  onChange={(e) => setFormData({ ...formData, api_json_url: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  URL da API que retorna status da rádio em formato JSON
                </p>
              </div>

              <Button
                variant="outline"
                onClick={handleTestConnection}
                disabled={isTestingConnection || !formData.api_json_url}
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Testar Conexão
              </Button>

              {/* Test Result */}
              {testResult && !testError && (
                <Alert className="border-green-500 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertTitle>Conexão bem-sucedida!</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        <span className="font-medium">Status:</span>{" "}
                        <Badge variant={radioStatus?.isOnline ? "default" : "secondary"}>
                          {radioStatus?.statusText || "Desconhecido"}
                        </Badge>
                      </div>
                      <div>
                        <span className="font-medium">Ouvintes:</span> {radioStatus?.listeners || 0}
                      </div>
                      {radioStatus?.nowPlaying && (
                        <div className="col-span-2">
                          <span className="font-medium">Tocando:</span> {radioStatus.nowPlaying.track}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {testError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Erro na conexão</AlertTitle>
                  <AlertDescription>
                    {testError instanceof Error ? testError.message : "Não foi possível conectar à API"}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Embed Configuration */}
        <TabsContent value="embed">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Configuração do Player
              </CardTitle>
              <CardDescription>
                Configure o player que será exibido na página pública da rádio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embed-mode">Modo do Embed</Label>
                <Select
                  value={formData.embed_mode}
                  onValueChange={(value: "iframe" | "html" | "url") =>
                    setFormData({ ...formData, embed_mode: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iframe">Código HTML (iframe/audio)</SelectItem>
                    <SelectItem value="url">URL do Player</SelectItem>
                    <SelectItem value="html">HTML Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.embed_mode === "url" ? (
                <div className="space-y-2">
                  <Label htmlFor="player-url">URL do Player</Label>
                  <Input
                    id="player-url"
                    placeholder="https://seuservidor.com/player"
                    value={formData.player_url || ""}
                    onChange={(e) => setFormData({ ...formData, player_url: e.target.value })}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="embed-code">Código Embed</Label>
                  <Textarea
                    id="embed-code"
                    placeholder="<iframe src='...'></iframe> ou <audio src='...'></audio>"
                    rows={6}
                    value={formData.embed_code || ""}
                    onChange={(e) => setFormData({ ...formData, embed_code: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aceita: iframe, audio, video. Scripts serão removidos por segurança.
                  </p>
                </div>
              )}

              {embedWarning && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Aviso de Segurança</AlertTitle>
                  <AlertDescription>{embedWarning}</AlertDescription>
                </Alert>
              )}

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  disabled={!formData.embed_code && !formData.player_url}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showPreview ? "Ocultar Preview" : "Ver Preview"}
                </Button>
              </div>

              {showPreview && getPreviewHtml() && (
                <div className="border rounded-lg p-4 bg-muted/30">
                  <Label className="mb-2 block">Preview do Player</Label>
                  <div
                    className="w-full"
                    dangerouslySetInnerHTML={{ __html: getPreviewHtml() }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* External Panel */}
        <TabsContent value="panel">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Painel Profissional
              </CardTitle>
              <CardDescription>
                Link para o painel de administração do seu provedor de streaming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="panel-url">URL do Painel</Label>
                <Input
                  id="panel-url"
                  placeholder="https://painel.voxhd.com.br/login"
                  value={formData.external_panel_url || ""}
                  onChange={(e) => setFormData({ ...formData, external_panel_url: e.target.value })}
                />
              </div>

              {formData.external_panel_url && (
                <Button variant="outline" asChild>
                  <a
                    href={formData.external_panel_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Abrir Painel Profissional
                  </a>
                </Button>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Anotações sobre a configuração..."
                  rows={3}
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
