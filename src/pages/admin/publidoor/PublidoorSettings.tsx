import { useState, useEffect } from "react";
import { Save, Settings, Eye, Clock, Shield, MessageSquare, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePublidoorSettings, useUpdatePublidoorSetting } from "@/hooks/usePublidoor";
import { toast } from "sonner";

interface SettingsState {
  max_per_page: number;
  min_display_time: number;
  exclusivity_enabled: boolean;
  require_brand_badge: boolean;
  brand_badge_text: string;
  analytics_enabled: boolean;
  whatsapp_integration: boolean;
}

export default function PublidoorSettings() {
  const { data: settings, isLoading } = usePublidoorSettings();
  const updateMutation = useUpdatePublidoorSetting();

  const [localSettings, setLocalSettings] = useState<SettingsState>({
    max_per_page: 3,
    min_display_time: 5,
    exclusivity_enabled: true,
    require_brand_badge: true,
    brand_badge_text: "Conteúdo de Marca",
    analytics_enabled: true,
    whatsapp_integration: true,
  });

  useEffect(() => {
    if (settings) {
      const parsed: SettingsState = {
        max_per_page: 3,
        min_display_time: 5,
        exclusivity_enabled: true,
        require_brand_badge: true,
        brand_badge_text: "Conteúdo de Marca",
        analytics_enabled: true,
        whatsapp_integration: true,
      };

      settings.forEach((s) => {
        const value = s.value;
        switch (s.key) {
          case "max_per_page":
            parsed.max_per_page = typeof value === "number" ? value : parseInt(String(value)) || 3;
            break;
          case "min_display_time":
            parsed.min_display_time = typeof value === "number" ? value : parseInt(String(value)) || 5;
            break;
          case "exclusivity_enabled":
            parsed.exclusivity_enabled = value === true || value === "true";
            break;
          case "require_brand_badge":
            parsed.require_brand_badge = value === true || value === "true";
            break;
          case "brand_badge_text":
            parsed.brand_badge_text = String(value).replace(/"/g, "") || "Conteúdo de Marca";
            break;
          case "analytics_enabled":
            parsed.analytics_enabled = value === true || value === "true";
            break;
          case "whatsapp_integration":
            parsed.whatsapp_integration = value === true || value === "true";
            break;
        }
      });

      setLocalSettings(parsed);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await Promise.all([
        updateMutation.mutateAsync({ key: "max_per_page", value: localSettings.max_per_page }),
        updateMutation.mutateAsync({ key: "min_display_time", value: localSettings.min_display_time }),
        updateMutation.mutateAsync({ key: "exclusivity_enabled", value: localSettings.exclusivity_enabled }),
        updateMutation.mutateAsync({ key: "require_brand_badge", value: localSettings.require_brand_badge }),
        updateMutation.mutateAsync({ key: "brand_badge_text", value: localSettings.brand_badge_text }),
        updateMutation.mutateAsync({ key: "analytics_enabled", value: localSettings.analytics_enabled }),
        updateMutation.mutateAsync({ key: "whatsapp_integration", value: localSettings.whatsapp_integration }),
      ]);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar configurações");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Carregando configurações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
          <p className="text-muted-foreground">Regras globais do módulo Publidoor</p>
        </div>
        <Button onClick={handleSave} disabled={updateMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          Salvar Alterações
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Exibição
            </CardTitle>
            <CardDescription>Configurações de exibição dos Publidoors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max_per_page">Máximo por Página</Label>
              <Input
                id="max_per_page"
                type="number"
                min={1}
                max={10}
                value={localSettings.max_per_page}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    max_per_page: parseInt(e.target.value) || 3,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Quantidade máxima de Publidoors exibidos por página
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_display_time">Tempo Mínimo (segundos)</Label>
              <Input
                id="min_display_time"
                type="number"
                min={1}
                max={60}
                value={localSettings.min_display_time}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    min_display_time: parseInt(e.target.value) || 5,
                  }))
                }
              />
              <p className="text-xs text-muted-foreground">
                Tempo mínimo de exibição antes da rotação
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Exclusivity Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Exclusividade
            </CardTitle>
            <CardDescription>Controle de exclusividade de exibição</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Habilitar Exclusividade</Label>
                <p className="text-xs text-muted-foreground">
                  Permite configurar exclusividade por local
                </p>
              </div>
              <Switch
                checked={localSettings.exclusivity_enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, exclusivity_enabled: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Brand Badge Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Identificação
            </CardTitle>
            <CardDescription>Badge de identificação obrigatória</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Exigir Badge</Label>
                <p className="text-xs text-muted-foreground">
                  Exibe identificação visual obrigatória
                </p>
              </div>
              <Switch
                checked={localSettings.require_brand_badge}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, require_brand_badge: checked }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand_badge_text">Texto do Badge</Label>
              <Input
                id="brand_badge_text"
                value={localSettings.brand_badge_text}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, brand_badge_text: e.target.value }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Integrações
            </CardTitle>
            <CardDescription>Integrações e funcionalidades extras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Google Analytics</Label>
                <p className="text-xs text-muted-foreground">
                  Coleta de métricas de desempenho
                </p>
              </div>
              <Switch
                checked={localSettings.analytics_enabled}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, analytics_enabled: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>WhatsApp</Label>
                <p className="text-xs text-muted-foreground">
                  Integração com WhatsApp Business
                </p>
              </div>
              <Switch
                checked={localSettings.whatsapp_integration}
                onCheckedChange={(checked) =>
                  setLocalSettings((prev) => ({ ...prev, whatsapp_integration: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
