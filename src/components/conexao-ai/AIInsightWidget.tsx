import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { InsightData } from "@/types/conexao-ai";

interface AIInsightWidgetProps {
  title: string;
  data: InsightData;
  icon?: React.ReactNode;
  className?: string;
}

export function AIInsightWidget({
  title,
  data,
  icon,
  className,
}: AIInsightWidgetProps) {
  const TrendIcon = data.trend === "up" 
    ? TrendingUp 
    : data.trend === "down" 
    ? TrendingDown 
    : Minus;

  const trendColor = data.trend === "up"
    ? "text-green-500"
    : data.trend === "down"
    ? "text-red-500"
    : "text-muted-foreground";

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>

      {/* Value */}
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold">
          {typeof data.value === "number"
            ? data.value.toLocaleString("pt-BR")
            : data.value}
        </span>
        {data.change !== undefined && (
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{data.change > 0 ? "+" : ""}{data.change}%</span>
          </div>
        )}
      </div>

      {/* Label */}
      {data.label && (
        <p className="mt-1 text-xs text-muted-foreground">{data.label}</p>
      )}
    </div>
  );
}
