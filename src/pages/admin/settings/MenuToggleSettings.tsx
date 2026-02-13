import { useSiteTemplateConfig, useToggleModule } from "@/hooks/useSiteTemplateConfig";
import { useModuleEnabled } from "@/hooks/useModuleEnabled";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Trophy, Accessibility, Users, GraduationCap, ShieldCheck, Bus, Home, type LucideIcon } from "lucide-react";
import type { ModuleKey } from "@/types/portal-templates";

interface MenuToggleItem {
  key: ModuleKey;
  label: string;
  icon: LucideIcon;
  colorClass: string;
}

const MENU_ITEMS: MenuToggleItem[] = [
  { key: "menu_google", label: "Você no Google", icon: MapPin, colorClass: "text-blue-600 dark:text-blue-400" },
  { key: "menu_brasileirao", label: "Brasileirão", icon: Trophy, colorClass: "text-emerald-600 dark:text-emerald-400" },
  { key: "menu_censo", label: "Censo SP", icon: Accessibility, colorClass: "text-purple-600 dark:text-purple-400" },
  { key: "menu_conexoes", label: "Conexões", icon: Users, colorClass: "text-pink-600 dark:text-pink-400" },
  { key: "menu_enem", label: "ENEM", icon: GraduationCap, colorClass: "text-indigo-600 dark:text-indigo-400" },
  { key: "menu_fakenews", label: "Fake News", icon: ShieldCheck, colorClass: "text-green-600 dark:text-green-400" },
  { key: "menu_escolar", label: "Escolar", icon: Bus, colorClass: "text-amber-600 dark:text-amber-400" },
  { key: "menu_imoveis", label: "Imóveis", icon: Home, colorClass: "text-teal-600 dark:text-teal-400" },
];

function MenuToggleRow({ item }: { item: MenuToggleItem }) {
  const isEnabled = useModuleEnabled(item.key);
  const toggleModule = useToggleModule();

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-3">
        <item.icon className={`h-5 w-5 ${item.colorClass}`} />
        <span className="text-sm font-medium">{item.label}</span>
      </div>
      <Switch
        checked={isEnabled}
        onCheckedChange={(checked) => toggleModule.mutate({ moduleKey: item.key, enabled: checked })}
      />
    </div>
  );
}

export default function MenuToggleSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Menus do Site</h1>
        <p className="text-muted-foreground">Ative ou desative os botões do menu especial no site público.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Menus Especiais</CardTitle>
          <CardDescription>Controle quais botões coloridos aparecem na barra de serviços do site.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {MENU_ITEMS.map((item) => (
              <MenuToggleRow key={item.key} item={item} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
