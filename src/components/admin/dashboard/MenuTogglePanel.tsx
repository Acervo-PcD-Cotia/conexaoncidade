import { useModuleEnabled } from "@/hooks/useModuleEnabled";
import { useToggleModule } from "@/hooks/useSiteTemplateConfig";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Trophy, Accessibility, Users, GraduationCap, ShieldCheck, Bus, Home, type LucideIcon } from "lucide-react";
import type { ModuleKey } from "@/types/portal-templates";

interface MenuItem {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

const MENU_ITEMS: MenuItem[] = [
  { key: "menu_google", label: "Você no Google", icon: MapPin, colorClass: "text-blue-600 dark:text-blue-400" },
  { key: "menu_brasileirao", label: "Brasileirão", icon: Trophy, colorClass: "text-emerald-600 dark:text-emerald-400" },
  { key: "menu_censo", label: "Censo SP", icon: Accessibility, colorClass: "text-purple-600 dark:text-purple-400" },
  { key: "menu_conexoes", label: "Conexões", icon: Users, colorClass: "text-pink-600 dark:text-pink-400" },
  { key: "menu_enem", label: "ENEM", icon: GraduationCap, colorClass: "text-indigo-600 dark:text-indigo-400" },
  { key: "menu_fakenews", label: "Fake News", icon: ShieldCheck, colorClass: "text-green-600 dark:text-green-400" },
  { key: "menu_escolar", label: "Escolar", icon: Bus, colorClass: "text-amber-600 dark:text-amber-400" },
  { key: "menu_imoveis", label: "Imóveis", icon: Home, colorClass: "text-teal-600 dark:text-teal-400" },
];

function MenuToggleRow({ item }: { item: MenuItem }) {
  const isEnabled = useModuleEnabled(item.key);
  const toggleModule = useToggleModule();

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <item.icon className={`h-4 w-4 ${item.colorClass}`} />
        <span className="text-xs font-medium">{item.label}</span>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={(checked) => toggleModule.mutate({ moduleKey: item.key, enabled: checked })}
        className="scale-90"
      />
    </div>
  );
}

export function MenuTogglePanel() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Menus Especiais</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border">
          {MENU_ITEMS.map((item) => (
            <MenuToggleRow key={item.key} item={item} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
