import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradientKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: string; positive?: boolean };
  icon: LucideIcon;
  gradient: "blue" | "green" | "orange" | "purple";
  className?: string;
  variant?: "gradient" | "premium";
}

// Gradient variant - colorful cards
const gradients = {
  blue: "bg-gradient-to-br from-sky-50 to-sky-100/30 dark:from-sky-950/30 dark:to-sky-900/10 border-sky-200/50 dark:border-sky-800/30",
  green: "bg-gradient-to-br from-emerald-50 to-emerald-100/30 dark:from-emerald-950/30 dark:to-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/30",
  orange: "bg-gradient-to-br from-orange-50 to-orange-100/30 dark:from-orange-950/30 dark:to-orange-900/10 border-orange-200/50 dark:border-orange-800/30",
  purple: "bg-gradient-to-br from-violet-50 to-violet-100/30 dark:from-violet-950/30 dark:to-violet-900/10 border-violet-200/50 dark:border-violet-800/30",
};

// Gradient variant icon colors
const iconColors = {
  blue: "text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/50",
  green: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
  orange: "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/50",
  purple: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/50",
};

// Premium variant - neutral cards with primary accent
const premiumStyle = "bg-card border-border hover:shadow-md transition-shadow";
const premiumIconStyle = "text-primary bg-primary/10";

export function GradientKpiCard({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  gradient,
  className,
  variant = "premium",
}: GradientKpiCardProps) {
  const formattedValue = typeof value === "number"
    ? value >= 1000000
      ? `${(value / 1000000).toFixed(1)}M`
      : value >= 1000
      ? `${(value / 1000).toFixed(1)}K`
      : value.toLocaleString("pt-BR")
    : value;

  const isPremium = variant === "premium";

  return (
    <Card className={cn(
      "border",
      isPremium ? premiumStyle : gradients[gradient],
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-3xl font-bold tabular-nums text-foreground">
              {formattedValue}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-medium",
                trend.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
              )}>
                {trend.positive ? "↑" : "↓"} {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "p-2.5 rounded-lg",
            isPremium ? premiumIconStyle : iconColors[gradient]
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
