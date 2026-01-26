import { LucideIcon, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: string;
  onClick: () => void;
  disabled?: boolean;
}

export function AIToolCard({
  name,
  description,
  icon: Icon,
  category,
  onClick,
  disabled = false,
}: AIToolCardProps) {
  const categoryColors: Record<string, string> = {
    content: "bg-blue-500/10 text-blue-500",
    partner: "bg-green-500/10 text-green-500",
    pcd: "bg-purple-500/10 text-purple-500",
    analytics: "bg-orange-500/10 text-orange-500",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group flex flex-col gap-3 rounded-lg border bg-card p-4 text-left transition-all duration-200",
        "hover:border-primary/50 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            categoryColors[category] || "bg-muted"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <ArrowRight
          className={cn(
            "h-4 w-4 text-muted-foreground opacity-0 transition-all duration-200",
            "group-hover:opacity-100 group-hover:translate-x-1"
          )}
        />
      </div>

      {/* Content */}
      <div className="space-y-1">
        <h3 className="font-medium">{name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {description}
        </p>
      </div>
    </button>
  );
}
