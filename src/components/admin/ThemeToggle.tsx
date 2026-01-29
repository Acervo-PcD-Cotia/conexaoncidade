import { Sun, Moon, Monitor, Check, Building2, Sparkles } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ThemeMode, ThemePreset } from "@/types/theme";

interface ThemeToggleProps {
  variant?: "dropdown" | "cards";
  className?: string;
}

const modeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Claro", icon: Sun },
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "system", label: "Sistema", icon: Monitor },
];

const presetOptions: { value: ThemePreset; label: string; icon: typeof Building2; description: string }[] = [
  { value: "institutional", label: "Institucional", icon: Building2, description: "Suave e profissional" },
  { value: "tech", label: "Tech-Startup", icon: Sparkles, description: "Moderno e contrastado" },
];

export function ThemeToggle({ variant = "dropdown", className }: ThemeToggleProps) {
  const { mode, setMode, preset, setPreset, resolvedTheme } = useTheme();

  if (variant === "cards") {
    return (
      <div className={cn("space-y-6", className)}>
        {/* Mode Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-foreground">Modo de Cores</h4>
          <div className="grid grid-cols-3 gap-3">
            {modeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = mode === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setMode(option.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    "hover:border-primary/50 hover:bg-muted/50",
                    isActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card"
                  )}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "p-3 rounded-full",
                    isActive ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preset Selection */}
        <div>
          <h4 className="text-sm font-medium mb-3 text-foreground">Estilo Visual</h4>
          <div className="grid grid-cols-2 gap-3">
            {presetOptions.map((option) => {
              const Icon = option.icon;
              const isActive = preset === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setPreset(option.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                    "hover:border-primary/50 hover:bg-muted/50",
                    isActive 
                      ? "border-primary bg-primary/5" 
                      : "border-border bg-card"
                  )}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className={cn(
                    "p-3 rounded-full",
                    isActive ? "bg-primary/10" : "bg-muted"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )} />
                  </div>
                  <span className={cn(
                    "text-sm font-medium",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Dropdown variant
  const CurrentIcon = resolvedTheme === "dark" ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("h-9 w-9", className)}>
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Modo</DropdownMenuLabel>
        {modeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setMode(option.value)}
              className={cn(
                "flex items-center gap-2",
                mode === option.value && "bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
              {mode === option.value && (
                <Check className="ml-auto h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs text-muted-foreground">Estilo Visual</DropdownMenuLabel>
        {presetOptions.map((option) => {
          const Icon = option.icon;
          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setPreset(option.value)}
              className={cn(
                "flex items-center gap-2",
                preset === option.value && "bg-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{option.label}</span>
              {preset === option.value && (
                <Check className="ml-auto h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
