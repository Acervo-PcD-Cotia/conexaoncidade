import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OfficialPostBadgeProps {
  size?: "sm" | "md";
}

export function OfficialPostBadge({ size = "sm" }: OfficialPostBadgeProps) {
  return (
    <Badge 
      variant="secondary" 
      className={`bg-primary/10 text-primary border-primary/20 ${
        size === "sm" ? "text-xs py-0" : "text-sm"
      }`}
    >
      <Shield className={size === "sm" ? "h-3 w-3 mr-1" : "h-4 w-4 mr-1.5"} />
      Post Oficial
    </Badge>
  );
}
