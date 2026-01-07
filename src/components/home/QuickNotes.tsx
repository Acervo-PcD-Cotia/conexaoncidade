import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNews } from "@/hooks/useNews";

export function QuickNotes() {
  // Get news with short or no excerpt (quick notes style)
  const { data: news, isLoading } = useNews(12);

  if (isLoading) {
    return (
      <section className="container py-2">
        <div className="bg-muted/40 border-y border-border p-3">
          <div className="animate-pulse space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-3/4" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  // Filter for shorter news or just take the latest ones
  const quickItems = news.slice(0, 12);

  return (
    <section className="container py-2">
      <div className="bg-muted/30 border-y border-border">
        {/* Header - more compact */}
        <div className="flex items-center gap-2 border-b border-border px-3 py-1.5 bg-muted/50">
          <Zap className="h-3 w-3 text-primary" />
          <h2 className="font-heading text-[11px] font-bold uppercase tracking-wider">
            Notas Rápidas
          </h2>
        </div>

        {/* Quick notes grid - 3 columns, ultra dense */}
        <div className="grid gap-0 divide-y divide-border/50 sm:grid-cols-2 lg:grid-cols-3 sm:divide-y-0">
          {quickItems.map((item, index) => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className={`group flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-muted/50 ${
                index % 3 !== 2 ? "lg:border-r lg:border-border/50" : ""
              } ${index % 2 === 0 ? "sm:border-r sm:border-border/50 lg:border-r-0" : "sm:border-r-0"} ${
                index % 3 !== 2 ? "lg:border-r" : ""
              }`}
              style={{
                borderRightWidth: index % 3 !== 2 ? "1px" : "0",
              }}
            >
              <span
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: item.category?.color || "hsl(var(--primary))" }}
              />
              <h3 className="text-[11px] font-medium leading-tight line-clamp-1 group-hover:text-primary flex-1">
                {item.title}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
