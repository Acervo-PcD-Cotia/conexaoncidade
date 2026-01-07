import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNews } from "@/hooks/useNews";

export function QuickNotes() {
  // Get news with short or no excerpt (quick notes style)
  const { data: news, isLoading } = useNews(8);

  if (isLoading) {
    return (
      <section className="container py-4">
        <div className="rounded-lg bg-secondary/30 p-4">
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-6 bg-muted rounded w-3/4" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  // Filter for shorter news or just take the latest ones
  const quickItems = news.slice(0, 8);

  return (
    <section className="container py-4">
      <div className="rounded-lg bg-secondary/20 border border-border">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-secondary/30">
          <Zap className="h-4 w-4 text-accent" />
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
            Notas Rápidas
          </h2>
        </div>

        {/* Quick notes grid */}
        <div className="grid gap-0 divide-y divide-border sm:grid-cols-2 sm:divide-y-0">
          {quickItems.map((item, index) => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className={`group flex items-center justify-between gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? "sm:border-r sm:border-border" : ""
              }`}
            >
              <h3 className="text-sm font-medium leading-tight line-clamp-1 group-hover:text-primary flex-1">
                {item.title}
              </h3>
              <Badge
                variant="secondary"
                className="shrink-0 text-[10px] px-1.5 py-0"
                style={{
                  backgroundColor: item.category?.color ? `${item.category.color}20` : undefined,
                  color: item.category?.color || undefined,
                  borderColor: item.category?.color || undefined,
                }}
              >
                {item.category?.name || "Geral"}
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
