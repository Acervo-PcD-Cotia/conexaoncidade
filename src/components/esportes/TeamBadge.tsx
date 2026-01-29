import { cn } from "@/lib/utils";

interface TeamBadgeProps {
  name: string;
  logoUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-16 w-16",
};

const textSizeClasses = {
  xs: "text-[10px]",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function TeamBadge({ 
  name, 
  logoUrl, 
  size = "md", 
  showName = false,
  className 
}: TeamBadgeProps) {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div 
        className={cn(
          "rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0",
          sizeClasses[size]
        )}
      >
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={name} 
            className="h-full w-full object-contain p-0.5"
            loading="lazy"
          />
        ) : (
          <span className={cn("font-bold text-muted-foreground", textSizeClasses[size])}>
            {initials}
          </span>
        )}
      </div>
      {showName && (
        <span className={cn("font-medium truncate", textSizeClasses[size])}>
          {name}
        </span>
      )}
    </div>
  );
}
