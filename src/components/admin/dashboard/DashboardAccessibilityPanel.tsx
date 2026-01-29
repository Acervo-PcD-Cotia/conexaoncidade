import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Accessibility, 
  Volume2, 
  ZoomIn, 
  ZoomOut, 
  Eye, 
  Hand,
  Settings,
} from "lucide-react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function DashboardAccessibilityPanel() {
  const { settings, updateSetting, increaseFontSize, decreaseFontSize } = useAccessibility();

  const handleReadPage = () => {
    const mainContent = document.querySelector("main")?.textContent || "";
    const utterance = new SpeechSynthesisUtterance(
      mainContent.slice(0, 500) + "..."
    );
    utterance.lang = "pt-BR";
    speechSynthesis.speak(utterance);
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Accessibility className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Acessibilidade</h3>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* VLibras Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Hand className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="vlibras" className="text-sm">VLibras</Label>
          </div>
          <Switch
            id="vlibras"
            checked={settings.vlibrasActive}
            onCheckedChange={(checked) => updateSetting("vlibrasActive", checked)}
          />
        </div>

        {/* Read Page Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={handleReadPage}
        >
          <Volume2 className="h-4 w-4" />
          Ler Página
        </Button>

        {/* Font Size Controls */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Tamanho da Fonte</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
              onClick={decreaseFontSize}
            >
              <ZoomOut className="h-4 w-4 mr-1" />
              A-
            </Button>
            <span className="text-xs font-medium w-16 text-center capitalize">
              {settings.fontSize === "normal" ? "100%" : settings.fontSize === "large" ? "125%" : "150%"}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 h-8"
              onClick={increaseFontSize}
            >
              <ZoomIn className="h-4 w-4 mr-1" />
              A+
            </Button>
          </div>
        </div>

        {/* High Contrast Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="contrast" className="text-sm">Alto Contraste</Label>
          </div>
          <Switch
            id="contrast"
            checked={settings.highContrast}
            onCheckedChange={(checked) => updateSetting("highContrast", checked)}
          />
        </div>

        {/* Settings Link */}
        <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground" asChild>
          <Link to="/admin/settings/accessibility">
            <Settings className="h-4 w-4" />
            Configurações de Acessibilidade
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
