import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  gradient?: string;
  disabled?: boolean;
}

export function AIActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  gradient = "from-primary/20 to-primary/5",
  disabled = false,
}: AIActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative flex flex-col items-start gap-4 rounded-xl border bg-card p-6 text-left transition-all duration-300",
        "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Background gradient on hover */}
      <div
        className={cn(
          "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          gradient
        )}
      />

      {/* Icon container */}
      <div
        className={cn(
          "relative z-10 flex h-12 w-12 items-center justify-center rounded-lg",
          "bg-primary/10 text-primary transition-transform duration-300",
          "group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="relative z-10 space-y-1">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      {/* Arrow indicator */}
      <div
        className={cn(
          "absolute bottom-4 right-4 opacity-0 transition-all duration-300",
          "group-hover:opacity-100 group-hover:translate-x-1"
        )}
      >
        <svg
          className="h-5 w-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
