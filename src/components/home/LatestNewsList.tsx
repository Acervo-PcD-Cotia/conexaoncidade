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
  const { data: news, isLoading } = useNews(20);

  if (isLoading) {
    return (
      <section className="container py-2">
        <div className="rounded-lg bg-card p-3">
          <div className="animate-pulse space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded w-full" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!news || news.length === 0) return null;

  // Split: first 5 are "AGORA"
  const recentNews = news.slice(0, 5);
  const olderNews = news.slice(5);

  return (
    <section className="container py-2">
      <div className="rounded-lg bg-card border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-primary" />
            <h2 className="font-heading text-xs font-bold uppercase tracking-wide">
              Últimas Notícias
            </h2>
          </div>
          <Link
            to="/noticias"
            className="text-[10px] font-medium text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {/* AGORA section - most recent 5 */}
        <div className="border-b border-primary/20 bg-primary/5">
          <div className="px-3 py-1 border-b border-border/50">
            <span className="text-[10px] font-bold uppercase text-primary tracking-wider">Agora</span>
          </div>
          <div className="grid gap-0 divide-y divide-border/50 md:grid-cols-2 md:divide-y-0">
            {recentNews.map((item, index) => (
              <Link
                key={item.id}
                to={`/noticia/${item.slug}`}
                className={`group flex items-start gap-2 px-3 py-1.5 transition-colors hover:bg-primary/10 ${
                  index % 2 === 0 ? "md:border-r md:border-border/50" : ""
                }`}
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: item.category?.color || "hsl(var(--primary))",
                  }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-medium leading-snug line-clamp-1 group-hover:text-primary">
                    {item.title}
                  </h3>
                </div>
                <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-2.5 w-2.5" />
                  {item.published_at && formatTimeAgo(item.published_at)}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Older news - Dense list */}
        <div className="grid gap-0 divide-y divide-border md:grid-cols-2 md:divide-y-0">
          {olderNews.map((item, index) => (
            <Link
              key={item.id}
              to={`/noticia/${item.slug}`}
              className={`group flex items-start gap-2 px-3 py-1.5 transition-colors hover:bg-muted/50 ${
                index % 2 === 0 ? "md:border-r md:border-border" : ""
              }`}
            >
              <span
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                style={{
                  backgroundColor: item.category?.color || "hsl(var(--primary))",
                }}
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-medium leading-snug line-clamp-1 group-hover:text-primary">
                  {item.title}
                </h3>
              </div>
              <div className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="h-2.5 w-2.5" />
                {item.published_at && formatTimeAgo(item.published_at)}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
