import { cn } from "@/lib/utils";
import { RadioStreamStatus } from "../types";

interface StatusBadgeProps {
  state: RadioStreamStatus["state"];
  className?: string;
}

const stateConfig = {
  online: {
    label: "Online",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
    dot: "bg-green-500",
  },
  offline: {
    label: "Offline",
    className: "bg-muted text-muted-foreground border-muted-foreground/20",
    dot: "bg-muted-foreground",
  },
  starting: {
    label: "Iniciando",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    dot: "bg-yellow-500 animate-pulse",
  },
  error: {
    label: "Erro",
    className: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
};

export function StatusBadge({ state, className }: StatusBadgeProps) {
  const config = stateConfig[state];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border",
        config.className,
        className
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
}
