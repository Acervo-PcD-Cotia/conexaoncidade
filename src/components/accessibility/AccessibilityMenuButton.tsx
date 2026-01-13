import { Accessibility, Minus, Plus, Eye, AlignJustify, BookOpen, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AccessibilityMenuButton() {
  const { 
    settings, 
    updateSetting, 
    increaseFontSize, 
    decreaseFontSize 
  } = useAccessibility();

  const fontSizeLabel = {
    normal: "Normal",
    large: "Grande",
    "extra-large": "Extra Grande",
  }[settings.fontSize];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          aria-label="Menu de acessibilidade"
          className="gap-2"
        >
          <Accessibility className="h-5 w-5" />
          <span className="hidden sm:inline">Acessibilidade</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Accessibility className="h-4 w-4" />
          Acessibilidade
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Font Size */}
        <div className="px-2 py-2">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Tamanho da fonte</span>
            <span className="text-xs text-muted-foreground">{fontSizeLabel}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={decreaseFontSize}
              disabled={settings.fontSize === "normal"}
              aria-label="Diminuir fonte"
            >
              <Minus className="h-4 w-4" />
              <span className="ml-1 text-xs">A</span>
            </Button>
            <span className="px-2 text-sm font-medium">A</span>
            <Button
              variant="outline"
              size="sm"
              onClick={increaseFontSize}
              disabled={settings.fontSize === "extra-large"}
              aria-label="Aumentar fonte"
            >
              <Plus className="h-4 w-4" />
              <span className="ml-1 text-lg">A</span>
            </Button>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* High Contrast */}
        <DropdownMenuItem 
          className="flex items-center justify-between"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Alto Contraste</span>
          </div>
          <Switch
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSetting("highContrast", checked)}
            aria-label="Alternar alto contraste"
          />
        </DropdownMenuItem>

        {/* Line Height */}
        <DropdownMenuItem 
          className="flex items-center justify-between"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2">
            <AlignJustify className="h-4 w-4" />
            <span>Espaçamento de linhas</span>
          </div>
          <Switch
            checked={settings.lineHeight === "large"}
            onCheckedChange={(checked) => 
              updateSetting("lineHeight", checked ? "large" : "normal")
            }
            aria-label="Alternar espaçamento de linhas"
          />
        </DropdownMenuItem>

        {/* Reading Mode */}
        <DropdownMenuItem 
          className="flex items-center justify-between"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Modo Leitura</span>
          </div>
          <Switch
            checked={settings.readingMode}
            onCheckedChange={(checked) => updateSetting("readingMode", checked)}
            aria-label="Alternar modo leitura"
          />
        </DropdownMenuItem>

        {/* VLibras */}
        <DropdownMenuItem 
          className="flex items-center justify-between"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex items-center gap-2">
            <Hand className="h-4 w-4" />
            <span>VLibras (Libras)</span>
          </div>
          <Switch
            checked={settings.vlibrasActive}
            onCheckedChange={(checked) => updateSetting("vlibrasActive", checked)}
            aria-label="Alternar VLibras"
          />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* TTS - Coming Soon */}
        <DropdownMenuItem disabled className="text-muted-foreground">
          <span className="text-xs">🔊 Ler página em voz alta — Em breve</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
