import { Link } from "react-router-dom";
import { TrendingUp, Eye } from "lucide-react";
import { useMostReadNews } from "@/hooks/useNews";

export function MostReadSection() {
  const { data: mostRead, isLoading } = useMostReadNews(10);

  if (isLoading) {
    return (
      <section className="container py-2">
        <div className="rounded-lg bg-card border border-border p-3">
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2">
                <div className="h-6 w-6 bg-muted rounded" />
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
    <section className="container py-2">
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        {/* Header with tabs */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-heading text-xs font-bold uppercase tracking-wide">
              Mais Lidas
            </h2>
          </div>
          <div className="flex gap-3 text-[10px]">
            <span className="font-bold text-primary border-b border-primary pb-0.5">Hoje</span>
            <span className="text-muted-foreground hover:text-foreground cursor-pointer">Semana</span>
          </div>
        </div>

        {/* Rankings grid */}
        <div className="grid gap-0 lg:grid-cols-2">
          {/* Column 1 - Top 5 */}
          <div className="divide-y divide-border lg:border-r lg:border-border">
            {mostRead.slice(0, 5).map((item, index) => (
              <Link
                key={item.id}
                to={`/noticia/${item.slug}`}
                className="group flex items-start gap-2 px-3 py-2 transition-colors hover:bg-muted/50"
              >
                {/* Ranking number */}
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary/10 font-heading text-sm font-bold text-primary">
                  {index + 1}
                </span>
                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium leading-snug line-clamp-2 group-hover:text-primary">
                    {item.title}
                  </h3>
                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Eye className="h-2.5 w-2.5" />
                    {item.view_count.toLocaleString("pt-BR")} views
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
                className="group flex items-center gap-2 px-3 py-1.5 transition-colors hover:bg-muted/50"
              >
                {/* Ranking number */}
                <span className="font-heading text-sm font-bold text-muted-foreground w-4">
                  {index + 6}
                </span>
                {/* Title only */}
                <h3 className="text-[11px] font-medium leading-snug line-clamp-1 group-hover:text-primary flex-1">
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
