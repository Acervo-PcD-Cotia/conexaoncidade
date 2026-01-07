import { Link } from "react-router-dom";
import { Clock, RefreshCw } from "lucide-react";
import { useNews } from "@/hooks/useNews";

function formatTimeAgo(date: string) {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return past.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function LatestNewsList() {
  const { data: news, isLoading } = useNews(16);

  if (isLoading) {
    return (
      <section className="container py-4">
        <div className="rounded-lg bg-card p-4">
          <div className="animate-pulse space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  return (
    <section className="container py-4">
      <div className="rounded-lg bg-card border border-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            <h2 className="font-heading text-sm font-bold uppercase tracking-wide">
              Últimas Notícias
            </h2>
          </div>
          <Link
            to="/noticias"
            className="text-xs font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {/* News Grid - Dense list */}
        <div className="grid gap-0 divide-y divide-border md:grid-cols-2 md:divide-y-0">
          {news.map((item, index) => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className={`group flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? "md:border-r md:border-border" : ""
              }`}
            >
              {/* Category bullet */}
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                style={{
                  backgroundColor: item.category?.color || "hsl(var(--primary))",
                }}
              />
              {/* Content */}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary">
                  {item.title}
                </h3>
              </div>
              {/* Time */}
              <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {item.published_at && formatTimeAgo(item.published_at)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
