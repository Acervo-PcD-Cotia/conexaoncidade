import { useState, useEffect } from "react";
import { Bot, Zap, RefreshCw, CheckCircle, Key, Save, Info, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface AIProvider {
  id: string;
  name: string;
  description: string;
  models: string[];
  defaultModel: string;
  color: string;
  logo: string;
  apiKeyRequired: boolean;
  nativeKey?: boolean; // Usa LOVABLE_API_KEY internamente
  externalModelManagement?: boolean; // modelo gerenciado pelo provedor
}

const AI_PROVIDERS: AIProvider[] = [
  {
    id: "lovable",
    name: "Lovable AI",
    description: "Gateway nativo da Lovable. Acessa Gemini e GPT-5 sem necessidade de chave própria. Recomendado.",
    models: ["google/gemini-3-flash-preview", "google/gemini-2.5-flash", "google/gemini-2.5-pro", "google/gemini-3-pro-preview", "openai/gpt-5-mini", "openai/gpt-5"],
    defaultModel: "google/gemini-3-flash-preview",
    color: "from-violet-600 to-purple-500",
    logo: "🪄",
    apiKeyRequired: false,
    nativeKey: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Modelos Gemini 2.5 e 3. Excelente para raciocínio multimodal e contexto longo.",
    models: ["google/gemini-3-flash-preview", "google/gemini-2.5-flash", "google/gemini-2.5-pro", "google/gemini-3-pro-preview"],
    defaultModel: "google/gemini-3-flash-preview",
    color: "from-blue-500 to-cyan-400",
    logo: "🤖",
    apiKeyRequired: false,
    nativeKey: true,
  },
  {
    id: "openai",
    name: "OpenAI (ChatGPT)",
    description: "Modelos GPT-5. Ideal para raciocínio complexo, contexto longo e tarefas multimodais.",
    models: ["openai/gpt-5", "openai/gpt-5-mini", "openai/gpt-5-nano", "openai/gpt-5.2"],
    defaultModel: "openai/gpt-5-mini",
    color: "from-green-500 to-emerald-400",
    logo: "🧠",
    apiKeyRequired: false,
    nativeKey: true,
  },
  {
    id: "abacus",
    name: "Abacus AI",
    description: "Plataforma enterprise com modelos customizados. O modelo é gerenciado diretamente pelo Abacus AI via API.",
    models: [], // Abacus manages models internally
    defaultModel: "abacus/auto",
    color: "from-purple-500 to-violet-400",
    logo: "⚡",
    apiKeyRequired: true,
    externalModelManagement: true, // model selection done on Abacus side
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "Modelos Claude. Excelente para análise de documentos e raciocínio preciso.",
    models: ["claude-3-5-sonnet", "claude-3-opus", "claude-3-haiku"],
    defaultModel: "claude-3-5-sonnet",
    color: "from-orange-500 to-amber-400",
    logo: "🔮",
    apiKeyRequired: true,
  },
  {
    id: "groq",
    name: "Groq",
    description: "Inferência ultra-rápida com modelos open source (Llama, Mixtral). Requer chave própria.",
    models: ["llama-3.3-70b-versatile", "mixtral-8x7b-32768", "gemma2-9b-it"],
    defaultModel: "llama-3.3-70b-versatile",
    color: "from-red-500 to-rose-400",
    logo: "🚀",
    apiKeyRequired: true,
  },
];

interface AIConfig {
  mode: "manual" | "alternating";
  activeProviderId: string;
  activeModel: string;
  enabledProviders: string[];
  alternatingInterval: number; // requests before switching
  customApiKeys: Record<string, string>;
  requestCount: number;
  currentRotationIndex: number;
}

const DEFAULT_CONFIG: AIConfig = {
  mode: "manual",
  activeProviderId: "lovable",
  activeModel: "google/gemini-3-flash-preview",
  enabledProviders: ["lovable", "gemini", "openai"],
  alternatingInterval: 10,
  customApiKeys: {},
  requestCount: 0,
  currentRotationIndex: 0,
};

const STORAGE_KEY = "conexao_ai_provider_config";

export default function AIProviderSettings() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [apiKeyInputs, setApiKeyInputs] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(saved) });
      } catch {}
    }
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      toast.success("Configurações de IA salvas com sucesso!");
    } catch {
      toast.error("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const toggleProvider = (providerId: string) => {
    setConfig((prev) => {
      const enabled = prev.enabledProviders.includes(providerId);
      if (enabled && prev.enabledProviders.length === 1) {
        toast.warning("Pelo menos um provedor deve estar ativo.");
        return prev;
      }
      const updated = enabled
        ? prev.enabledProviders.filter((p) => p !== providerId)
        : [...prev.enabledProviders, providerId];
      return { ...prev, enabledProviders: updated };
    });
  };

  const selectProvider = (providerId: string) => {
    const provider = AI_PROVIDERS.find((p) => p.id === providerId);
    if (!provider) return;
    setConfig((prev) => ({
      ...prev,
      activeProviderId: providerId,
      activeModel: provider.defaultModel,
      // Garante que o provedor selecionado manualmente sempre esteja na lista de habilitados
      enabledProviders: prev.enabledProviders.includes(providerId)
        ? prev.enabledProviders
        : [...prev.enabledProviders, providerId],
    }));
  };

  const saveApiKey = (providerId: string) => {
    const key = apiKeyInputs[providerId];
    if (!key?.trim()) {
      toast.warning("Digite a chave de API antes de salvar.");
      return;
    }
    setConfig((prev) => ({
      ...prev,
      customApiKeys: { ...prev.customApiKeys, [providerId]: key.trim() },
    }));
    toast.success("Chave salva localmente. Clique em 'Salvar Configurações' para persistir.");
  };

  const activeProvider = AI_PROVIDERS.find((p) => p.id === config.activeProviderId);
  const enabledProviders = AI_PROVIDERS.filter((p) => config.enabledProviders.includes(p.id));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
          <Bot className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold">Provedores de IA</h1>
          <p className="text-sm text-muted-foreground">
            Configure qual IA será usada nas funcionalidades do portal
          </p>
        </div>
      </div>

      {/* Status atual */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeProvider?.logo}</span>
              <div>
                <p className="font-semibold text-sm">Provedor Ativo</p>
                <p className="text-lg font-bold text-primary">{activeProvider?.name}</p>
                {activeProvider?.externalModelManagement ? (
                  <p className="text-xs text-muted-foreground">Modelo gerenciado pelo {activeProvider.name}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{config.activeModel}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={config.mode === "manual" ? "default" : "secondary"}>
                {config.mode === "manual" ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Manual</>
                ) : (
                  <><RefreshCw className="h-3 w-3 mr-1" /> Alternado</>
                )}
              </Badge>
              {config.mode === "alternating" && (
                <span className="text-xs text-muted-foreground">
                  Troca a cada {config.alternatingInterval} requisições
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="mode">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mode">Modo de Uso</TabsTrigger>
          <TabsTrigger value="providers">Provedores</TabsTrigger>
          <TabsTrigger value="keys">Chaves de API</TabsTrigger>
        </TabsList>

        {/* ===== ABA MODO ===== */}
        <TabsContent value="mode" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Como a IA será selecionada?</CardTitle>
              <CardDescription>
                Escolha entre seleção manual de um provedor fixo ou alternância automática entre os provedores ativos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={config.mode}
                onValueChange={(v) => setConfig((prev) => ({ ...prev, mode: v as "manual" | "alternating" }))}
                className="space-y-4"
              >
                {/* Manual */}
                <div
                  className={cn(
                    "flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors",
                    config.mode === "manual" && "border-primary bg-primary/5"
                  )}
                  onClick={() => setConfig((prev) => ({ ...prev, mode: "manual" }))}
                >
                  <RadioGroupItem value="manual" id="mode-manual" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="mode-manual" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" /> Manual
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Você define um provedor fixo. Toda a IA do portal usará este provedor.
                    </p>
                    {config.mode === "manual" && (
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {AI_PROVIDERS.map((p) => (
                          <button
                            key={p.id}
                            onClick={(e) => { e.stopPropagation(); selectProvider(p.id); }}
                            className={cn(
                              "flex items-center gap-2 rounded-md border p-2 text-sm transition-colors",
                              config.activeProviderId === p.id
                                ? "border-primary bg-primary text-primary-foreground"
                                : "hover:border-primary/50 hover:bg-accent"
                            )}
                          >
                            <span>{p.logo}</span>
                            <span className="font-medium truncate">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Alternado */}
                <div
                  className={cn(
                    "flex items-start gap-4 rounded-lg border p-4 cursor-pointer transition-colors",
                    config.mode === "alternating" && "border-primary bg-primary/5"
                  )}
                  onClick={() => setConfig((prev) => ({ ...prev, mode: "alternating" }))}
                >
                  <RadioGroupItem value="alternating" id="mode-alternating" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="mode-alternating" className="text-sm font-semibold cursor-pointer flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" /> Alternado (Round-Robin)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      O sistema alterna automaticamente entre os provedores ativos a cada N requisições.
                      Útil para distribuir carga e reduzir custos.
                    </p>
                    {config.mode === "alternating" && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <Label className="text-xs font-medium mb-2 block">
                            Trocar a cada <strong>{config.alternatingInterval}</strong> requisições
                          </Label>
                          <Slider
                            min={1}
                            max={50}
                            step={1}
                            value={[config.alternatingInterval]}
                            onValueChange={([v]) => setConfig((prev) => ({ ...prev, alternatingInterval: v }))}
                            className="w-full"
                          />
                          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            <span>1 req</span>
                            <span>50 req</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">Sequência:</span>
                          {enabledProviders.map((p, i) => (
                            <span key={p.id} className="flex items-center gap-1">
                              <Badge variant="outline" className="text-xs">
                                {p.logo} {p.name}
                              </Badge>
                              {i < enabledProviders.length - 1 && (
                                <RotateCcw className="h-3 w-3 text-muted-foreground" />
                              )}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
                          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          <p className="text-xs text-muted-foreground">
                            No modo alternado, ative apenas provedores com chaves configuradas para evitar erros.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Modelo específico por provedor ativo - não mostra para provedores com gestão externa */}
          {config.mode === "manual" && activeProvider && !activeProvider.externalModelManagement && activeProvider.models.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Modelo de {activeProvider.name}</CardTitle>
                <CardDescription>Selecione o modelo específico a ser usado</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {activeProvider.models.map((model) => (
                    <button
                      key={model}
                      onClick={() => setConfig((prev) => ({ ...prev, activeModel: model }))}
                      className={cn(
                        "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors",
                        config.activeModel === model
                          ? "border-primary bg-primary/10 font-medium text-primary"
                          : "hover:border-primary/40 hover:bg-accent"
                      )}
                    >
                      <span>{model}</span>
                      {config.activeModel === model && <CheckCircle className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {config.mode === "manual" && activeProvider?.externalModelManagement && (
            <Card className="border-muted">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Modelo gerenciado pelo {activeProvider.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      O Abacus AI seleciona automaticamente o melhor modelo disponível com base na sua configuração de conta e no deployment configurado na plataforma deles. Não é necessário escolher um modelo aqui.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ===== ABA PROVEDORES ===== */}
        <TabsContent value="providers" className="space-y-4 pt-4">
          <p className="text-sm text-muted-foreground">
            Ative ou desative provedores. No modo alternado, apenas os ativos serão usados na rotação.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {AI_PROVIDERS.map((provider) => {
              const isEnabled = config.enabledProviders.includes(provider.id);
              const hasKey = provider.nativeKey || !!config.customApiKeys[provider.id];
              return (
                <Card
                  key={provider.id}
                  className={cn(
                    "transition-all",
                    isEnabled && "border-primary/30",
                    !hasKey && provider.apiKeyRequired && "opacity-70"
                  )}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white text-xl shrink-0", provider.color)}>
                          {provider.logo}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{provider.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{provider.description}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {provider.nativeKey ? (
                              <Badge variant="secondary" className="text-[10px]">
                                <Zap className="h-2.5 w-2.5 mr-1" /> Nativo
                              </Badge>
                            ) : hasKey ? (
                              <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                <CheckCircle className="h-2.5 w-2.5 mr-1" /> Chave configurada
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700">
                                <Key className="h-2.5 w-2.5 mr-1" /> Chave necessária
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={() => toggleProvider(provider.id)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* ===== ABA CHAVES ===== */}
        <TabsContent value="keys" className="space-y-4 pt-4">
          <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              Gemini e OpenAI/ChatGPT funcionam sem chave própria via Lovable AI nativo.
              Os provedores abaixo requerem uma chave de API externa.
            </p>
          </div>
          {AI_PROVIDERS.filter((p) => p.apiKeyRequired).map((provider) => (
            <Card key={provider.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{provider.logo}</span>
                  <CardTitle className="text-sm">{provider.name}</CardTitle>
                  {config.customApiKeys[provider.id] && (
                     <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ml-auto">
                       <CheckCircle className="h-2.5 w-2.5 mr-1" /> Configurada
                     </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showApiKey[provider.id] ? "text" : "password"}
                      placeholder={`Cole sua chave de API do ${provider.name}...`}
                      value={apiKeyInputs[provider.id] ?? (config.customApiKeys[provider.id] ? "••••••••••••••••" : "")}
                      onChange={(e) => setApiKeyInputs((prev) => ({ ...prev, [provider.id]: e.target.value }))}
                      className="pr-16 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey((p) => ({ ...p, [provider.id]: !p[provider.id] }))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showApiKey[provider.id] ? "ocultar" : "ver"}
                    </button>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => saveApiKey(provider.id)}>
                    <Key className="h-3.5 w-3.5 mr-1" /> Salvar
                  </Button>
                </div>
                <Separator />
                <div>
                  <p className="text-xs font-medium mb-1">Modelos disponíveis:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.models.map((m) => (
                      <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Botão salvar */}
      <div className="flex justify-end pt-2">
        <Button onClick={saveConfig} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
}
