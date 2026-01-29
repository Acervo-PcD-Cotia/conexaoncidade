import { Palette, Info, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/admin/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AppearanceSettings() {
  const { mode, preset, resolvedTheme } = useTheme();

  const presetLabels = {
    institutional: "Institucional",
    tech: "Tech-Startup",
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          Aparência
        </h1>
        <p className="text-muted-foreground mt-1">
          Personalize a aparência do painel administrativo
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tema do Dashboard</CardTitle>
          <CardDescription>
            Escolha como o painel deve ser exibido
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ThemeToggle variant="cards" />

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {mode === "system" ? (
                <>
                  O modo <strong>Sistema</strong> detecta automaticamente a preferência do seu dispositivo.
                  Atualmente: <strong className="capitalize">{resolvedTheme === "dark" ? "Escuro" : "Claro"}</strong>
                </>
              ) : (
                <>
                  Modo atual: <strong className="capitalize">{mode === "dark" ? "Escuro" : "Claro"}</strong>
                </>
              )}
              {" • "}
              Estilo: <strong>{presetLabels[preset]}</strong>
            </AlertDescription>
          </Alert>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pré-visualização
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border bg-card shadow-sm">
                <div className="h-2 w-16 rounded bg-primary mb-2" />
                <div className="h-2 w-24 rounded bg-muted-foreground/20" />
                <div className="h-2 w-20 rounded bg-muted-foreground/20 mt-1" />
              </div>
              <div className="p-4 rounded-xl border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <div className="h-4 w-4 rounded bg-primary" />
                  </div>
                  <div>
                    <div className="h-2 w-12 rounded bg-foreground/80" />
                    <div className="h-1.5 w-8 rounded bg-muted-foreground/40 mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Identidade Visual</CardTitle>
          <CardDescription>
            O Portal Conexão na Cidade utiliza laranja como cor de destaque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary" title="Primary (Laranja)" />
              <div className="h-10 w-10 rounded-lg bg-sidebar-background" title="Brand (Azul Petróleo)" />
              <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: "hsl(262 83% 58%)" }} title="AI (Roxo)" />
              <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: "hsl(142 76% 36%)" }} title="Money (Verde)" />
            </div>
            <div className="text-sm text-muted-foreground">
              Cores semânticas do design system
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
