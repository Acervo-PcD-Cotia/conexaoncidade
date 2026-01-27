import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompactListItem {
  id: string;
  title: string;
  status?: string;
  meta?: string;
  href?: string;
  icon?: LucideIcon;
  iconColor?: string;
  rightValue?: string | number;
}

interface CompactListProps {
  items: CompactListItem[];
  emptyMessage?: string;
  className?: string;
}

export function CompactList({ items, emptyMessage = "Nenhum item encontrado", className }: CompactListProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">{emptyMessage}</p>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item) => {
        const content = (
          <div
            key={item.id}
            className={cn(
              "flex items-center justify-between py-2 px-2 -mx-2 rounded-md transition-colors",
              item.href && "hover:bg-muted/50 cursor-pointer"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {item.icon && (
                <item.icon className={cn("h-4 w-4 shrink-0", item.iconColor || "text-muted-foreground")} />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium line-clamp-1">{item.title}</p>
                {item.meta && (
                  <p className="text-[10px] text-muted-foreground">{item.meta}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {item.status && (
                <StatusBadge status={item.status} />
              )}
              {item.rightValue !== undefined && (
                <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                  {item.rightValue}
                </span>
              )}
            </div>
          </div>
        );

        return item.href ? (
          <Link key={item.id} to={item.href}>
            {content}
          </Link>
        ) : (
          <div key={item.id}>{content}</div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-money/10 text-money",
    draft: "bg-muted text-muted-foreground",
    scheduled: "bg-brand/10 text-brand",
    review: "bg-primary/10 text-primary",
  };

  const labels: Record<string, string> = {
    published: "Publicado",
    draft: "Rascunho",
    scheduled: "Agendado",
    review: "Revisão",
  };

  return (
    <span className={cn(
      "rounded-full px-2 py-0.5 text-[10px] font-medium",
      styles[status] || styles.draft
    )}>
      {labels[status] || status}
    </span>
  );
}
