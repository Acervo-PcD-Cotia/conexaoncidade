import { Radio, Tv, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Switch } from "@/components/ui/switch";
import { DashboardPanel } from "./DashboardPanel";
import { useSiteTemplateConfig, useToggleModule } from "@/hooks/useSiteTemplateConfig";
import { usePortalTemplate } from "@/hooks/usePortalTemplates";
import { CORE_MODULES, type ModuleKey } from "@/types/portal-templates";

const STREAMING_MODULES: { key: ModuleKey; label: string; icon: React.ElementType }[] = [
  { key: "web_radio", label: "Web Radio", icon: Radio },
  { key: "web_tv", label: "Web TV", icon: Tv },
];

export function StreamingTogglePanel() {
  const { data: siteConfig, isLoading: configLoading } = useSiteTemplateConfig();
  const { data: template } = usePortalTemplate(siteConfig?.template_id);
  const toggleModule = useToggleModule();

  const defaultModules = (template?.default_modules || []) as string[];
  const modulesOverrides = (siteConfig?.modules_overrides || {}) as Record<string, boolean>;

  const getModuleState = (moduleKey: ModuleKey): boolean => {
    if (CORE_MODULES.includes(moduleKey)) return true;
    if (moduleKey in modulesOverrides) return modulesOverrides[moduleKey];
    return defaultModules.includes(moduleKey);
  };

  return (
    <DashboardPanel
      title="Rádio e TV"
      description="Controle rápido"
      icon={Radio}
      iconColor="text-primary"
      action={
        <Link to="/admin/settings/modules" className="text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
        </Link>
      }
    >
      <div className="space-y-3">
        {STREAMING_MODULES.map(({ key, label, icon: Icon }) => {
          const enabled = getModuleState(key);
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{label}</span>
              </div>
              <Switch
                checked={enabled}
                disabled={configLoading || toggleModule.isPending}
                onCheckedChange={(checked) => toggleModule.mutateAsync({ moduleKey: key, enabled: checked })}
              />
            </div>
          );
        })}
      </div>
    </DashboardPanel>
  );
}
