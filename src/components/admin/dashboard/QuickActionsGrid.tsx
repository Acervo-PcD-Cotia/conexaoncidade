import { Link } from "react-router-dom";
import { LucideIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
  className?: string;
}

export function QuickActionsGrid({ actions, className }: QuickActionsGridProps) {
  return (
    <div className={cn("grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2", className)}>
      {actions.map((action) => (
        <Tooltip key={action.title}>
          <TooltipTrigger asChild>
            {action.href ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-14 w-full flex flex-col gap-1 hover:bg-muted"
                asChild
              >
                <Link to={action.href}>
                  <action.icon className="h-4 w-4 text-primary" />
                  <span className="text-[10px] text-muted-foreground truncate max-w-full">
                    {action.title}
                  </span>
                </Link>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-14 w-full flex flex-col gap-1 hover:bg-muted",
                  action.isLoading && "opacity-70 pointer-events-none"
                )}
                onClick={action.isLoading ? undefined : action.onClick}
              >
                {action.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <action.icon className="h-4 w-4 text-primary" />
                )}
                <span className="text-[10px] text-muted-foreground truncate max-w-full">
                  {action.isLoading ? "..." : action.title}
                </span>
              </Button>
            )}
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">{action.description}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
