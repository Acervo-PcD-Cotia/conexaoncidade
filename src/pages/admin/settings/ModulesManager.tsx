import { useSiteTemplateConfig, useToggleModule } from "@/hooks/useSiteTemplateConfig";
import { usePortalTemplate } from "@/hooks/usePortalTemplates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Info, Lock } from "lucide-react";
import * as Icons from "lucide-react";
import { CORE_MODULES, MODULE_METADATA, type ModuleKey } from "@/types/portal-templates";

export default function ModulesManager() {
  const { data: siteConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: template, isLoading: templateLoading } = usePortalTemplate(siteConfig?.template_id);
  const toggleModule = useToggleModule();

  if (configLoading || templateLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const defaultModules = (template?.default_modules || []) as string[];
  const modulesOverrides = (siteConfig?.modules_overrides || {}) as Record<string, boolean>;

  const getModuleState = (moduleKey: ModuleKey): boolean => {
    // Core modules are always on
    if (CORE_MODULES.includes(moduleKey)) return true;
    // Check for override
    if (moduleKey in modulesOverrides) return modulesOverrides[moduleKey];
    // Check template default
    return defaultModules.includes(moduleKey);
  };

  const handleToggle = async (moduleKey: ModuleKey, enabled: boolean) => {
    await toggleModule.mutateAsync({ moduleKey, enabled });
  };

  const allModuleKeys = Object.keys(MODULE_METADATA) as ModuleKey[];
  const coreModuleKeys = allModuleKeys.filter((k) => CORE_MODULES.includes(k));
  const optionalModuleKeys = allModuleKeys.filter((k) => !CORE_MODULES.includes(k));

  const renderModuleCard = (moduleKey: ModuleKey, isCore: boolean) => {
    const meta = MODULE_METADATA[moduleKey];
    const IconComponent = (Icons as unknown as Record<string, React.ElementType>)[meta.icon];
    const isEnabled = getModuleState(moduleKey);
    const isFromTemplate = defaultModules.includes(moduleKey);
    const hasOverride = moduleKey in modulesOverrides;

    return (
      <div
        key={moduleKey}
        className="flex items-center justify-between p-4 border rounded-lg bg-card"
      >
        <div className="flex items-center gap-3">
          {IconComponent && (
            <div className="p-2 rounded-lg bg-muted">
              <IconComponent className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{meta.label}</span>
              {isCore && (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="h-3 w-3 mr-1" />
                  Core
                </Badge>
              )}
              {!isCore && isFromTemplate && !hasOverride && (
                <Badge variant="outline" className="text-xs">
                  Modelo
                </Badge>
              )}
              {hasOverride && (
                <Badge variant="default" className="text-xs">
                  Personalizado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{meta.description}</p>
          </div>
        </div>
        <Switch
          checked={isEnabled}
          onCheckedChange={(checked) => handleToggle(moduleKey, checked)}
          disabled={isCore || toggleModule.isPending}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Módulos do Portal</h1>
        <p className="text-muted-foreground">
          Ative ou desative funcionalidades do seu portal. Módulos desativados não aparecem no menu.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Módulos do <strong>CORE</strong> são essenciais e não podem ser desativados. 
          Módulos marcados como <strong>Modelo</strong> vêm do template selecionado.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>CORE (Obrigatório)</CardTitle>
          <CardDescription>
            Funcionalidades essenciais que estão sempre disponíveis.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {coreModuleKeys.map((key) => renderModuleCard(key, true))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Módulos Opcionais</CardTitle>
          <CardDescription>
            Ative ou desative conforme a necessidade do seu portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {optionalModuleKeys.map((key) => renderModuleCard(key, false))}
        </CardContent>
      </Card>
    </div>
  );
}
