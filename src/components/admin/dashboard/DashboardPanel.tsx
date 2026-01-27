import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardPanelProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DashboardPanel({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  action,
  children,
  className,
  contentClassName,
}: DashboardPanelProps) {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="p-4 border-b border-border flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          {Icon && (
            <div className="p-1.5 rounded-md bg-muted">
              <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent className={cn("p-4", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
