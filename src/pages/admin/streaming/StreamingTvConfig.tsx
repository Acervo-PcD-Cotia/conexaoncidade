import { useState, useEffect } from "react";
import { Tv, Settings, ExternalLink, Play, TestTube, Save, Loader2, AlertCircle, CheckCircle2, Eye, Users, Activity, Zap, Clock } from "lucide-react";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useStreamingConfig, StreamingConfigInput, TestResultV2 } from "@/hooks/useStreamingConfig";
import { sanitizeEmbedCode, isEmbedCodeSafe } from "@/lib/sanitizeEmbed";
import { RequireTenant } from "@/components/admin/RequireTenant";

function StatusCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
      </div>
    </div>
  );
}

function StreamingTvConfigContent() {
  const { config, isLoading, hasTenant, save, isSaving, testConnection, isTestingConnection, testResult, testError, availableSites } = useStreamingConfig("tv");
  
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
      return `<iframe src="${formData.player_url}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
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

  const tvResult = testResult as TestResultV2 | undefined;

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Tv className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">TV Web</h1>
            <p className="text-sm text-muted-foreground">Integração VoxTV, HLS</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="is-active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is-active" className="text-sm">Ativo</Label>
          </div>
          <Button onClick={handleSave} disabled={isSaving || !hasTenant} size="sm">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Status Cards Row (when test result available) */}
      {tvResult?.ok && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard 
            label="Status" 
            value={tvResult.isLive ? "● Ao Vivo" : "Offline"} 
            icon={Activity} 
          />
          <StatusCard 
            label="Espectadores" 
            value={tvResult.viewersNow || 0} 
            icon={Users} 
          />
          <StatusCard 
            label="Bitrate" 
            value={tvResult.bitrateKbps ? `${tvResult.bitrateKbps}kbps` : "-"} 
            icon={Zap} 
          />
          <StatusCard 
            label="Latência" 
            value={tvResult.latencyMs ? `${tvResult.latencyMs}ms` : "-"} 
            icon={Clock} 
          />
        </div>
      )}

      <Tabs defaultValue="api" className="space-y-4">
        <TabsList className="h-9">
          <TabsTrigger value="api" className="text-sm">API Externa</TabsTrigger>
          <TabsTrigger value="embed" className="text-sm">Player Embed</TabsTrigger>
          <TabsTrigger value="panel" className="text-sm">Painel Externo</TabsTrigger>
        </TabsList>

        {/* API Configuration */}
        <TabsContent value="api">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuração da API
              </CardTitle>
              <CardDescription className="text-sm">
                URL da API JSON do seu provedor de TV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="http://voxtvhd.com.br/api-json/SEU_TOKEN"
                    value={formData.api_json_url || ""}
                    onChange={(e) => setFormData({ ...formData, api_json_url: e.target.value })}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection || !config?.api_json_url || !hasTenant}
                  title={!config?.api_json_url ? "Salve a configuração primeiro" : "Testar conexão com a API"}
                  size="default"
                >
                  {isTestingConnection ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Testar</span>
                </Button>
              </div>

              {/* Test Result */}
              {tvResult && !testError && (
                <Alert className={tvResult.ok ? "border-green-500 bg-green-500/5" : "border-amber-500 bg-amber-500/5"}>
                  {tvResult.ok ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <AlertTitle className="text-sm">{tvResult.ok ? "Conexão OK" : "Resposta recebida"}</AlertTitle>
                  <AlertDescription>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Status:</span>{" "}
                        <Badge variant={tvResult.isLive ? "default" : "secondary"} className="text-xs">
                          {tvResult.isLive ? "Ao Vivo" : "Offline"}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Espectadores:</span> {tvResult.viewersNow || 0}
                      </div>
                      {tvResult.bitrateKbps && (
                        <div>
                          <span className="text-muted-foreground">Bitrate:</span> {tvResult.bitrateKbps}kbps
                        </div>
                      )}
                      {tvResult.latencyMs && (
                        <div>
                          <span className="text-muted-foreground">Latência:</span> {tvResult.latencyMs}ms
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {testError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-sm">Erro na conexão</AlertTitle>
                  <AlertDescription className="text-sm">
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Play className="h-4 w-4" />
                Configuração do Player
              </CardTitle>
              <CardDescription className="text-sm">
                Player exibido na página pública da TV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="embed-mode" className="text-sm">Modo do Embed</Label>
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
                    <SelectItem value="url">iFrame URL (recomendado)</SelectItem>
                    <SelectItem value="iframe">Código HTML (iframe/video)</SelectItem>
                    <SelectItem value="html">HTML Customizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.embed_mode === "url" ? (
                <div className="space-y-2">
                  <Label htmlFor="player-url" className="text-sm">URL do Player/Stream</Label>
                  <Input
                    id="player-url"
                    placeholder="https://seuservidor.com/player ou .m3u8"
                    value={formData.player_url || ""}
                    onChange={(e) => setFormData({ ...formData, player_url: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">URL do player externo ou stream HLS (.m3u8)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="embed-code" className="text-sm">Código Embed</Label>
                  <Textarea
                    id="embed-code"
                    placeholder="<iframe src='...'></iframe> ou <video src='...'></video>"
                    rows={4}
                    value={formData.embed_code || ""}
                    onChange={(e) => setFormData({ ...formData, embed_code: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Aceita: iframe, video, audio. Scripts serão removidos.
                  </p>
                </div>
              )}

              {embedWarning && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{embedWarning}</AlertDescription>
                </Alert>
              )}

              {/* Collapsible Preview - Sandboxed iframe for safety */}
              <Collapsible open={showPreview} onOpenChange={setShowPreview}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!formData.embed_code && !formData.player_url}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPreview ? "Ocultar Preview" : "Ver Preview"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3">
                  {getPreviewHtml() && (
                    <div className="border rounded-lg p-4 bg-muted/30">
                      <iframe
                        srcDoc={`<!DOCTYPE html><html><head><style>body{margin:0;font-family:sans-serif;}</style></head><body>${getPreviewHtml()}</body></html>`}
                        sandbox="allow-scripts allow-same-origin"
                        className="w-full aspect-video border-0 rounded"
                        title="Preview do Player"
                      />
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </TabsContent>

        {/* External Panel */}
        <TabsContent value="panel">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Painel Profissional
              </CardTitle>
              <CardDescription className="text-sm">
                Link para o painel do provedor de TV
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="https://painel.voxtvhd.com.br/login"
                  value={formData.external_panel_url || ""}
                  onChange={(e) => setFormData({ ...formData, external_panel_url: e.target.value })}
                  className="flex-1"
                />
                {formData.external_panel_url && (
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={formData.external_panel_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">Notas</Label>
                <Textarea
                  id="notes"
                  placeholder="Anotações sobre a configuração..."
                  rows={2}
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

export default function StreamingTvConfig() {
  return (
    <RequireTenant>
      <StreamingTvConfigContent />
    </RequireTenant>
  );
}
