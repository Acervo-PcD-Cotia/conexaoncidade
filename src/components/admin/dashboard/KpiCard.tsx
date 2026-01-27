import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  const formattedValue = typeof value === "number"
    ? value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : value.toLocaleString('pt-BR')
    : value;

  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold tabular-nums mt-1">{formattedValue}</p>
            {trend && (
              <p className={cn(
                "text-[10px] mt-0.5",
                trend.value >= 0 ? "text-money" : "text-destructive"
              )}>
                {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
