import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type TvState = "online" | "offline" | "starting" | "error";

interface StatusBadgeProps {
  state: TvState;
  className?: string;
}

const stateConfig: Record<TvState, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  online: { label: "Online", variant: "default" },
  offline: { label: "Offline", variant: "secondary" },
  starting: { label: "Iniciando...", variant: "outline" },
  error: { label: "Erro", variant: "destructive" },
};

export function StatusBadge({ state, className }: StatusBadgeProps) {
  const config = stateConfig[state];
  
  return (
    <Badge 
      variant={config.variant} 
      className={cn(
        state === "online" && "bg-green-500 hover:bg-green-600",
        state === "starting" && "animate-pulse",
        className
      )}
    >
      {state === "online" && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-white animate-pulse" />
      )}
      {config.label}
    </Badge>
  );
}
