import { Link } from "react-router-dom";
import { TrendingUp, Eye } from "lucide-react";
import { useMostReadNews } from "@/hooks/useNews";

export function MostReadSection() {
  const { data: mostRead, isLoading } = useMostReadNews(10);

  if (isLoading) {
    return (
      <section className="container py-4">
        <div className="rounded-lg bg-card border border-border p-4">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 bg-muted rounded" />
                <div className="flex-1 h-4 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!mostRead || mostRead.length === 0) return null;

  return (
    <section className="container py-4">
      <div className="rounded-lg bg-card border border-border">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
            Mais Lidas
          </h2>
        </div>

        {/* Rankings grid */}
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Column 1 - Top 5 */}
          <div className="divide-y divide-border lg:border-r lg:border-border">
            {mostRead.slice(0, 5).map((item, index) => (
              <Link
                key={item.id}
                to={`/noticia/${item.slug}`}
                className="group flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
              >
                {/* Ranking number */}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary/10 font-heading text-lg font-bold text-primary">
                  {index + 1}
                </span>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    {item.view_count.toLocaleString("pt-BR")} visualizações
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Column 2 - 6-10 (more compact) */}
          <div className="divide-y divide-border bg-muted/20">
            {mostRead.slice(5, 10).map((item, index) => (
              <Link
                key={item.id}
                to={`/noticia/${item.slug}`}
                className="group flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50"
              >
                {/* Ranking number */}
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted font-heading text-xs font-bold text-muted-foreground">
                  {index + 6}
                </span>
                {/* Title only */}
                <h3 className="text-sm font-medium leading-snug line-clamp-1 group-hover:text-primary">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
